import { useEffect, useState } from "react";
import useAuthApi from "../../../../api/useAuthApi";
import "../../../../styles/settlementpopup.css";

const luhn = (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits.length) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (shouldDouble) {
            digit *= 2;
            
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
};

const formatCardNumber = (raw) =>
    raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const expiryToISODate = (mmyy) => {
    const [mm, yy] = mmyy.split("/");
    if (!mm || !yy) return null;
    return `20${yy}-${mm.padStart(2, "0")}-01`;
};

const PAYMENT_METHODS = { CASH: "CASH", CARD: "CARD" };

const DEFAULT_FORM = {
    settled_amount:   "",
    card_number:      "",
    card_expiry_date: "",
    cvv:              "",
    name_on_card:     ""
};

const SettlementPopup = ({ jobcard_id = 0, onSuccess, onClose }) => {
    const { callApi } = useAuthApi();

    const [summary,       setSummary]       = useState(null);
    const [isLoading,     setIsLoading]     = useState(false);
    const [isSaving,      setIsSaving]      = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);
    const [form,          setForm]          = useState(DEFAULT_FORM);
    const [errors,        setErrors]        = useState({});

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const res = await callApi({
                    url:    `/api/jobcard/settlementdetail/${jobcard_id}`,
                    method: "GET"
                });

                if (res?.[0]) {
                    const data = res[0];
                    setSummary(res);
                    
                    setForm((prev) => ({
                        ...prev,
                        settled_amount: data.jobcard_total_amount ?? ""
                    }));
                }
            } finally {
                console.log(summary)
                setIsLoading(false);
            }
        };
        load();
    }, [jobcard_id]);

    const updateForm = (name, value) => {
        let formatted = value;
        if (name === "card_number")      formatted = formatCardNumber(value);
        if (name === "card_expiry_date") formatted = formatExpiry(value);
        if (name === "cvv")              formatted = value.replace(/\D/g, "").slice(0, 4);
        setForm((prev) => ({ ...prev, [name]: formatted }));
    };

    const switchMethod = (method) => {
        setPaymentMethod(method);
        setErrors({});
    };

    const validate = () => {
        const next = {};
        const amount = parseFloat(form.settled_amount);

        if (!form.settled_amount || isNaN(amount) || amount <= 0)
            next.settled_amount = "Enter a valid amount";

        if (paymentMethod === PAYMENT_METHODS.CARD) {
            const rawCard = form.card_number.replace(/\D/g, "");

            if (!rawCard || rawCard.length < 13)
                next.card_number = "Enter a valid card number";
            else if (!luhn(rawCard))
                next.card_number = "Card number is invalid (failed Luhn check)";

            if (!form.card_expiry_date || form.card_expiry_date.length < 5)
                next.card_expiry_date = "Enter a valid expiry (MM/YY)";

            if (!form.cvv || form.cvv.length < 3)
                next.cvv = "Enter a valid CVV";

            if (!form.name_on_card.trim())
                next.name_on_card = "Name on card is required";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSettle = async () => {
        if (!validate()) return;

        const isCash = paymentMethod === PAYMENT_METHODS.CASH;

        setIsSaving(true);
        try {
            const res = await callApi({
                url:    "/api/jobcard/settle",
                method: "POST",
                body: {
                    from_app:         false,
                    jobcard_id,
                    payment_method:   paymentMethod,
                    settled_amount:   parseFloat(form.settled_amount),
                    card_number:      isCash ? "" : form.card_number.replace(/\s/g, ""),
                    card_expiry_date: isCash ? null : expiryToISODate(form.card_expiry_date),
                    name_on_card:     isCash ? "" : form.name_on_card
                },
                showToast: true
            });

            if (res) {
                onSuccess?.();
                onClose?.();
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <p className="sp-loading">Loading settlement details...</p>;
    }

    return (
        <div className="sp-root">

            {}
            {summary && (
                <div className="sp-summary-card">
                    <div className="sp-summary-row">
                        <span className="sp-summary-label">Job Card</span>
                        <span className="sp-summary-value">{summary[1].jobcard_number ?? "-"}</span>
                    </div>
                    <div className="sp-summary-row">
                        <span className="sp-summary-label">Customer</span>
                        <span className="sp-summary-value">{summary[1].customer_name ?? "-"}</span>
                    </div>
                    <div className="sp-summary-row">
                        <span className="sp-summary-label">Vehicle</span>
                        <span className="sp-summary-value">{summary[1].vehicle_registration_number ?? "-"}</span>
                    </div>
                    <div className="sp-summary-divider" />
                    <div className="sp-summary-row">
                        <span className="sp-summary-label">Total Amount</span>
                        <span className="sp-summary-value--highlight">
                            Rs. {Number(summary[0].jobcard_total_amount ?? 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            )}

            {}
            <div className="sp-toggle-group">
                {Object.values(PAYMENT_METHODS).map((method) => (
                    <button
                        key={method}
                        type="button"
                        className={`sp-toggle-btn${paymentMethod === method ? " sp-toggle-btn--active" : ""}`}
                        onClick={() => switchMethod(method)}
                    >
                        {method === PAYMENT_METHODS.CASH ? "Cash" : "Card"}
                    </button>
                ))}
            </div>

            {}
            <div className="sp-fields">

                {}
                {paymentMethod === PAYMENT_METHODS.CARD && (
                    <>
                        <div className="sp-field-group">
                            <label className="sp-field-label">Card Number</label>
                            <input
                                className={`sp-field-input${errors.card_number ? " sp-field-input--error" : ""}`}
                                placeholder="XXXX XXXX XXXX XXXX"
                                value={form.card_number}
                                onChange={(e) => updateForm("card_number", e.target.value)}
                            />
                            {errors.card_number
                                ? <span className="sp-field-error">{errors.card_number}</span>
                                : ""
                            }
                        </div>

                        <div className="sp-row">
                            <div className="sp-field-group">
                                <label className="sp-field-label">Expiry Date</label>
                                <input
                                    className={`sp-field-input${errors.card_expiry_date ? " sp-field-input--error" : ""}`}
                                    placeholder="MM/YY"
                                    value={form.card_expiry_date}
                                    onChange={(e) => updateForm("card_expiry_date", e.target.value)}
                                />
                                {errors.card_expiry_date && (
                                    <span className="sp-field-error">{errors.card_expiry_date}</span>
                                )}
                            </div>

                            <div className="sp-field-group">
                                <label className="sp-field-label">CVV</label>
                                <input
                                    className={`sp-field-input${errors.cvv ? " sp-field-input--error" : ""}`}
                                    placeholder="..."
                                    type="password"
                                    value={form.cvv}
                                    onChange={(e) => updateForm("cvv", e.target.value)}
                                />
                                {errors.cvv && (
                                    <span className="sp-field-error">{errors.cvv}</span>
                                )}
                            </div>
                        </div>

                        <div className="sp-field-group">
                            <label className="sp-field-label">Name on Card</label>
                            <input
                                className={`sp-field-input${errors.name_on_card ? " sp-field-input--error" : ""}`}
                                placeholder="As printed on card"
                                value={form.name_on_card}
                                onChange={(e) => updateForm("name_on_card", e.target.value)}
                            />
                            {errors.name_on_card && (
                                <span className="sp-field-error">{errors.name_on_card}</span>
                            )}
                        </div>
                    </>
                )}

                {}
                <div className="sp-field-group">
                    <label className="sp-field-label">
                        {paymentMethod === PAYMENT_METHODS.CASH ? "Amount Received (Rs.)" : "Amount to Charge (Rs.)"}
                    </label>
                    <input
                        className={`sp-field-input${errors.settled_amount ? " sp-field-input--error" : ""}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={form.settled_amount}
                        disabled
                    />
                    {errors.settled_amount && (
                        <span className="sp-field-error">{errors.settled_amount}</span>
                    )}
                </div>

            </div>

            {}
            <div className="sp-footer">
                <button
                    type="button"
                    className="sp-btn-cancel"
                    onClick={onClose}
                    disabled={isSaving}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="sp-btn-settle"
                    onClick={handleSettle}
                    disabled={isSaving}
                >
                    {isSaving ? "Processing..." : "Settle"}
                </button>
            </div>

        </div>
    );
};

export default SettlementPopup;
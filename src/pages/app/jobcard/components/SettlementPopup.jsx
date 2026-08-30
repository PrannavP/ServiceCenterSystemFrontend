import { useEffect, useState } from "react";
import useAuthApi from "../../../../api/useAuthApi";
import "../../../../styles/Settlementpopup.css";

// ---------------------------------------------------------------------------
// Luhn Algorithm — Credit / Debit Card Number Validation
// ---------------------------------------------------------------------------
//
// The Luhn algorithm (also known as the "modulus 10" algorithm) is a simple
// checksum formula used to validate identification numbers such as credit
// card numbers. It was designed by IBM scientist Hans Peter Luhn in 1954.
//
// HOW IT WORKS (right to left):
//
//   Given the card number: 4 5 3 9 1 4 8 8 0 3 4 3 6 4 6 7
//
//   Step 1 — Keep the last digit (check digit) aside.
//             It will be used at the end to verify.
//
//   Step 2 — Starting from the second-to-last digit, moving left,
//             double every second digit.
//
//   Step 3 — If doubling produces a number > 9, subtract 9 from it.
//             (Equivalent to summing the two digits of the product.)
//             e.g. 8 x 2 = 16 -> 16 - 9 = 7
//
//   Step 4 — Sum all the digits (both the doubled and the untouched ones)
//             plus the check digit from Step 1.
//
//   Step 5 — If the total modulo 10 === 0, the number is valid.
//
// EXAMPLE with card "4539148803436467":
//   Digits (R->L skip check): 6,4,3,4,0,8,8,4,1,9,3,5,4  <- every other doubled
//   This produces a total that is divisible by 10 -> VALID
//
// WHY IT MATTERS:
//   The algorithm catches ~98% of single-digit errors and all transpositions
//   of adjacent digits (except 0<->9). It is NOT a cryptographic check — it
//   only confirms the number is structurally plausible, not that the card exists.
//
// ---------------------------------------------------------------------------
const luhn = (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits.length) return false;

    let sum = 0;
    let shouldDouble = false;

    // Traverse digits from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (shouldDouble) {
            digit *= 2;
            // If doubling exceeds 9, subtract 9 (same as summing both digits)
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format raw digits as "XXXX XXXX XXXX XXXX" as the user types. */
const formatCardNumber = (raw) =>
    raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

/** Format raw digits as "MM/YY" as the user types. */
const formatExpiry = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

/**
 * Convert display value "MM/YY" to ISO date "YYYY-MM-01".
 * e.g. "08/27" -> "2027-08-01"
 * Day is always 01 — only month/year carry meaning for card expiry.
 */
const expiryToISODate = (mmyy) => {
    const [mm, yy] = mmyy.split("/");
    if (!mm || !yy) return null;
    return `20${yy}-${mm.padStart(2, "0")}-01`;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAYMENT_METHODS = { CASH: "CASH", CARD: "CARD" };

const DEFAULT_FORM = {
    settled_amount:   "",
    card_number:      "",
    card_expiry_date: "",
    cvv:              "",
    name_on_card:     ""
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SettlementPopup = ({ jobcard_id = 0, onSuccess, onClose }) => {
    const { callApi } = useAuthApi();

    const [summary,       setSummary]       = useState(null);
    const [isLoading,     setIsLoading]     = useState(false);
    const [isSaving,      setIsSaving]      = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);
    const [form,          setForm]          = useState(DEFAULT_FORM);
    const [errors,        setErrors]        = useState({});

    // ── On mount: load job card summary and pre-fill the amount ──────────
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
                    // Pre-fill amount from the API and lock the field
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

    // ── Update a form field, applying formatting for card-specific fields ─
    const updateForm = (name, value) => {
        let formatted = value;
        if (name === "card_number")      formatted = formatCardNumber(value);
        if (name === "card_expiry_date") formatted = formatExpiry(value);
        if (name === "cvv")              formatted = value.replace(/\D/g, "").slice(0, 4);
        setForm((prev) => ({ ...prev, [name]: formatted }));
    };

    // ── Switch payment method and clear field errors ───────────────────
    const switchMethod = (method) => {
        setPaymentMethod(method);
        setErrors({});
    };

    // ── Validate required fields for the active payment method ────────
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

    // ── Submit settlement ─────────────────────────────────────────────
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

    // ── Render ────────────────────────────────────────────────────────
    if (isLoading) {
        return <p className="sp-loading">Loading settlement details...</p>;
    }

    return (
        <div className="sp-root">

            {/* Job card summary */}
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

            {/* Payment method toggle */}
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

            {/* Fields */}
            <div className="sp-fields">

                {/* Card-only fields */}
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

                {/* Amount — shown for both methods, pre-filled and locked */}
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

            {/* Footer */}
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
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";

import "../../../styles/form.css";

import useAuthApi from "../../../api/useAuthApi";

const defaultForm = {
    remarks: "",
    number: "",
    is_active: true,
    detail: []
};

const parseActive = (value) =>
    value === true ||
    value === 1 ||
    value === "true" ||
    value === "1";

const getEmptyDetail = () => ({
    part_id: "",
    quantity: 1,
    rate: 0,
    total: 0
});

const getResponseData = (res) => {
    if (res?.receipt)
        return res;

    if (res?.data?.receipt)
        return res.data;

    if (res?.data?.data?.receipt)
        return res.data.data;

    return null;
};

export default function ReceiptManagePage({ isEdit = false }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const { callApi } = useAuthApi();

    const [form, setForm] = useState(defaultForm);
    const [receiptId, setReceiptId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [partsDDL, setPartsDDL] = useState([]);

    // call the loaddl api on page loads
    useEffect(() => {
        loadDDlData()
    }, []);

    const loadDDlData = async () => {
        debugger
        const loadDDLRes = await callApi({
            url: '/api/receipt/loadddl',
            method: "GET"
        });

        if(loadDDLRes){
            setPartsDDL(loadDDLRes);
        }
    }

    useEffect(() => {
        if (!isEdit || !id) {
            setForm(defaultForm);
            setReceiptId(null);
            setErrors({});
            return;
        }

        let isMounted = true;

        const loadReceipt = async () => {
            setLoading(true);

            try {
                const res = await callApi({
                    url: `/api/receipt/get/${id}`,
                    method: "GET"
                });

                const responseData = getResponseData(res);

                if (!isMounted || !responseData?.receipt)
                    return;

                const receiptDetails =
                    responseData.details ||
                    responseData.detail ||
                    [];
                const { receipt } = responseData;

                setReceiptId(receipt.receipt_id || null);
                setForm({
                    remarks: receipt.remarks || "",
                    number: receipt.number || "",
                    is_active: parseActive(receipt.is_active),
                    detail: receiptDetails.map((item) => ({
                        part_id: item.part_id ? String(item.part_id) : "",
                        quantity: Number(item.quantity) || 1,
                        rate: Number(item.rate) || 0,
                        total:
                            Number(item.total) ||
                            (Number(item.quantity) || 0) * (Number(item.rate) || 0)
                    }))
                });
            } finally {
                if (isMounted)
                    setLoading(false);
            }
        };

        loadReceipt();

        return () => {
            isMounted = false;
        };
    }, [id, isEdit]);

    const updateField = (name, value) => {
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const updateDetail = (index, name, value) => {
        setForm((prev) => ({
            ...prev,
            detail: prev.detail.map((item, i) => {
                if (i !== index)
                    return item;

                const nextItem = {
                    ...item,
                    [name]: value
                };

                const quantity = Number(nextItem.quantity) || 0;
                const rate = Number(nextItem.rate) || 0;

                return {
                    ...nextItem,
                    total: quantity * rate
                };
            })
        }));
    };

    const addDetail = () => {
        setForm((prev) => ({
            ...prev,
            detail: [...prev.detail, getEmptyDetail()]
        }));
    };

    const removeDetail = (index) => {
        setForm((prev) => ({
            ...prev,
            detail: prev.detail.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.number.trim())
            nextErrors.number = "Receipt number required";

        if (!form.detail.length)
            nextErrors.detail = "Add at least one part";

        form.detail.forEach((item, index) => {
            if (!item.part_id)
                nextErrors[`detail_${index}_part_id`] = "Part required";

            if (!Number(item.quantity) || Number(item.quantity) < 1)
                nextErrors[`detail_${index}_quantity`] = "Quantity required";

            if (Number(item.rate) < 0 || item.rate === "")
                nextErrors[`detail_${index}_rate`] = "Rate required";
        });

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const cancelOrClear = () => {
        if (isEdit) {
            navigate("/inv/receipt");
            return;
        }

        setForm(defaultForm);
        setErrors({});
    };

    const submit = async (event) => {
        event.preventDefault();

        if (!validate())
            return;

        setSaving(true);

        console.log(form)

        const payload = {
            remarks: form.remarks,
            number: form.number,
            is_active: form.is_active,
            details: form.detail.map((item) => ({
                part_id: Number(item.part_id),
                quantity: Number(item.quantity),
                rate: Number(item.rate),
                total: Number(item.total)
            }))
        };

        try {
            const response = await callApi({
                url: isEdit
                    ? `/api/receipt/update/${id}`
                    : "/api/receipt/create",
                method: "POST",
                body: payload,
                showToast: true
            });

            if (response)
                navigate("/inv/receipt");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="form-page">
            <div className="form-card">
                <div className="form-card-header">
                    <h2>{isEdit ? "Edit Receipt" : "Create Receipt"}</h2>
                </div>

                <div className="form-card-body">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <form onSubmit={submit}>
                            <div className="form-grid">
                                <Input
                                    label="Receipt Number"
                                    name="number"
                                    value={form.number}
                                    onChange={updateField}
                                    error={errors.number}
                                />

                                <div className="form-group">
                                    <label className="form-label">
                                        Status
                                    </label>

                                    <label className="toggle-row">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(event) =>
                                                updateField("is_active", event.target.checked)
                                            }
                                        />
                                        <span>{form.is_active ? "Active" : "Inactive"}</span>
                                    </label>
                                </div>

                                <div className="form-group col-4">
                                    <label className="form-label">
                                        Remarks
                                    </label>

                                    <textarea
                                        className="form-input"
                                        value={form.remarks}
                                        onChange={(event) =>
                                            updateField("remarks", event.target.value)
                                        }
                                    />
                                </div>

                                <div className="jobcard-section col-4">
                                    <div className="section-header">
                                        <h3>Receipt Parts</h3>

                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={addDetail}
                                        >
                                            <FiPlus size={15} />
                                            Add Part
                                        </button>
                                    </div>

                                    <div className="detail-table-wrap">
                                        <table className="detail-table">
                                            <thead>
                                                <tr>
                                                    <th>Part</th>
                                                    <th>Qty</th>
                                                    <th>Rate</th>
                                                    <th>Total</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {form.detail.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <select
                                                                className="form-input"
                                                                value={item.part_id}
                                                                onChange={(event) =>
                                                                    updateDetail(
                                                                        index,
                                                                        "part_id",
                                                                        event.target.value
                                                                    )
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select part
                                                                </option>
                                                                {partsDDL.map((option) => (
                                                                    <option
                                                                        key={option.id}
                                                                        value={option.id}
                                                                    >
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <span className="form-error">
                                                                {errors[`detail_${index}_part_id`]}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <input
                                                                className="form-input"
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(event) =>
                                                                    updateDetail(
                                                                        index,
                                                                        "quantity",
                                                                        event.target.value
                                                                    )
                                                                }
                                                            />
                                                            <span className="form-error">
                                                                {errors[`detail_${index}_quantity`]}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <input
                                                                className="form-input"
                                                                type="number"
                                                                min="0"
                                                                value={item.rate}
                                                                onChange={(event) =>
                                                                    updateDetail(
                                                                        index,
                                                                        "rate",
                                                                        event.target.value
                                                                    )
                                                                }
                                                            />
                                                            <span className="form-error">
                                                                {errors[`detail_${index}_rate`]}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <input
                                                                readOnly
                                                                className="form-input total-input"
                                                                value={item.total}
                                                            />
                                                        </td>

                                                        <td className="action-cell">
                                                            <button
                                                                type="button"
                                                                className="icon-btn icon-btn-danger"
                                                                title="Remove part"
                                                                aria-label="Remove part"
                                                                onClick={() => removeDetail(index)}
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {!form.detail.length && (
                                                    <tr>
                                                        <td
                                                            className="detail-empty"
                                                            colSpan="5"
                                                        >
                                                            No parts added.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <span className="form-error">
                                        {errors.detail}
                                    </span>
                                </div>

                                <div className="form-footer col-4">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={cancelOrClear}
                                    >
                                        <FiX size={16} />
                                        {isEdit ? "Cancel" : "Clear"}
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn btn-primary"
                                    >
                                        <FiSave size={16} />
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function Input({
    label,
    name,
    value,
    onChange,
    error
}) {
    return (
        <div className="form-group">
            <label className="form-label">
                {label}
            </label>

            <input
                className="form-input"
                value={value}
                onChange={(event) => onChange(name, event.target.value)}
            />

            <span className="form-error">
                {error}
            </span>
        </div>
    );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";

import "../../../styles/form.css";

import useAuthApi from "../../../api/useAuthApi";
import { toast } from "react-toastify";
import AddableSelect from "../../../components/AddableSelect/AddableSelect";

// ---------------------------------------------------------------------------
// Inline style for the table-header info icon tooltip
// (avoids adding a CSS file dependency for a single element)
// ---------------------------------------------------------------------------
const infoIconStyle = {
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    width:          "14px",
    height:         "14px",
    fontSize:       "11px",
    lineHeight:     1,
    borderRadius:   "50%",
    border:         "1px solid currentColor",
    color:          "#6b7280",
    cursor:         "help",
    userSelect:     "none",
    flexShrink:     0
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_FORM = {
    customer_name: "",
    customer_address: "",
    contact_number: "",
    static_vehicle_type_id: "",
    static_vehicle_id: "",
    vehicle_registration_number: "",
    odometer_reading: "",
    fuel_quantity: "",
    chasis_number: "",
    problems: [""],
    remarks: "",
    detail: []
};

const getEmptyDetail = () => ({
    part_id: "",
    available_qty: 0,
    quantity: 1,
    rate: 0,
    total: 0,
    remarks: ""
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert API rows to { value, label } options for selects. */
const toOptions = (rows = []) =>
    rows.map((r) => ({ value: String(r.id), label: r.name ?? r.label }));

/**
 * Unwrap the jobcard + details from various API response shapes.
 * Returns { jobcard, details } or null.
 */
const extractJobcardData = (res) => {
    if (res?.jobcard)           return res;
    if (res?.data?.jobcard)     return res.data;
    if (res?.data?.data?.jobcard) return res.data.data;
    return null;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function JobcardManagePage({ isEdit = false }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const { callApi } = useAuthApi();

    const [form, setForm] = useState(DEFAULT_FORM);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Dropdown data
    const [partsDDL, setPartsDDL] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    // -----------------------------------------------------------------------
    // Data loading
    // -----------------------------------------------------------------------

    useEffect(() => {
        loadVehicleDropdowns();
    }, []);

    const loadVehicleDropdowns = async () => {
        const [types, models] = await Promise.all([
            callApi({ url: "/api/static/vehicle-types", method: "GET" }),
            callApi({ url: "/api/static/vehicles",      method: "GET" }),
        ]);
        if (Array.isArray(types))  setVehicleTypes(toOptions(types));
        if (Array.isArray(models)) setVehicles(toOptions(models));
    };

    // Load parts DDL and (when editing) the jobcard together so that
    // available_qty can be computed synchronously in one pass — no
    // secondary effect needed.
    useEffect(() => {
        if (!isEdit || !id) {
            // Create mode: just load the parts DDL for the part selector.
            const loadParts = async () => {
                const res = await callApi({ url: "/api/jobcard/loadddl", method: "GET" });
                if (res) setPartsDDL(res);
            };
            loadParts();
            setForm(DEFAULT_FORM);
            setErrors({});
            return;
        }

        let cancelled = false;

        const loadJobcard = async () => {
            setLoading(true);
            try {
                // Fetch parts DDL and jobcard data in parallel.
                const [parts, res] = await Promise.all([
                    callApi({ url: "/api/jobcard/loadddl", method: "GET" }),
                    callApi({ url: `/api/jobcard/get/${id}`, method: "GET" })
                ]);

                if (cancelled) return;

                // Parts DDL is available for the rest of the session too.
                const ddl = Array.isArray(parts) ? parts : [];
                setPartsDDL(ddl);

                const data = extractJobcardData(res);
                if (!data?.jobcard) return;

                const { jobcard, details = [] } = data;

                // Build a quick lookup so we can compute available_qty inline.
                // The DDL returns stock AFTER deducting this job card's committed
                // qty (because the view counts all active detail rows). We add
                // the committed qty back so the field shows the full effective
                // available stock the user can work with.
                const partMap = new Map(ddl.map((p) => [String(p.id), p]));

                setForm({
                    customer_name:               jobcard.customer_name               || "",
                    customer_address:            jobcard.customer_address            || "",
                    contact_number:              jobcard.contact_number              || "",
                    static_vehicle_type_id:      jobcard.static_vehicle_type_id  ? String(jobcard.static_vehicle_type_id) : "",
                    static_vehicle_id:           jobcard.static_vehicle_id       ? String(jobcard.static_vehicle_id)      : "",
                    vehicle_registration_number: jobcard.vehicle_registration_number || "",
                    odometer_reading:            jobcard.odometer_reading            || "",
                    fuel_quantity:               jobcard.fuel_quantity               || "",
                    chasis_number:               jobcard.chasis_number               || "",
                    problems: Array.isArray(jobcard.problems) && jobcard.problems.length
                        ? jobcard.problems
                        : [""],
                    remarks: jobcard.remarks || "",
                    detail: details.map((item) => {
                        const quantity    = Number(item.quantity) || 1;
                        const rate        = Number(item.rate)     || 0;
                        const part        = partMap.get(String(item.part_id));
                        const stockInView = Number(part?.available_qty) || 0;

                        return {
                            part_id:       item.part_id ? String(item.part_id) : "",
                            // View already deducted this job card's qty, so add it back.
                            available_qty: stockInView + quantity,
                            quantity,
                            rate:          rate || Number(part?.rate) || 0,
                            total:         Number(item.total) || quantity * rate,
                            remarks:       item.remarks || ""
                        };
                    })
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadJobcard();
        return () => { cancelled = true; };
    }, [id, isEdit]);

    // -----------------------------------------------------------------------
    // Inline creation helpers (vehicle type / vehicle / part)
    // -----------------------------------------------------------------------

    const createVehicleType = async (name) => {
        const res = await callApi({
            url: "/api/static/vehicle-types",
            method: "POST",
            body: { name },
            showToast: true
        });
        if (!res) return null;

        const option = { value: String(res.id), label: res.name };
        setVehicleTypes((prev) => [...prev, option]);
        return option;
    };

    const createVehicle = async (name) => {
        const res = await callApi({
            url: "/api/static/vehicles",
            method: "POST",
            body: { name, vehicle_type_id: form.static_vehicle_type_id || null },
            showToast: true
        });
        if (!res) return null;

        const option = { value: String(res.id), label: res.name };
        setVehicles((prev) => [...prev, option]);
        return option;
    };

    const createPart = async (name) => {
        const res = await callApi({
            url: "/api/part/create",
            method: "POST",
            body: { name, part_number: `P-${Date.now()}`, is_active: true },
            showToast: true
        });
        if (!res) return null;

        const entry = { id: res.id, label: res.name || name, rate: 0, available_qty: 0 };
        setPartsDDL((prev) => [...prev, entry]);
        return { value: String(res.id), label: entry.label };
    };

    // -----------------------------------------------------------------------
    // Form field updaters
    // -----------------------------------------------------------------------

    const updateField = (name, value) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    // Problems list
    const addProblem    = () => setForm((prev) => ({ ...prev, problems: [...prev.problems, ""] }));
    const removeProblem = (index) =>
        setForm((prev) => ({
            ...prev,
            problems: prev.problems.length > 1
                ? prev.problems.filter((_, i) => i !== index)
                : [""]   // keep at least one empty row
        }));
    const updateProblem = (index, value) =>
        setForm((prev) => ({
            ...prev,
            problems: prev.problems.map((p, i) => (i === index ? value : p))
        }));

    // Parts / Labour detail rows
    const addDetail    = () => setForm((prev) => ({ ...prev, detail: [...prev.detail, getEmptyDetail()] }));
    const removeDetail = (index) =>
        setForm((prev) => ({ ...prev, detail: prev.detail.filter((_, i) => i !== index) }));

    /** Update any field on a detail row and keep total in sync. */
    const updateDetail = (index, name, value) => {
        setForm((prev) => ({
            ...prev,
            detail: prev.detail.map((item, i) => {
                if (i !== index) return item;

                let updated = { ...item, [name]: value };

                // Cap quantity to available stock
                if (name === "quantity" && Number(value) > Number(item.available_qty)) {
                    toast.warn(`Only ${Number(item.available_qty)} in stock for this part.`);
                    updated.quantity = Number(item.available_qty);
                }

                updated.total = Number(updated.quantity || 0) * (Number(updated.rate) || 0);
                return updated;
            })
        }));
    };

    /** Select (or change) the part for a detail row; resets rate/qty from DDL data. */
    const updatePart = (index, partId) => {
        const part = partsDDL.find((p) => String(p.id) === String(partId));
        const rate         = Number(part?.rate)          || 0;
        const availableQty = Number(part?.available_qty) || 0;

        setForm((prev) => ({
            ...prev,
            detail: prev.detail.map((item, i) =>
                i !== index ? item : {
                    ...item,
                    part_id:       partId,
                    available_qty: availableQty,
                    quantity:      1,
                    rate,
                    total:         rate   // qty = 1, so total = rate
                }
            )
        }));
    };

    // -----------------------------------------------------------------------
    // Derived data
    // -----------------------------------------------------------------------

    /**
     * Build the parts options for a specific detail row.
     * Parts already selected in OTHER rows are excluded to prevent duplicates.
     */
    const getAvailablePartOptions = (rowIndex) => {
        const usedPartIds = new Set(
            form.detail
                .filter((item, i) => i !== rowIndex && item.part_id)
                .map((item) => String(item.part_id))
        );

        return partsDDL
            .filter((p) => !usedPartIds.has(String(p.id)))
            .map((p) => ({ value: String(p.id), label: p.label }));
    };

    // -----------------------------------------------------------------------
    // Validation & submit
    // -----------------------------------------------------------------------

    const validate = () => {
        const next = {};

        if (!form.customer_name.trim())
            next.customer_name = "Customer name required";

        if (!/^[0-9]{10}$/.test(form.contact_number))
            next.contact_number = "Invalid contact number";

        if (!form.vehicle_registration_number.trim())
            next.vehicle_registration_number = "Vehicle number required";

        if (!form.static_vehicle_type_id)
            next.static_vehicle_type_id = "Vehicle type required";

        if (!form.static_vehicle_id)
            next.static_vehicle_id = "Vehicle required";

        if (!form.problems.some((p) => p.trim()))
            next.problems = "At least one problem is required";

        if (!form.detail.length)
            next.detail = "Add at least one part";

        form.detail.forEach((item, index) => {
            if (!item.part_id)
                next[`detail_${index}_part_id`] = "Part required";

            if (!Number(item.quantity) || Number(item.quantity) < 1)
                next[`detail_${index}_quantity`] = "Quantity required";

            if (item.rate === "" || Number(item.rate) < 0)
                next[`detail_${index}_rate`] = "Rate required";
        });

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const submit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const payload = {
                customer_name:               form.customer_name,
                customer_address:            form.customer_address,
                contact_number:              form.contact_number,
                static_vehicle_type_id:      Number(form.static_vehicle_type_id),
                static_vehicle_id:           Number(form.static_vehicle_id),
                vehicle_registration_number: form.vehicle_registration_number,
                odometer_reading:            form.odometer_reading,
                fuel_quantity:               form.fuel_quantity,
                chasis_number:               form.chasis_number,
                problems: form.problems.filter((p) => p.trim()),
                remarks:  form.remarks,
                details:  form.detail.map((item) => ({
                    part_id:  Number(item.part_id),
                    quantity: Number(item.quantity),
                    rate:     Number(item.rate),
                    total:    Number(item.total),
                    remarks:  item.remarks || null
                }))
            };

            const res = await callApi({
                url: isEdit ? `/api/jobcard/update/${id}` : "/api/jobcard/create",
                method: "POST",
                body: payload,
                showToast: true
            });

            if (res) navigate("/app/jobcard");
        } finally {
            setSaving(false);
        }
    };

    const cancelOrClear = () => {
        if (isEdit) {
            navigate("/app/jobcard");
        } else {
            setForm(DEFAULT_FORM);
            setErrors({});
        }
    };

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        <div className="form-page">
            <div className="form-card">
                <div className="form-card-header">
                    <h2>{isEdit ? "Edit Job Card" : "Create Job Card"}</h2>
                </div>

                <div className="form-card-body">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <form onSubmit={submit}>
                            <div className="form-sections">

                                {/* ── Customer Details ─────────────────────── */}
                                <section className="jobcard-section">
                                    <div className="section-header">
                                        <h3>Customer Details</h3>
                                    </div>
                                    <div className="form-grid">
                                        <Input
                                            label="Customer Name"
                                            name="customer_name"
                                            value={form.customer_name}
                                            onChange={updateField}
                                            error={errors.customer_name}
                                        />
                                        <Input
                                            label="Customer Address"
                                            name="customer_address"
                                            value={form.customer_address}
                                            onChange={updateField}
                                        />
                                        <Input
                                            label="Contact"
                                            name="contact_number"
                                            value={form.contact_number}
                                            onChange={updateField}
                                            error={errors.contact_number}
                                        />
                                    </div>
                                </section>

                                {/* ── Vehicle Details ───────────────────────── */}
                                <section className="jobcard-section">
                                    <div className="section-header">
                                        <h3>Vehicle Details</h3>
                                    </div>
                                    <div className="form-grid">
                                        <Input
                                            label="Vehicle No"
                                            name="vehicle_registration_number"
                                            value={form.vehicle_registration_number}
                                            onChange={updateField}
                                            error={errors.vehicle_registration_number}
                                        />
                                        <AddableSelect
                                            label="Vehicle Type"
                                            value={form.static_vehicle_type_id}
                                            options={vehicleTypes}
                                            onChange={(value) => updateField("static_vehicle_type_id", value)}
                                            onCreate={createVehicleType}
                                            error={errors.static_vehicle_type_id}
                                        />
                                        <AddableSelect
                                            label="Vehicle"
                                            value={form.static_vehicle_id}
                                            options={vehicles}
                                            onChange={(value) => updateField("static_vehicle_id", value)}
                                            onCreate={createVehicle}
                                            error={errors.static_vehicle_id}
                                        />
                                        <Input
                                            label="Odometer"
                                            name="odometer_reading"
                                            value={form.odometer_reading}
                                            onChange={updateField}
                                        />
                                        <Input
                                            label="Fuel Quantity"
                                            name="fuel_quantity"
                                            value={form.fuel_quantity}
                                            onChange={updateField}
                                        />
                                        <Input
                                            label="Chassis Number"
                                            name="chasis_number"
                                            value={form.chasis_number}
                                            onChange={updateField}
                                        />
                                    </div>
                                </section>

                                {/* ── Problems ──────────────────────────────── */}
                                <section className="jobcard-section">
                                    <div className="section-header">
                                        <h3>Problems</h3>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={addProblem}
                                        >
                                            <FiPlus size={15} />
                                            Add Problem
                                        </button>
                                    </div>

                                    <div className="problem-list">
                                        {form.problems.map((problem, index) => (
                                            <div className="problem-row" key={index}>
                                                <input
                                                    className="form-input"
                                                    value={problem}
                                                    placeholder={`Problem ${index + 1}`}
                                                    onChange={(e) => updateProblem(index, e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    className="icon-btn icon-btn-danger"
                                                    title="Remove problem"
                                                    aria-label="Remove problem"
                                                    onClick={() => removeProblem(index)}
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {errors.problems && (
                                        <span className="form-error">{errors.problems}</span>
                                    )}
                                </section>

                                {/* ── Parts & Labour ────────────────────────── */}
                                <section className="jobcard-section">
                                    <div className="section-header">
                                        <h3>Parts &amp; Labour</h3>
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
                                                    <th>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                                            Available Qty
                                                            {isEdit && (
                                                                <span
                                                                    style={infoIconStyle}
                                                                    title="Maximum quantity you can assign to this job card. Includes what is already committed here plus any remaining free stock."
                                                                >
                                                                    ℹ
                                                                </span>
                                                            )}
                                                        </span>
                                                    </th>
                                                    <th>Qty</th>
                                                    <th>Rate</th>
                                                    <th>Total</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {form.detail.length === 0 && (
                                                    <tr>
                                                        <td className="detail-empty" colSpan="6">
                                                            No parts added.
                                                        </td>
                                                    </tr>
                                                )}

                                                {form.detail.map((item, index) => (
                                                    <tr key={index}>
                                                        {/* Part selector — excludes already-selected parts */}
                                                        <td>
                                                            <AddableSelect
                                                                bare
                                                                placeholder="Select part"
                                                                label="part"
                                                                value={item.part_id}
                                                                options={getAvailablePartOptions(index)}
                                                                onChange={(value) => updatePart(index, value)}
                                                                onCreate={createPart}
                                                            />
                                                            {errors[`detail_${index}_part_id`] && (
                                                                <span className="form-error">
                                                                    {errors[`detail_${index}_part_id`]}
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Available stock (read-only) */}
                                                        <td>
                                                            <input
                                                                className="form-input"
                                                                type="number"
                                                                value={item.available_qty}
                                                                disabled
                                                            />
                                                        </td>

                                                        {/* Quantity */}
                                                        <td>
                                                            <input
                                                                className="form-input"
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateDetail(index, "quantity", e.target.value)}
                                                            />
                                                            {errors[`detail_${index}_quantity`] && (
                                                                <span className="form-error">
                                                                    {errors[`detail_${index}_quantity`]}
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Rate */}
                                                        <td>
                                                            <input
                                                                className="form-input"
                                                                type="number"
                                                                min="0"
                                                                value={item.rate}
                                                                onChange={(e) => updateDetail(index, "rate", e.target.value)}
                                                            />
                                                            {errors[`detail_${index}_rate`] && (
                                                                <span className="form-error">
                                                                    {errors[`detail_${index}_rate`]}
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Total (computed, read-only) */}
                                                        <td>
                                                            <input
                                                                readOnly
                                                                className="form-input total-input"
                                                                value={item.total}
                                                            />
                                                        </td>

                                                        {/* Remove row */}
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
                                            </tbody>
                                        </table>
                                    </div>

                                    {errors.detail && (
                                        <span className="form-error">{errors.detail}</span>
                                    )}
                                </section>

                                {/* ── Remarks ───────────────────────────────── */}
                                <section className="jobcard-section">
                                    <div className="section-header">
                                        <h3>Remarks</h3>
                                    </div>
                                    <textarea
                                        className="form-input"
                                        value={form.remarks}
                                        placeholder="Any additional notes for this job card"
                                        onChange={(e) => updateField("remarks", e.target.value)}
                                    />
                                </section>

                                {/* ── Footer actions ────────────────────────── */}
                                <div className="form-footer">
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Labelled text input with inline error display. */
function Input({ label, name, value, onChange, error }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <input
                className="form-input"
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
            />
            {error && <span className="form-error">{error}</span>}
        </div>
    );
}
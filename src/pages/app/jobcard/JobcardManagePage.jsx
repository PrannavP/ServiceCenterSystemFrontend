import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";

import "../../../styles/form.css";

import useAuthApi from "../../../api/useAuthApi";
import { toast } from "react-toastify";
import AddableSelect from "../../../components/AddableSelect/AddableSelect";

const defaultForm = {
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

const toOptions = (rows) =>
    (rows || []).map((r) => ({ value: String(r.id), label: r.name ?? r.label }));

const getResponseData = (res) => {
    if (res?.jobcard)
        return res;

    if (res?.data?.jobcard)
        return res.data;

    if (res?.data?.data?.jobcard)
        return res.data.data;

    return null;
};

const getEmptyDetail = () => ({
    part_id: "",
    available_qty: 0,
    quantity: 1,
    rate: 0,
    total: 0,
    remarks: ""
});

export default function JobcardManagePage({ isEdit = false }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const { callApi } = useAuthApi();

    const [form, setForm] = useState(defaultForm);
    const [jobcardId, setJobcardId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [partsDDL, setPartsDDL] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        loadDDlData();
        loadVehicleData();
    }, []);

    const loadDDlData = async () => {
        const loadDDLRes = await callApi({
            url: '/api/jobcard/loadddl',
            method: "GET"
        });

        if(loadDDLRes){
            setPartsDDL(loadDDLRes);
        }
    }

    const loadVehicleData = async () => {
        const [types, models] = await Promise.all([
            callApi({ url: "/api/static/vehicle-types", method: "GET" }),
            callApi({ url: "/api/static/vehicles", method: "GET" }),
        ]);
        if (Array.isArray(types)) setVehicleTypes(toOptions(types));
        if (Array.isArray(models)) setVehicles(toOptions(models));
    };

    const createVehicleType = async (name) => {
        const res = await callApi({
            url: "/api/static/vehicle-types",
            method: "POST",
            body: { name },
            showToast: true,
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
            showToast: true,
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
            showToast: true,
        });
        if (!res) return null;
        const option = { id: res.id, label: res.name || name, rate: 0, available_qty: 0 };
        setPartsDDL((prev) => [...prev, option]);
        return { value: String(res.id), label: option.label };
    };

    useEffect(() => {
        if (!isEdit || !id) {
            setForm(defaultForm);
            setJobcardId(null);
            setErrors({});
            return;
        }

        let isMounted = true;

        const loadJobcard = async () => {
            setLoading(true);

            try {
                const res = await callApi({
                    url: `/api/jobcard/get/${id}`,
                    method: "GET"
                });

                const responseData = getResponseData(res);

                if (!isMounted || !responseData?.jobcard)
                    return;

                const { jobcard, details = [] } = responseData;

                setJobcardId(jobcard.jobcard_id || null);
                setForm({
                    customer_name: jobcard.customer_name || "",
                    customer_address: jobcard.customer_address || "",
                    contact_number: jobcard.contact_number || "",
                    static_vehicle_type_id:
                        jobcard.static_vehicle_type_id
                            ? String(jobcard.static_vehicle_type_id)
                            : "",
                    static_vehicle_id:
                        jobcard.static_vehicle_id
                            ? String(jobcard.static_vehicle_id)
                            : "",
                    vehicle_registration_number:
                        jobcard.vehicle_registration_number || "",
                    odometer_reading: jobcard.odometer_reading || "",
                    fuel_quantity: jobcard.fuel_quantity || "",
                    chasis_number: jobcard.chasis_number || "",
                    problems:
                        Array.isArray(jobcard.problems) && jobcard.problems.length
                            ? jobcard.problems
                            : [""],
                    remarks: jobcard.remarks || "",
                    detail: details.map((item) => ({
                        part_id: item.part_id ? String(item.part_id) : "",
                        quantity: Number(item.quantity) || 1,
                        rate: Number(item.rate) || 0,
                        total:
                            Number(item.total) ||
                            (Number(item.quantity) || 0) * (Number(item.rate) || 0),
                        remarks: item.remarks || ""
                    }))
                });
            } finally {
                if (isMounted)
                    setLoading(false);
            }
        };

        loadJobcard();

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

    const updateProblem = (index, value) => {
        setForm((prev) => ({
            ...prev,
            problems: prev.problems.map((problem, i) =>
                i === index ? value : problem
            )
        }));
    };

    const addProblem = () => {
        setForm((prev) => ({
            ...prev,
            problems: [...prev.problems, ""]
        }));
    };

    const removeProblem = (index) => {
        setForm((prev) => ({
            ...prev,
            problems:
                prev.problems.length > 1
                    ? prev.problems.filter((_, i) => i !== index)
                    : [""]
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

            const rate = Number(nextItem.rate) || 0;

            // Cap quantity to the part's available stock.
            if (name === "quantity" && Number(nextItem.quantity) > Number(item.available_qty)) {
                toast.warn(`Only ${Number(item.available_qty)} in stock for this part.`);
                nextItem.quantity = Number(item.available_qty);
            }

            return {
                ...nextItem,
                total:
                    Number(nextItem.quantity || 0) *
                    rate
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

    const updatePart = (index, partId) => {
        const selectedPart = partsDDL.find(
            (part) => String(part.id) === String(partId)
        );

        setForm((prev) => ({
            ...prev,
            detail: prev.detail.map((item, i) => {
                if (i !== index)
                    return item;

                const rate = Number(selectedPart?.rate || 0);

                return {
                    ...item,
                    part_id: partId,
                    rate,
                    available_qty: selectedPart?.available_qty || 0,
                    total: Number(item.quantity || 0) * rate
                };
            })
        }));
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.customer_name.trim())
            nextErrors.customer_name = "Customer name required";

        if (!/^[0-9]{10}$/.test(form.contact_number))
            nextErrors.contact_number = "Invalid contact";

        if (!form.vehicle_registration_number.trim())
            nextErrors.vehicle_registration_number = "Vehicle number required";

        if (!form.static_vehicle_type_id)
            nextErrors.static_vehicle_type_id = "Vehicle type required";

        if (!form.static_vehicle_id)
            nextErrors.static_vehicle_id = "Vehicle required";

        if (!form.problems.some((problem) => problem.trim()))
            nextErrors.problems = "Problem required";

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

    const submit = async (event) => {
        event.preventDefault();

        if (!validate())
            return;

        setSaving(true);

        const payload = {
                customer_name: form.customer_name,
                customer_address: form.customer_address,
                contact_number: form.contact_number,
                static_vehicle_type_id: Number(form.static_vehicle_type_id),
                static_vehicle_id: Number(form.static_vehicle_id),
                vehicle_registration_number: form.vehicle_registration_number,
                odometer_reading: form.odometer_reading,
                fuel_quantity: form.fuel_quantity,
                chasis_number: form.chasis_number,
                problems: form.problems.filter((problem) => problem.trim()),
                remarks: form.remarks,
                details: form.detail.map((item) => ({
                    part_id: Number(item.part_id),
                    quantity: Number(item.quantity),
                    rate: Number(item.rate),
                    total: Number(item.total),
                    remarks: item.remarks || null
                }))
        };

        try {
            const response = await callApi({
                url: isEdit
                    ? `/api/jobcard/update/${id}`
                    : "/api/jobcard/create",
                method: "POST",
                body: payload,
                showToast: true
            });

            if (response)
                navigate("/app/jobcard");
        } finally {
            setSaving(false);
        }
    };

    const cancelOrClear = () => {
        if (isEdit) {
            navigate("/app/jobcard");
            return;
        }

        setForm(defaultForm);
        setErrors({});
    };

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
                                            label="Chasis Number"
                                            name="chasis_number"
                                            value={form.chasis_number}
                                            onChange={updateField}
                                        />
                                    </div>
                                </section>

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
                                                    onChange={(event) =>
                                                        updateProblem(index, event.target.value)
                                                    }
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

                                    <span className="form-error">
                                        {errors.problems}
                                    </span>
                                </section>

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
                                                    <th>Available Qty</th>
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
                                                            <AddableSelect
                                                                bare
                                                                placeholder="Select part"
                                                                label="part"
                                                                value={item.part_id}
                                                                options={partsDDL.map((o) => ({ value: String(o.id), label: o.label }))}
                                                                onChange={(value) => updatePart(index, value)}
                                                                onCreate={createPart}
                                                            />
                                                            <span className="form-error">
                                                                {errors[`detail_${index}_part_id`]}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <input
                                                                className="form-input"
                                                                type="number"
                                                                value={item.available_qty}
                                                                disabled
                                                            />
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
                                                            colSpan="6"
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
                                </section>

                                <section className="jobcard-section">
                                    <div className="section-header">
                                        <h3>Remarks</h3>
                                    </div>
                                    <textarea
                                        className="form-input"
                                        value={form.remarks}
                                        placeholder="Any additional notes for this job card"
                                        onChange={(event) =>
                                            updateField("remarks", event.target.value)
                                        }
                                    />
                                </section>

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

function SelectInput({
    label,
    name,
    value,
    options,
    onChange,
    error
}) {
    return (
        <div className="form-group">
            <label className="form-label">
                {label}
            </label>

            <select
                className="form-input"
                value={value}
                onChange={(event) => onChange(name, event.target.value)}
            >
                <option value="">Select {label}</option>
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            <span className="form-error">
                {error}
            </span>
        </div>
    );
}

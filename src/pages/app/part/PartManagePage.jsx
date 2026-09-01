import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiX } from "react-icons/fi";

import "../../../styles/form.css";

import useAuthApi from "../../../api/useAuthApi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:6969";

const defaultForm = {
    name: "",
    part_number: "",
    is_active: true
};

const parseActive = (value) =>
    value === true ||
    value === 1 ||
    value === "true" ||
    value === "1";

const getResponseData = (res) => {
    if (res?.part)
        return res.part;

    if (res?.data?.part)
        return res.data.part;

    if (res?.data?.data?.part)
        return res.data.data.part;

    return res?.data || res;
};

export default function PartManagePage({ isEdit = false }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const { callApi } = useAuthApi();

    const [form, setForm] = useState(defaultForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);

    useEffect(() => {
        if (!isEdit || !id) {
            setForm(defaultForm);
            setErrors({});
            return;
        }

        let isMounted = true;

        const loadPart = async () => {
            setLoading(true);

            try {
                const res = await callApi({
                    url: `/api/part/get/${id}`,
                    method: "GET"
                });

                const part = getResponseData(res);

                if (!isMounted || !part)
                    return;

                setForm({
                    name: part.name || "",
                    part_number: part.part_number || "",
                    is_active: parseActive(part.is_active)
                });
                setExistingImage(part.image_url || null);
            } finally {
                if (isMounted)
                    setLoading(false);
            }
        };

        loadPart();

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

    const onImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.name.trim())
            nextErrors.name = "Part name required";

        if (!form.part_number.trim())
            nextErrors.part_number = "Part number required";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const cancelOrClear = () => {
        if (isEdit) {
            navigate("/inv/part");
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

        const payload = {
            name: form.name,
            part_number: form.part_number,
            is_active: form.is_active
        };

        if (isEdit)
            payload.part_id = Number(id);

        try {
            if (imageFile) {
                const fd = new FormData();
                fd.append("image", imageFile);
                const up = await callApi({ url: "/api/part/upload", method: "POST", body: fd });
                if (up?.url) payload.image_url = up.url;
            }

            const response = await callApi({
                url: isEdit
                    ? `/api/part/update/${id}`
                    : "/api/part/create",
                method: "POST",
                body: payload,
                showToast: true
            });

            if (response)
                navigate("/inv/part");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="form-page">
            <div className="form-card">
                <div className="form-card-header">
                    <h2>{isEdit ? "Edit Part" : "Create Part"}</h2>
                </div>

                <div className="form-card-body">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <form onSubmit={submit}>
                            <div className="form-grid">
                                <Input
                                    label="Part Name"
                                    name="name"
                                    value={form.name}
                                    onChange={updateField}
                                    error={errors.name}
                                />

                                <Input
                                    label="Part Number"
                                    name="part_number"
                                    value={form.part_number}
                                    onChange={updateField}
                                    error={errors.part_number}
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

                                {}
                                {}

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

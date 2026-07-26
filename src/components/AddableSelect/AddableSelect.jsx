import { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import "../../styles/addableselect.css";

export default function AddableSelect({
    value,
    options = [],
    onChange,
    onCreate,
    label,
    error,
    placeholder,
    bare = false,
}) {
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSelect = (e) => {
        if (e.target.value === "__add__") {
            setAdding(true);
            return;
        }
        onChange(e.target.value);
    };

    const save = async () => {
        const trimmed = name.trim();
        if (!trimmed || saving) return;
        setSaving(true);
        try {
            const created = await onCreate(trimmed);
            if (created && created.value != null) {
                onChange(String(created.value));
                setAdding(false);
                setName("");
            }
        } finally {
            setSaving(false);
        }
    };

    const cancel = () => {
        setAdding(false);
        setName("");
    };

    const control = adding ? (
        <div className="addable-inline">
            <input
                className="form-input"
                autoFocus
                value={name}
                placeholder={`New ${label || "value"}`}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        save();
                    } else if (e.key === "Escape") {
                        cancel();
                    }
                }}
            />
            <button type="button" className="addable-btn addable-save" onClick={save} disabled={saving} title="Save">
                <FiCheck size={16} />
            </button>
            <button type="button" className="addable-btn addable-cancel" onClick={cancel} title="Cancel">
                <FiX size={16} />
            </button>
        </div>
    ) : (
        <select className="form-input" value={value} onChange={handleSelect}>
            <option value="">{placeholder || `Select ${label || ""}`}</option>
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
            <option value="__add__">+ Add new...</option>
        </select>
    );

    if (bare) return control;

    return (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            {control}
            {error && <span className="form-error">{error}</span>}
        </div>
    );
}

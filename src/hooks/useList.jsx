import { useEffect, useState } from "react";
import useAuthApi from "../api/useAuthApi";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function useList({
    title,
    endpoint,
    columns = [],
    onEdit,
    onGenerate,
    isGenerated,
    print = false,
    generate = false,
    headerAction,
    deleteEndpoint,
    getId,
    deleteLabel = "this item",
    
    isSettled = false,
    onSettle,
    settle
}) {
    const { callApi } = useAuthApi();
    const [deletingId, setDeletingId] = useState(null);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchList = async () => {
        setLoading(true);

        const response = await callApi({
            url: endpoint,
            method: "GET"
        });

        if (response) {
            setItems(response.items || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchList();
    }, [endpoint]);

    const resolveId = (item) =>
        getId ? getId(item) : item.id ?? item.jobcard_number ?? item.bill_id ?? item.receipt_id ?? item.part_id;

    const handleDelete = async (item) => {
        const id = resolveId(item);
        if (id == null) return;
        if (!window.confirm(`Delete ${deleteLabel}? This cannot be undone.`)) return;

        setDeletingId(id);
        const res = await callApi({
            url: `${deleteEndpoint}/${id}`,
            method: "DELETE",
            showToast: true,
        });
        setDeletingId(null);

        if (res !== null) {
            fetchList();
        }
    };

    const formatDate = (value) => {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        return d.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderCell = (item, column) => {
        const value = item[column.key];

        if (column.key === "is_active") {
            const isActive =
                value === true ||
                value === 1 ||
                value === "true" ||
                value === "1";

            return (
                <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
                    {isActive ? "Active" : "Inactive"}
                </span>
            );
        }

        if (column.key === "is_settled") {
            return (
                <span className={`status-badge ${value ? "settled" : "unsettled"}`}>
                    {value ? "Settled" : "Not Settled"}
                </span>
            );
        }

        if (value && (column.key === "created_at" || column.key === "updated_at" || column.key.endsWith("_at"))) {
            return formatDate(value);
        }

        return value ?? "-";
    };

    const List = () => (
        <div className="list-container">
            <div className="list-header">
                <h2>{title}</h2>

                {headerAction && (
                    <div className="list-header-action">
                        {headerAction}
                    </div>
                )}
            </div>

            {loading && <div className="loading">Loading...</div>}

            {!loading && (
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th className="action-column">Action</th>

                                {columns.map((column) => (
                                    <th key={column.key}>
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item, index) => {
                                const generated = isGenerated ? isGenerated(item) : false;
                                const settled = isSettled ? isSettled(item) : false;
                                console.log(settled)

                                return (
                                    <tr key={index}>
                                        <td>
                                            <div className="action-buttons-group">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => onEdit?.(item)}
                                                >
                                                    {print ? "" : <FiEdit2 size={16} />}
                                                    { print ? "Print" : "Edit" }
                                                </button>
                                                
                                                {generate && settled && (
                                                    <button
                                                        className={`generate-btn ${generated ? "disabled" : ""}`}
                                                        onClick={() => {
                                                            if (!generated) {
                                                                onGenerate?.(item);
                                                            }
                                                        }}
                                                        disabled={generated}
                                                    >
                                                        {generated ? "Generated" : "Generate"}
                                                    </button>
                                                )}

                                                {settle && !settled && (
                                                    <button
                                                        className={`settle-btn ${settled ? "disabled" : ""}`}
                                                        onClick={() => onSettle?.(item)}
                                                    >
                                                        Settle
                                                    </button>
                                                )}

                                                {deleteEndpoint && (
                                                    <button
                                                        className="delete-btn"
                                                        title="Delete"
                                                        onClick={() => handleDelete(item)}
                                                        disabled={deletingId === resolveId(item)}
                                                    >
                                                        <FiTrash2 size={16} />
                                                        {deletingId === resolveId(item) ? "..." : "Delete"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        {columns.map((column) => (
                                            <td key={column.key}>
                                                {renderCell(item, column)}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="empty-state">
                    No data found.
                </div>
            )}
        </div>
    );

    return {
        List,
        items,
        loading,
        refresh: fetchList
    };
}

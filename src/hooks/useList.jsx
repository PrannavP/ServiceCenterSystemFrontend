import { useEffect, useState } from "react";
import useAuthApi from "../api/useAuthApi";
import { FiEdit2 } from "react-icons/fi";

export default function useList({
    title,
    endpoint,
    columns = [],
    onEdit,
    onGenerate,
    isGenerated,
    print = false,
    generate = false,
    headerAction
}) {
    const { callApi } = useAuthApi();

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
                                                {generate && (
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

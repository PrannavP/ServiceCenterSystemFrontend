import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import useList from "../../../hooks/useList";
import "../../../styles/listpage.css";

const ReceiptListPage = () => {
    const navigate = useNavigate();

    const { List } = useList({
        title: "Receipts",
        endpoint: "/api/receipt/list",
        headerAction: (
            <button
                type="button"
                className="list-create-btn"
                onClick={() => navigate("/inv/receipt/manage")}
            >
                <FiPlus size={16} />
                Create
            </button>
        ),
        onEdit: (item) => {
            navigate(`/inv/receipt/manage/${item.receipt_id || item.id || item.number}`);
        },
        columns: [
            {
                key: "receipt_number",
                label: "Receipt No"
            },
            {
                key: "is_active",
                label: "Active"
            },
            {
                key: "created_at",
                label: "Created At"
            }
        ]
    });

    return <List />;
};

export default ReceiptListPage;

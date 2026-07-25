import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import useList from "../../../hooks/useList";
import "../../../styles/listpage.css";

const PartListPage = () => {
    const navigate = useNavigate();

    const { List } = useList({
        title: "Parts",
        endpoint: "/api/part/list",
        headerAction: (
            <button
                type="button"
                className="list-create-btn"
                onClick={() => navigate("/inv/part/manage")}
            >
                <FiPlus size={16} />
                Create
            </button>
        ),
        onEdit: (item) => {
            navigate(`/inv/part/manage/${item.part_id || item.id}`);
        },
        columns: [
            {
                key: "name",
                label: "Name"
            },
            {
                key: "part_number",
                label: "Part Number"
            },
            {
                key: "is_active",
                label: "Active"
            }
        ]
    });

    return <List />;
};

export default PartListPage;

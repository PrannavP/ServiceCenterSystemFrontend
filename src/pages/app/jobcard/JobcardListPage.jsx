import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import useList from "../../../hooks/useList";
import '../../../styles/listpage.css';
import { toast } from "react-toastify";
import useAuthApi from "../../../api/useAuthApi";

const JobcardListPage = () => {
    const navigate = useNavigate();
    const { callApi } = useAuthApi();

    const { List, refresh } = useList({
        generate: true,
        title: "Job Cards",
        endpoint: "/api/jobcard/list",
        deleteEndpoint: "/api/jobcard/delete",
        getId: (item) => item.jobcard_number ?? item.jobcard_id,
        deleteLabel: "this job card",
        headerAction: (
            <button
                type="button"
                className="list-create-btn"
                onClick={() => navigate("/app/jobcard/manage")}
            >
                <FiPlus size={16} />
                Create
            </button>
        ),

        onEdit: (item) => {
            navigate(`/app/jobcard/manage/${item.jobcard_id || item.jobcard_number}`);
        },

        isGenerated: (item) => {
            return item.is_billed === true || item.is_billed === 1 || item.status === 'COMPLETED';
        },

        onGenerate: async (item) => {
            const res = await callApi({
                url: '/api/billing/create',
                method: 'POST',
                body: {
                    jobcard_id: item.jobcard_id || item.jobcard_number,
                    payment_method: "CASH"
                },
                showToast: true
            });
            if (res) {
                toast.success("Bill generated successfully.");
                refresh();
            }
        },

        columns: [
            {
                key: "jobcard_number",
                label: "Job Card No"
            },
            {
                key: "customer_name",
                label: "Customer"
            },
            {
                key: "customer_address",
                label: "Address"
            },
            {
                key: "contact_number",
                label: "Contact"
            },
            {
                key: "vehicle_registration_number",
                label: "Vehicle No"
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

export default JobcardListPage;

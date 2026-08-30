import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import useList from "../../../hooks/useList";
import "../../../styles/listpage.css";
import { toast } from "react-toastify";
import useAuthApi from "../../../api/useAuthApi";
import { Modal, useModal } from "../../../components/common/Modal";
import SettlementPopup from "./components/SettlementPopup";

const JobcardListPage = () => {
    const navigate = useNavigate();
    const { callApi } = useAuthApi();
    const { isOpen, openModal, closeModal, modalProps } = useModal();

    const { List, refresh } = useList({
        settle:   true,
        generate: true,
        title:    "Job Cards",

        endpoint:       "/api/jobcard/list",
        deleteEndpoint: "/api/jobcard/delete",
        getId:          (item) => item.jobcard_number ?? item.jobcard_id,
        deleteLabel:    "this job card",

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

        isSettled: (item) => item.is_settled === true,

        onSettle: (item) => {
            openModal({
                size:  "small",
                title: "Settle Job Card",
                body: (
                    <SettlementPopup
                        from="jobcard"
                        jobcard_id={item.jobcard_number}
                        onSuccess={() => {
                            refresh();
                        }}
                        onClose={closeModal}
                    />
                ),
                // Footer is rendered inside SettlementPopup itself so the
                // Settle / Cancel buttons have direct access to form state.
                footerActions: []
            });
        },

        isGenerated: (item) =>
            item.is_billed === true ||
            item.is_billed === 1    ||
            item.status   === "COMPLETED",

        onGenerate: async (item) => {
            const res = await callApi({
                url:    "/api/billing/create",
                method: "POST",
                body: {
                    jobcard_id:     item.jobcard_id || item.jobcard_number,
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
            { key: "jobcard_number",              label: "Job Card No" },
            { key: "customer_name",               label: "Customer"    },
            { key: "customer_address",            label: "Address"     },
            { key: "contact_number",              label: "Contact"     },
            { key: "vehicle_registration_number", label: "Vehicle No"  },
            { key: "is_active",                   label: "Active"      },
            { key: "is_settled",                  label: "Settle"      },
            { key: "created_at",                  label: "Created At"  }
        ]
    });

    return (
        <>
            <List />
            <Modal {...modalProps} isOpen={isOpen} onClose={closeModal} />
        </>
    );
};

export default JobcardListPage;
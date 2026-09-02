import { useState } from "react";
import { FiPlus, FiUser, FiMail, FiLock, FiPhone } from "react-icons/fi";
import useList from "../../../hooks/useList";
import useAuthApi from "../../../api/useAuthApi";
import { toast } from "react-toastify";
import { Modal, useModal } from "../../../components/common/Modal";
import "../../../styles/listpage.css";
import "../../../styles/form.css";

const CreateCenterModal = ({ onClose, onSuccess, editItem = null }) => {
    const { callApi } = useAuthApi();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: editItem?.username || "",
        email: editItem?.email || "",
        full_name: editItem?.full_name || "",
        password: "",
        phone: editItem?.phone || ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await callApi({
            url: editItem ? `/api/user/update-service-center/${editItem.id}` : "/api/user/create-service-center",
            method: editItem ? "PUT" : "POST",
            body: formData,
            showToast: true
        });

        setLoading(false);
        if (res) {
            toast.success(editItem ? "Service Center updated!" : "Service Center created!");
            onSuccess();
        }
    };

    return (
        <form className="form-card" onSubmit={handleSubmit} style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                    <label className="form-label"><FiUser size={14} /> Full Name</label>
                    <input type="text" name="full_name" className="form-input" required value={formData.full_name} onChange={handleChange} placeholder="e.g. Acme Auto Repair" />
                </div>
                
                <div className="form-group">
                    <label className="form-label"><FiUser size={14} /> Username</label>
                    <input type="text" name="username" className="form-input" required value={formData.username} onChange={handleChange} placeholder="e.g. acme_auto" />
                </div>

                <div className="form-group">
                    <label className="form-label"><FiMail size={14} /> Email Address</label>
                    <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} placeholder="center@example.com" />
                </div>

                <div className="form-group">
                    <label className="form-label"><FiPhone size={14} /> Phone Number</label>
                    <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} placeholder="+977 9800000000" />
                </div>

                <div className="form-group">
                    <label className="form-label"><FiLock size={14} /> {editItem ? 'New Password (Optional)' : 'Temporary Password'}</label>
                    <input type="password" name="password" className="form-input" required={!editItem} value={formData.password} onChange={handleChange} placeholder={editItem ? "Leave blank to keep unchanged" : "Enter a secure temporary password"} />
                    {!editItem && <small className="form-error" style={{ color: '#64748b' }}>User will be required to change this upon first login.</small>}
                </div>

                <div className="form-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Saving..." : (editItem ? "Save Changes" : "Create Account")}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default function UserManagement() {
    const { isOpen, openModal, closeModal, modalProps } = useModal();
    
    // We can use a mock endpoint for the list or assuming there's a list endpoint for users.
    // In our plan we focus on creation. Let's build the list view.
    const { List, refresh } = useList({
        title: "Service Centers & Users",
        endpoint: "/api/user/list", // We will need this endpoint in backend, or just show a message if it doesn't exist
        deleteEndpoint: "/api/user/delete",
        deleteLabel: "this user account",
        headerAction: (
            <button
                type="button"
                className="list-create-btn"
                onClick={() => openModal({
                    title: "Create Service Center",
                    body: <CreateCenterModal onClose={closeModal} onSuccess={() => { closeModal(); refresh(); }} />,
                    footerActions: []
                })}
            >
                <FiPlus size={16} /> Create Service Center
            </button>
        ),
        onEdit: (item) => openModal({
            title: "Edit Service Center",
            body: <CreateCenterModal editItem={item} onClose={closeModal} onSuccess={() => { closeModal(); refresh(); }} />,
            footerActions: []
        }),
        columns: [
            { key: "username", label: "Username" },
            { key: "full_name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "user_type", label: "Role" },
            { key: "is_active", label: "Status" }
        ],
        customActions: (item) => (
            item.user_type !== 'admin' && (
                <button
                    type="button"
                    className="generate-btn"
                    onClick={() => {
                        localStorage.setItem("impersonated_service_center", item.id);
                        window.location.href = "/dashboard";
                    }}
                    title="View this Service Center's Dashboard"
                >
                    View Dashboard
                </button>
            )
        )
    });

    return (
        <>
            <List />
            <Modal {...modalProps} isOpen={isOpen} onClose={closeModal} />
        </>
    );
}

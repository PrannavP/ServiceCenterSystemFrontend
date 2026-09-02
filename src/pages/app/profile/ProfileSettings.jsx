import { useState, useEffect } from "react";
import { FiUser, FiMail, FiLock, FiPhone, FiCamera, FiX } from "react-icons/fi";
import useAuthApi from "../../../api/useAuthApi";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import "../../../styles/form.css";

export default function ProfileSettings() {
    const { callApi } = useAuthApi();
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        full_name: "",
        password: "",
        phone: "",
        avatar_url: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                full_name: user.full_name || "",
                password: "",
                phone: user.phone || "",
                avatar_url: user.avatar_url || ""
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append("image", file);

        try {
            // Re-using part image upload API, or just assume the general image upload exists.
            const res = await callApi({
                url: "/api/part/upload",
                method: "POST",
                body: data,
                isFormData: true
            });

            if (res && res.imageUrl) {
                setFormData(prev => ({ ...prev, avatar_url: res.imageUrl }));
                toast.success("Avatar uploaded successfully");
            }
        } catch (error) {
            toast.error("Failed to upload avatar");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, avatar_url: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await callApi({
            url: `/api/user/update-service-center/${user.id || user.userId || user.sub}`,
            method: "PUT",
            body: formData,
            showToast: true
        });

        setLoading(false);
        if (res && res.data) {
            toast.success("Profile updated successfully!");
            // Re-login with updated info (or just refresh)
            window.location.reload();
        }
    };

    return (
        <div className="form-page">
            <div className="form-card">
                <div className="form-card-header">
                    <h2>Profile Settings</h2>
                </div>
                <div className="form-card-body">
                    <form className="form-sections" onSubmit={handleSubmit}>
                        
                        <div className="form-group col-1">
                            <label className="form-label">Profile Avatar</label>
                            {formData.avatar_url ? (
                                <div className="image-preview" style={{ maxWidth: '120px', borderRadius: '50%' }}>
                                    <img src={formData.avatar_url} alt="Avatar" style={{ borderRadius: '50%' }} />
                                    <button type="button" className="remove-image-btn" onClick={removeImage}>
                                        <FiX size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="image-upload-zone" style={{ maxWidth: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                    <FiCamera size={24} style={{ color: '#94a3b8' }} />
                                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                                        {uploading ? "Uploading..." : "Upload"}
                                    </span>
                                </label>
                            )}
                        </div>

                        <div className="form-grid">
                            <div className="form-group col-2">
                                <label className="form-label"><FiUser size={14} /> Full Name</label>
                                <input type="text" name="full_name" className="form-input" required value={formData.full_name} onChange={handleChange} />
                            </div>
                            
                            <div className="form-group col-2">
                                <label className="form-label"><FiUser size={14} /> Username</label>
                                <input type="text" name="username" className="form-input" required value={formData.username} onChange={handleChange} />
                            </div>

                            <div className="form-group col-2">
                                <label className="form-label"><FiMail size={14} /> Email Address</label>
                                <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} />
                            </div>

                            <div className="form-group col-2">
                                <label className="form-label"><FiPhone size={14} /> Phone Number</label>
                                <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
                            </div>

                            <div className="form-group col-4">
                                <label className="form-label"><FiLock size={14} /> New Password (Optional)</label>
                                <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep your current password" />
                            </div>
                        </div>

                        <div className="form-footer">
                            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

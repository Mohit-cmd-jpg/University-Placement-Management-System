import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { recruiterAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { getProfileCompletion } from '../../services/profileCompletion';

const RecruiterProfile = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: '', company: '', designation: '', phoneCountryCode: '+91', phone: '', companyWebsite: '', companyDescription: '', industry: '' });
    const [loading, setLoading] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        if (user) {
            const rp = user.recruiterProfile || {};
            setForm({ name: user.name || '', company: rp.company || '', designation: rp.designation || '', phoneCountryCode: rp.phoneCountryCode || '+91', phone: rp.phone || '', companyWebsite: rp.companyWebsite || '', companyDescription: rp.companyDescription || '', industry: rp.industry || '' });
            // Set photo preview if profile photo exists
            if (rp.profileImage) {
                setPhotoPreview(`data:${rp.profileImageContentType};base64,${rp.profileImage}`);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            return setForm((prev) => ({ ...prev, phone: value.replace(/\D/g, '').slice(0, 10) }));
        }
        if (name === 'phoneCountryCode') {
            return setForm((prev) => ({ ...prev, phoneCountryCode: value.replace(/[^\d+]/g, '') }));
        }
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Only JPEG, PNG, and WebP images are supported');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setPhotoFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!/^\+\d{1,4}$/.test(String(form.phoneCountryCode || '').trim())) {
            return toast.error('Enter a valid country code (example: +91).');
        }
        if (!/^\d{10}$/.test(String(form.phone || ''))) {
            return toast.error('Mobile number must be exactly 10 digits.');
        }
        const profilePreview = {
            ...user,
            name: form.name,
            recruiterProfile: {
                ...(user?.recruiterProfile || {}),
                ...form,
            }
        };
        const completion = getProfileCompletion(profilePreview);
        if (!completion.isComplete) {
            return toast.error(`Complete all required fields. Missing: ${completion.missingFields.join(', ')}`);
        }

        setLoading(true);
        try {
            if (photoFile) {
                const photoFormData = new FormData();
                photoFormData.append('photo', photoFile);
                await recruiterAPI.uploadProfilePhoto(photoFormData);
            }

            const res = await recruiterAPI.updateProfile(form);
            updateUser(res.data);

            if (photoFile) {
                const profileRes = await recruiterAPI.getProfile();
                updateUser(profileRes.data);
                setPhotoFile(null);
            }

            toast.success('Profile updated!');
        } catch { toast.error('Error updating profile'); }
        finally { setLoading(false); }
    };

    return (
        <Layout title="Recruiter Profile">
            <div className="fade-in">
                <div className="card" style={{ maxWidth: '700px' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Company Profile</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Profile Photo Section */}
                        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Profile Photo</h3>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                                {/* Photo Display */}
                                <div style={{ flex: '0 0 120px', textAlign: 'center' }}>
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                                    ) : (
                                        <div style={{ width: '120px', height: '120px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.1)', border: '2px dashed var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            No photo
                                        </div>
                                    )}
                                </div>

                                {/* Upload Input */}
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        Upload a clear profile photo (JPEG, PNG, or WebP). Max 5MB. Optional.
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePhotoChange}
                                        style={{ width: '100%' }}
                                    />
                                    {photoFile && (
                                        <p style={{ fontSize: '0.85rem', color: 'var(--success)', margin: '0.5rem 0 0 0' }}>
                                            ✓ Selected: {photoFile.name} — will be uploaded on Save
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group"><label>Your Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Designation</label><input name="designation" value={form.designation} onChange={handleChange} required /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Company Name</label><input name="company" value={form.company} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Industry</label><input name="industry" value={form.industry} onChange={handleChange} required /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
                                    <div style={{ flex: '0 0 76px' }}>
                                        <input name="phoneCountryCode" value={form.phoneCountryCode} onChange={handleChange} placeholder="+91" required />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input name="phone" value={form.phone} onChange={handleChange} inputMode="numeric" maxLength={10} placeholder="10-digit mobile" required />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group"><label>Website</label><input name="companyWebsite" value={form.companyWebsite} onChange={handleChange} required /></div>
                        </div>
                        <div className="form-group"><label>Company Description</label><textarea name="companyDescription" value={form.companyDescription} onChange={handleChange} rows="3" required /></div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default RecruiterProfile;

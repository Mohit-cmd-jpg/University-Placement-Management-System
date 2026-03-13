import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { recruiterAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RecruiterProfile = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: '', company: '', designation: '', phone: '', companyWebsite: '', companyDescription: '', industry: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const rp = user.recruiterProfile || {};
            setForm({ name: user.name || '', company: rp.company || '', designation: rp.designation || '', phone: rp.phone || '', companyWebsite: rp.companyWebsite || '', companyDescription: rp.companyDescription || '', industry: rp.industry || '' });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await recruiterAPI.updateProfile(form);
            updateUser(res.data);
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
                        <div className="form-row">
                            <div className="form-group"><label>Your Name</label><input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                            <div className="form-group"><label>Designation</label><input name="designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Company Name</label><input name="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required /></div>
                            <div className="form-group"><label>Industry</label><input name="industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Phone</label><input name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                            <div className="form-group"><label>Website</label><input name="companyWebsite" value={form.companyWebsite} onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })} /></div>
                        </div>
                        <div className="form-group"><label>Company Description</label><textarea name="companyDescription" value={form.companyDescription} onChange={(e) => setForm({ ...form, companyDescription: e.target.value })} rows="3" /></div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default RecruiterProfile;

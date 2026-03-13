import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { jobAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PostJob = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '', company: '', description: '', location: '', type: 'Full-time', salary: '', openings: 1,
        deadline: '', minCGPA: 0, branches: '', skills: '', batch: '',
        requirements: '', responsibilities: '', perks: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await jobAPI.create({
                title: form.title, company: form.company, description: form.description,
                location: form.location, type: form.type, salary: form.salary,
                openings: parseInt(form.openings), deadline: form.deadline,
                eligibility: {
                    minCGPA: parseFloat(form.minCGPA), batch: form.batch,
                    branches: form.branches.split(',').map(s => s.trim()).filter(Boolean),
                    skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
                },
                requirements: form.requirements.split('\n').filter(Boolean),
                responsibilities: form.responsibilities.split('\n').filter(Boolean),
                perks: form.perks.split('\n').filter(Boolean)
            });
            toast.success('Job posted! Awaiting admin approval.');
            navigate('/recruiter/my-jobs');
        } catch (err) { toast.error(err.response?.data?.error || 'Error posting job'); }
        finally { setLoading(false); }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <Layout title="Post a Job">
            <div className="fade-in">
                <div className="card" style={{ maxWidth: '800px' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>New Job Posting</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group"><label>Job Title *</label><input name="title" value={form.title} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Company *</label><input name="company" value={form.company} onChange={handleChange} required /></div>
                        </div>
                        <div className="form-group"><label>Description *</label><textarea name="description" value={form.description} onChange={handleChange} rows="4" required /></div>
                        <div className="form-row">
                            <div className="form-group"><label>Location *</label><input name="location" value={form.location} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Type</label>
                                <select name="type" value={form.type} onChange={handleChange}>
                                    <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Salary</label><input name="salary" value={form.salary} onChange={handleChange} placeholder="e.g., 12-18 LPA" /></div>
                            <div className="form-group"><label>Openings</label><input name="openings" type="number" value={form.openings} onChange={handleChange} min="1" /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Deadline *</label><input name="deadline" type="date" value={form.deadline} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Batch</label><input name="batch" value={form.batch} onChange={handleChange} placeholder="e.g., 2025" /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Min CGPA</label><input name="minCGPA" type="number" step="0.1" value={form.minCGPA} onChange={handleChange} /></div>
                            <div className="form-group"><label>Eligible Branches (comma separated)</label><input name="branches" value={form.branches} onChange={handleChange} placeholder="Computer Science, IT" /></div>
                        </div>
                        <div className="form-group"><label>Required Skills (comma separated)</label><input name="skills" value={form.skills} onChange={handleChange} placeholder="JavaScript, React" /></div>
                        <div className="form-group"><label>Requirements (one per line)</label><textarea name="requirements" value={form.requirements} onChange={handleChange} rows="3" /></div>
                        <div className="form-group"><label>Responsibilities (one per line)</label><textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows="3" /></div>
                        <div className="form-group"><label>Perks (one per line)</label><textarea name="perks" value={form.perks} onChange={handleChange} rows="2" /></div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Posting...' : 'Post Job'}</button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default PostJob;

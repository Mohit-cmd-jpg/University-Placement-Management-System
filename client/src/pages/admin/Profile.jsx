import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
    const { user } = useAuth();

    return (
        <Layout title="Admin Profile">
            <div className="fade-in">
                <div className="card" style={{ maxWidth: '600px' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Administrator Details</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input value={user?.name || ''} readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }} />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input value={user?.email || ''} readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }} />
                        </div>
                        <div className="form-group">
                            <label>System Role</label>
                            <input value="Placement Officer / Admin" readOnly style={{ backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed', textTransform: 'capitalize' }} />
                        </div>
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--primary-glow)', borderRadius: '8px', border: '1px solid var(--primary-border)' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)' }}>
                                ℹ️ Admin profiles are managed by the system configuration. To change these details, please contact the IT department.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminProfile;

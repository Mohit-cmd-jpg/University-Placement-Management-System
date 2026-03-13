import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { FiCode, FiClipboard, FiCheckSquare, FiHelpCircle } from 'react-icons/fi';

const Preparation = () => {
    const cards = [
        { to: '/student/preparation/mock-test', icon: '📝', title: 'Mock Tests', desc: 'Proctored AI-generated technical & aptitude tests', color: '#10b981' },
        { to: '/student/preparation/tips', icon: '🤖', title: 'AI Interview Prep', desc: 'Simulate role-specific interviews with AI evaluation', color: '#f59e0b' },
    ];

    return (
        <Layout title="Placement Preparation">
            <div className="fade-in">
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Prepare for your dream placement with these resources</p>
                <div className="prep-cards">
                    {cards.map((card) => (
                        <Link key={card.to} to={card.to} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="prep-card">
                                <div className="icon">{card.icon}</div>
                                <h3>{card.title}</h3>
                                <p>{card.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default Preparation;

import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { FiMenu } from 'react-icons/fi';

const Layout = ({ title, children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="app-layout">
            <button className="hamburger-btn" onClick={toggleSidebar}>
                <FiMenu />
            </button>

            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={closeSidebar}
            ></div>

            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <div className="main-content">
                <Navbar title={title} />
                <div style={{ marginTop: '64px', paddingTop: '0.5rem' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;

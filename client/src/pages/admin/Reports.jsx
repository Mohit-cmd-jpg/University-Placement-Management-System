import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../../components/Layout';
import { adminAPI, studentAPI, jobAPI, applicationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminReports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedView, setSelectedView] = useState(null);
    const [viewData, setViewData] = useState([]);
    const [viewTitle, setViewTitle] = useState('');
    const [viewLoading, setViewLoading] = useState(false);
    
    // Export modal state
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedDataTypes, setSelectedDataTypes] = useState({
        students: true,
        placements: true,
        recruiters: true,
        jobs: false,
        applications: false,
        drives: false,
        announcements: false
    });
    const [exporting, setExporting] = useState(false);

    useEffect(() => { adminAPI.getReports().then(res => setData(res.data)).catch(() => { }).finally(() => setLoading(false)); }, []);

    const handleViewTotalStudents = async () => {
        try {
            setViewLoading(true);
            const res = await studentAPI.getAll();
            setViewData(res.data);
            setViewTitle('All Students');
            setSelectedView('students');
        } catch (error) {
            console.error(error);
        } finally {
            setViewLoading(false);
        }
    };

    const handleViewPlacedStudents = async () => {
        try {
            setViewLoading(true);
            const res = await studentAPI.getAll();
            const placed = res.data.filter(s => s.studentProfile?.isPlaced);
            setViewData(placed);
            setViewTitle('Placed Students');
            setSelectedView('students');
        } catch (error) {
            console.error(error);
        } finally {
            setViewLoading(false);
        }
    };

    const handleViewUnplacedStudents = async () => {
        try {
            setViewLoading(true);
            const res = await studentAPI.getAll();
            const unplaced = res.data.filter(s => !s.studentProfile?.isPlaced);
            setViewData(unplaced);
            setViewTitle('Unplaced Students');
            setSelectedView('students');
        } catch (error) {
            console.error(error);
        } finally {
            setViewLoading(false);
        }
    };

    const handleViewActiveJobs = async () => {
        try {
            setViewLoading(true);
            const res = await jobAPI.getAll();
            const active = res.data.filter(j => j.status === 'approved');
            setViewData(active);
            setViewTitle('Active Jobs');
            setSelectedView('jobs');
        } catch (error) {
            console.error(error);
        } finally {
            setViewLoading(false);
        }
    };

    const handleViewApplications = async () => {
        try {
            setViewLoading(true);
            const res = await applicationAPI.getAll();
            setViewData(res.data);
            setViewTitle('All Applications');
            setSelectedView('applications');
        } catch (error) {
            console.error(error);
        } finally {
            setViewLoading(false);
        }
    };

    const handleDataTypeToggle = (type) => {
        setSelectedDataTypes(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleRawExport = async () => {
        try {
            setExporting(true);
            const selectedTypes = Object.keys(selectedDataTypes).filter(k => selectedDataTypes[k]).join(',');
            if (!selectedTypes) {
                toast.error('Please select at least one data type to export');
                return;
            }

            // Fetch with proper authentication header
            const response = await fetch(`/api/admin/export/raw?dataTypes=${selectedTypes}&format=json`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('⚠️ Session expired. Please login again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            // Get the blob and download it
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `raw_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            
            toast.success('✅ JSON export downloaded!');
            setShowExportModal(false);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Export failed: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    const exportToCSV = () => {
        if (!data) return;

        const lines = [];
        const escapeCSV = (str) => {
            if (!str) return '';
            if (typeof str !== 'string') str = String(str);
            return str.includes(',') || str.includes('"') || str.includes('\n') 
                ? `"${str.replace(/"/g, '""')}"` 
                : `"${str}"`;
        };

        // ===== EXECUTIVE SUMMARY =====
        lines.push('PLACEMENT ANALYTICS REPORT');
        lines.push(`Generated: ${new Date().toLocaleString()}`);
        lines.push('');
        
        lines.push('EXECUTIVE SUMMARY');
        lines.push('Metric,Value,Target,Status');
        const placementRate = ((data.overview.placedStudents / Math.max(data.overview.totalStudents, 1)) * 100).toFixed(2);
        lines.push(`Overall Placement Rate,${placementRate}%,80%,${placementRate >= 80 ? 'Good' : 'Needs Improvement'}`);
        lines.push(`Total Students,${data.overview.totalStudents},N/A,N/A`);
        lines.push(`Placed Students,${data.overview.placedStudents},N/A,N/A`);
        lines.push(`Unplaced Students,${data.overview.unplacedStudents},N/A,N/A`);
        lines.push(`Verified Students,${data.overview.verifiedStudents},N/A,N/A`);
        lines.push(`Total Recruiters,${data.overview.totalRecruiters},N/A,N/A`);
        lines.push(`Active Jobs,${data.overview.approvedJobs},N/A,N/A`);
        lines.push(`Total Applications,${data.overview.totalApplications},N/A,N/A`);
        lines.push('');

        // ===== BRANCH-WISE PLACEMENT ANALYSIS =====
        lines.push('DEPARTMENT-WISE PLACEMENT ANALYSIS');
        lines.push('Department,Total Students,Placed,Unplaced,Placement Rate (%),Performance');
        (data.branchStats || []).forEach(b => {
            const rate = ((b.placed / Math.max(b.total, 1)) * 100).toFixed(1);
            let performance = 'Excellent';
            if (rate < 60) performance = 'Poor';
            else if (rate < 70) performance = 'Below Average';
            else if (rate < 80) performance = 'Average';
            else if (rate < 90) performance = 'Good';
            
            lines.push(`${b._id || 'N/A'},${b.total},${b.placed},${b.total - b.placed},${rate},${performance}`);
        });
        lines.push('');

        // ===== HIGH PERFORMING STUDENTS =====
        lines.push('TOP PERFORMERS (CGPA >= 8.0)');
        lines.push('Name,Email,Department,CGPA,Status,Company,Applications');
        const topStudents = (data.studentDetails || [])
            .filter(s => (s.studentProfile?.cgpa || 0) >= 8.0)
            .sort((a, b) => (b.studentProfile?.cgpa || 0) - (a.studentProfile?.cgpa || 0))
            .slice(0, 10);
        topStudents.forEach(s => {
            lines.push(`${escapeCSV(s.name)},${escapeCSV(s.email)},${escapeCSV(s.studentProfile?.department || 'N/A')},${(s.studentProfile?.cgpa || 0).toFixed(2)},${s.status},${escapeCSV(s.placedAt || 'N/A')},${s.applicationCount || 0}`);
        });
        lines.push('');

        // ===== AT-RISK STUDENTS (Unplaced with low applications) =====
        lines.push('AT-RISK STUDENTS (Unplaced with Low Activity)');
        lines.push('Name,Email,Department,CGPA,Applications Sent,Recommendation');
        const atRiskStudents = (data.studentDetails || [])
            .filter(s => !s.studentProfile?.isPlaced && (s.applicationCount || 0) < 5)
            .sort((a, b) => (a.applicationCount || 0) - (b.applicationCount || 0))
            .slice(0, 10);
        atRiskStudents.forEach(s => {
            const recommendation = (s.applicationCount || 0) === 0 ? 'Urgent: No applications' : 'Low engagement - encourage more applications';
            lines.push(`${escapeCSV(s.name)},${escapeCSV(s.email)},${escapeCSV(s.studentProfile?.department || 'N/A')},${(s.studentProfile?.cgpa || 0).toFixed(2)},${s.applicationCount || 0},${recommendation}`);
        });
        lines.push('');

        // ===== TOP HIRING COMPANIES =====
        lines.push('TOP RECRUITING COMPANIES');
        lines.push('Company,Students Hired,Hiring Rate (%)');
        const totalPlaced = data.overview.placedStudents || 1;
        (data.companyStats || []).slice(0, 15).forEach(c => {
            const rate = ((c.count / totalPlaced) * 100).toFixed(1);
            lines.push(`${escapeCSV(c._id || 'Standard Hire')},${c.count},${rate}`);
        });
        lines.push('');

        // ===== TOP PERFORMING RECRUITERS =====
        lines.push('TOP PERFORMING RECRUITERS');
        lines.push('Recruiter Name,Company,Jobs Posted,Successful Hires,Conversion Rate (%)');
        const topRecruiters = (data.recruiterDetails || [])
            .filter(r => r.jobsPosted > 0)
            .map(r => ({
                ...r,
                conversionRate: ((r.totalHires / Math.max(r.jobsPosted, 1)) * 100).toFixed(1)
            }))
            .sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate))
            .slice(0, 10);
        topRecruiters.forEach(r => {
            lines.push(`${escapeCSV(r.name)},${escapeCSV(r.company || 'N/A')},${r.jobsPosted},${r.totalHires},${r.conversionRate}`);
        });
        lines.push('');

        // ===== APPLICATION FUNNEL ANALYSIS =====
        lines.push('APPLICATION STATUS BREAKDOWN');
        lines.push('Status,Count,Percentage (%)');
        const totalApps = data.overview.totalApplications || 1;
        (data.applicationStats || []).forEach(s => {
            const percent = ((s.count / totalApps) * 100).toFixed(1);
            lines.push(`${escapeCSV(s._id || 'Unknown')},${s.count},${percent}`);
        });
        lines.push('');

        // ===== JOB MARKET INSIGHTS =====
        lines.push('JOB MARKET INSIGHTS');
        lines.push('Metric,Count');
        lines.push(`Total Jobs Posted,${data.overview.totalJobs}`);
        lines.push(`Approved Jobs,${data.overview.approvedJobs}`);
        lines.push(`Pending Jobs,${data.overview.pendingJobs}`);
        const avgJobsPerRecruiter = (data.overview.totalJobs / Math.max(data.overview.totalRecruiters, 1)).toFixed(2);
        lines.push(`Avg Jobs per Recruiter,${avgJobsPerRecruiter}`);
        const appsPerJob = (data.overview.totalApplications / Math.max(data.overview.totalJobs, 1)).toFixed(2);
        lines.push(`Avg Applications per Job,${appsPerJob}`);
        lines.push('');

        // ===== KEY RECOMMENDATIONS =====
        lines.push('KEY RECOMMENDATIONS & INSIGHTS');
        lines.push('Finding,Impact,Action Item');
        
        // Recommendation 1: Department Performance
        const lowestDept = (data.branchStats || []).reduce((a, b) => 
            ((a.placed / Math.max(a.total, 1)) < (b.placed / Math.max(b.total, 1)) ? a : b)
        , data.branchStats?.[0] || {});
        if (lowestDept._id) {
            const lowestRate = ((lowestDept.placed / Math.max(lowestDept.total, 1)) * 100).toFixed(0);
            lines.push(`${lowestDept._id} has lowest placement rate,High,Focus on skill development and mock interviews`);
        }
        
        // Recommendation 2: Unplaced Students
        lines.push(`${data.overview.unplacedStudents} unplaced students remaining,High,Intensive career counseling and additional job drives`);
        
        // Recommendation 3: Job Market
        if (data.overview.approvedJobs === 0) {
            lines.push(`No approved jobs available,Critical,Reach out to recruiters and organize placement drives`);
        } else {
            lines.push(`Competition ratio: ${(data.overview.totalApplications / Math.max(data.overview.approvedJobs, 1)).toFixed(1)}:1 (Apps per Job),Medium,Encourage quality over quantity in applications`);
        }
        
        // Recommendation 4: Recruiter Engagement
        const inactiveRecruiters = (data.recruiterDetails || []).filter(r => r.jobsPosted === 0).length;
        if (inactiveRecruiters > 0) {
            lines.push(`${inactiveRecruiters} inactive recruiters,Medium,Follow up and encourage job postings`);
        }

        // Create CSV file
        const csvContent = "data:text/csv;charset=utf-8," + lines.map(line => {
            // Escape lines that contain special characters
            if (line.includes(',') && !line.startsWith('"')) {
                return line;
            }
            return line;
        }).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `placement_analytics_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('✅ Placement analytics exported successfully!');
    };

    if (loading) return <Layout title="Reports"><div className="loading"><div className="spinner"></div></div></Layout>;
    if (!data) return <Layout title="Reports"><p>Error loading reports</p></Layout>;

    const maxBranch = Math.max(...(data.branchStats || []).map(b => b.total), 1);
    const maxCompany = Math.max(...(data.companyStats || []).map(c => c.count), 1);

    return (
        <Layout title="Analytics & Reports">
            <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0, flex: 1 }}>Comprehensive placement analytics and performance tracking.</p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowExportModal(true)}>📥 Export Data</button>
                        <button className="btn btn-secondary btn-sm" onClick={exportToCSV}>📋 Quick Export (CSV)</button>
                    </div>
                </div>

                {/* Overview Row */}
                <div className="stats-grid">
                    <div className="stat-card" onClick={handleViewTotalStudents} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                        <div className="stat-icon blue"><span>👥</span></div><div className="stat-info"><h3>{data.overview.totalStudents}</h3><p>Total Students</p></div>
                    </div>
                    <div className="stat-card" onClick={handleViewPlacedStudents} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                        <div className="stat-icon green"><span>✅</span></div><div className="stat-info"><h3>{data.overview.placedStudents}</h3><p>Placed</p></div>
                    </div>
                    <div className="stat-card" onClick={handleViewUnplacedStudents} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                        <div className="stat-icon orange"><span>⏳</span></div><div className="stat-info"><h3>{data.overview.unplacedStudents}</h3><p>Unplaced</p></div>
                    </div>
                    <div className="stat-card" onClick={handleViewActiveJobs} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                        <div className="stat-icon cyan"><span>💼</span></div><div className="stat-info"><h3>{data.overview.approvedJobs}</h3><p>Active Jobs</p></div>
                    </div>
                    <div className="stat-card" onClick={handleViewApplications} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                        <div className="stat-icon red"><span>📋</span></div><div className="stat-info"><h3>{data.overview.totalApplications}</h3><p>Applications</p></div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(var(--chart-min, 300px), 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                    {/* Placement Ratio Circular Chart */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
                        <h3 className="card-title" style={{ alignSelf: 'flex-start', marginBottom: '2rem' }}>Overall Placement Ratio</h3>
                        <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                background: `conic-gradient(var(--success) ${(data.overview.placedStudents / Math.max(data.overview.totalStudents, 1)) * 360}deg, var(--bg-body) 0deg)`,
                                border: '4px solid var(--border)',
                                boxShadow: '0 0 20px var(--success-glow)'
                            }}></div>
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                width: '160px', height: '160px', borderRadius: '50%', background: 'var(--bg-card)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--border)'
                            }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>
                                    {Math.round((data.overview.placedStudents / Math.max(data.overview.totalStudents, 1)) * 100)}%
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placed</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '2px' }}></div>
                                <span style={{ fontSize: '0.9rem' }}>Placed ({data.overview.placedStudents})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: 'var(--bg-body)', borderRadius: '2px', border: '1px solid var(--border)' }}></div>
                                <span style={{ fontSize: '0.9rem' }}>Unplaced ({data.overview.unplacedStudents})</span>
                            </div>
                        </div>
                    </div>

                    {/* Branch-wise Bar Chart */}
                    <div className="card" style={{ minHeight: '350px' }}>
                        <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Branch wise Distribution</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '240px', paddingTop: '2rem' }}>
                            {data.branchStats.map((b, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '50px' }}>
                                    <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>{b.total}</div>
                                    <div style={{
                                        height: `${(b.total / maxBranch) * 160}px`,
                                        width: '30px',
                                        background: 'linear-gradient(180deg, var(--primary), var(--secondary))',
                                        borderRadius: '6px 6px 0 0',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'absolute', bottom: 0, width: '100%',
                                            height: `${(b.placed / Math.max(b.total, 1)) * 100}%`,
                                            background: 'var(--success)',
                                            borderRadius: '2px 2px 0 0',
                                            opacity: 0.8
                                        }} title={`Placed: ${b.placed}`}></div>
                                    </div>
                                    <div style={{
                                        marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)',
                                        textAlign: 'center', writingMode: 'vertical-rl', height: '60px', transform: 'rotate(180deg)'
                                    }}>{b._id || 'Unknown'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {/* Top Companies */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Top Recruiting Companies</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {data.companyStats.slice(0, 5).map((c, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{c._id || 'Standard Hire'}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.count} Hires</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--bg-body)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(c.count / maxCompany) * 100}%`, background: 'var(--primary)', borderRadius: '10px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Application Funnel */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Application Funnel</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {data.applicationStats.map((s, i) => (
                                <div key={i} style={{
                                    padding: '1rem', background: 'var(--bg-body)', borderRadius: '10px',
                                    border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{s._id}</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{s.count}</div>
                                    </div>
                                    <div style={{ fontSize: '2rem', opacity: 0.1 }}>📄</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Data View Modal - Rendered via Portal for full screen centering */}
            </div>

            {/* Modal Portal - Renders outside the Layout hierarchy */}
            {selectedView && createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{viewTitle}</h3>
                            <button onClick={() => setSelectedView(null)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>

                        {viewLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="spinner"></div>
                                <p>Loading data...</p>
                            </div>
                        ) : (
                            <>
                                {/* Students View */}
                                {selectedView === 'students' && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Department</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>CGPA</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students found</td>
                                                    </tr>
                                                ) : (
                                                    viewData.map((student, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '1rem' }}><strong>{student.name}</strong></td>
                                                            <td style={{ padding: '1rem' }}>{student.email}</td>
                                                            <td style={{ padding: '1rem' }}>{student.studentProfile?.department || 'N/A'}</td>
                                                            <td style={{ padding: '1rem' }}>{student.studentProfile?.cgpa || 'N/A'}</td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <span style={{
                                                                    padding: '0.25rem 0.75rem',
                                                                    borderRadius: '8px',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 600,
                                                                    backgroundColor: student.studentProfile?.isPlaced ? '#10b98140' : '#ef444440',
                                                                    color: student.studentProfile?.isPlaced ? '#10b981' : '#ef4444'
                                                                }}>
                                                                    {student.studentProfile?.isPlaced ? 'Placed' : 'Unplaced'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Jobs View */}
                                {selectedView === 'jobs' && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Job Title</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Company</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Posted By</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Salary</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No jobs found</td>
                                                    </tr>
                                                ) : (
                                                    viewData.map((job, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '1rem' }}><strong>{job.title}</strong></td>
                                                            <td style={{ padding: '1rem' }}>{job.company}</td>
                                                            <td style={{ padding: '1rem' }}>{typeof job.postedBy === 'object' ? job.postedBy.name : 'N/A'}</td>
                                                            <td style={{ padding: '1rem' }}>{job.salary ? `₹ ${job.salary}` : 'Negotiable'}</td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <span style={{
                                                                    padding: '0.25rem 0.75rem',
                                                                    borderRadius: '8px',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 600,
                                                                    backgroundColor: job.status === 'approved' ? '#10b98140' : job.status === 'pending' ? '#f59e0b40' : '#ef444440',
                                                                    color: job.status === 'approved' ? '#10b981' : job.status === 'pending' ? '#f59e0b' : '#ef4444'
                                                                }}>
                                                                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Applications View */}
                                {selectedView === 'applications' && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Student</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Job</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Company</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Applied Date</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No applications found</td>
                                                    </tr>
                                                ) : (
                                                    viewData.map((app, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '1rem' }}><strong>{app.student?.name || 'N/A'}</strong></td>
                                                            <td style={{ padding: '1rem' }}>{app.job?.title || 'N/A'}</td>
                                                            <td style={{ padding: '1rem' }}>{app.job?.company || 'N/A'}</td>
                                                            <td style={{ padding: '1rem' }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <span style={{
                                                                    padding: '0.25rem 0.75rem',
                                                                    borderRadius: '8px',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 600,
                                                                    backgroundColor: app.status === 'selected' ? '#10b98140' : app.status === 'rejected' ? '#ef444440' : app.status === 'shortlisted' ? '#3b82f640' : '#f59e0b40',
                                                                    color: app.status === 'selected' ? '#10b981' : app.status === 'rejected' ? '#ef4444' : app.status === 'shortlisted' ? '#3b82f6' : '#f59e0b'
                                                                }}>
                                                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* Export Modal */}
            {showExportModal && createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(5px)' }} onClick={() => setShowExportModal(false)}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>📥 Export Dataset</h2>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: 'var(--primary)' }}>Select Data Types:</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {Object.keys(selectedDataTypes).map(type => (
                                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', borderRadius: '6px', background: 'var(--bg-dark)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-dark)'}>
                                        <input type="checkbox" checked={selectedDataTypes[type]} onChange={() => handleDataTypeToggle(type)} style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                                        <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            📊 <strong>JSON Format:</strong> Complete MongoDB documents as-is with all nested fields. Perfect for data analysis, archiving, or importing to other systems.
                        </p>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowExportModal(false)} disabled={exporting}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleRawExport} disabled={exporting || Object.values(selectedDataTypes).every(v => !v)}>
                                {exporting ? '⏳ Exporting...' : '📥 Export'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </Layout>
    );
};

export default AdminReports;

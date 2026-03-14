const isFilled = (value) => String(value || '').trim().length > 0;

const asSkillArray = (skills) => {
    if (Array.isArray(skills)) {
        return skills.map((s) => String(s || '').trim()).filter(Boolean);
    }
    return String(skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
};

const getStudentChecks = (user) => {
    const sp = user?.studentProfile || {};
    const skills = asSkillArray(sp.skills);

    return [
        { label: 'Full Name', ok: isFilled(user?.name) },
        { label: 'Roll Number', ok: isFilled(sp.rollNumber) },
        { label: 'Department', ok: isFilled(sp.department) },
        { label: 'Batch', ok: isFilled(sp.batch) },
        { label: 'CGPA', ok: Number.isFinite(Number(sp.cgpa)) && String(sp.cgpa) !== '' },
        { label: 'Country Code', ok: /^\+\d{1,4}$/.test(String(sp.phoneCountryCode || '')) },
        { label: 'Mobile Number', ok: /^\d{10}$/.test(String(sp.phone || '')) },
        { label: 'Gender', ok: isFilled(sp.gender) },
        { label: 'Skills', ok: skills.length > 0 },
        { label: '10th Percentage', ok: Number.isFinite(Number(sp.tenthPercentage)) && String(sp.tenthPercentage) !== '' },
        { label: '12th Percentage', ok: Number.isFinite(Number(sp.twelfthPercentage)) && String(sp.twelfthPercentage) !== '' },
        { label: 'LinkedIn', ok: isFilled(sp.linkedIn) },
        { label: 'GitHub', ok: isFilled(sp.github) },
        { label: 'Resume', ok: isFilled(sp.resumeUrl) || isFilled(sp.resumeBase64) },
    ];
};

const getRecruiterChecks = (user) => {
    const rp = user?.recruiterProfile || {};

    return [
        { label: 'Your Name', ok: isFilled(user?.name) },
        { label: 'Designation', ok: isFilled(rp.designation) },
        { label: 'Company Name', ok: isFilled(rp.company) },
        { label: 'Industry', ok: isFilled(rp.industry) },
        { label: 'Country Code', ok: /^\+\d{1,4}$/.test(String(rp.phoneCountryCode || '')) },
        { label: 'Mobile Number', ok: /^\d{10}$/.test(String(rp.phone || '')) },
        { label: 'Website', ok: isFilled(rp.companyWebsite) },
        { label: 'Company Description', ok: isFilled(rp.companyDescription) },
    ];
};

const getAdminChecks = (user) => [
    { label: 'Full Name', ok: isFilled(user?.name) },
    { label: 'Email', ok: isFilled(user?.email) },
];

export const getProfileCompletion = (user) => {
    const checks = user?.role === 'student'
        ? getStudentChecks(user)
        : user?.role === 'recruiter'
            ? getRecruiterChecks(user)
            : getAdminChecks(user);

    const completedCount = checks.filter((c) => c.ok).length;
    const totalCount = checks.length;
    const percentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
    const missingFields = checks.filter((c) => !c.ok).map((c) => c.label);

    return {
        percentage,
        completedCount,
        totalCount,
        missingFields,
        isComplete: missingFields.length === 0,
    };
};

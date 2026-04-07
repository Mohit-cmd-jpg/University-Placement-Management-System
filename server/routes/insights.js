const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Application = require('../models/Application');
const { callAI } = require('../services/aiService');

router.post('/chat', auth, async (req, res) => {
    try {
        const { message, chatHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let systemContext = '';

        // 1. Context Injection for Students
        if (user.role === 'student') {
            const profile = user.studentProfile || {};
            const analytics = profile.analyticsData || {};
            
            // Format their goals
            const goals = analytics.careerGoals || {};
            const targetRoles = (goals.targetRoles || []).join(', ') || 'Not specified';
            
            // Format performance
            const performance = analytics.performanceMetrics || {};
            const overallScore = performance.overallReadinessScore || 0;
            const mockInterviewsAverage = performance.mockInterviewsAverage || 0;
            
            const proficiencies = (performance.topicProficiencies || [])
                .map(t => `${t.topic} (${t.score}%)`)
                .join(', ') || 'No topics tested yet';

            // Format behavioral
            const behavior = analytics.behavioralData || {};
            const applicationsCount = behavior.jobsAppliedCount || 0;
            const shortlistsCount = behavior.shortlistCount || 0;
            const successRate = behavior.applicationSuccessRate || 0;

            const skills = (profile.skills || []).join(', ') || 'No skills listed';
            
            // Format Resume Data
            const aiResumeAnalysis = profile.aiResumeAnalysis || {};
            const resumeScore = aiResumeAnalysis.resumeScore || aiResumeAnalysis.score || 'Not evaluated yet';
            const atsScore = aiResumeAnalysis.atsScore || 'Not evaluated yet';

            // Format Applied Jobs List
            const applications = await Application.find({ student: user._id }).populate('job', 'title company').lean();
            const appliedJobsList = applications.length > 0 
                ? applications.map(app => `- ${app.job?.title || 'Unknown Role'} at ${app.job?.company || 'Unknown Company'} (Status: ${app.status || 'Applied'})`).join('\n')
                : 'No job applications sent yet.';

            systemContext = `
You are the AI "Smart Placement Assistant" for a University Placement Portal. You are talking to a student named ${user.name}.
Your job is to provide extremely personalized, data-driven career advice and insights based on their exact analytics in the database.

STUDENT DATA CONTEXT:
- Target Roles: ${targetRoles}
- Current Skills: ${skills}
- AI Resume Score: ${resumeScore}/100
- ATS Compatibility Score: ${atsScore}/100
- Overall Readiness Score: ${overallScore}/100
- Topic Proficiencies: ${proficiencies}
- Mock Interview Average: ${mockInterviewsAverage}/100
- Total Applications Sent: ${applicationsCount}
- Total Shortlists: ${shortlistsCount} (Success Rate: ${successRate * 100}%)

RECENT APPLIED JOBS:
${appliedJobsList}

GUIDELINES:
1. Use the data above directly to answer their questions. If they ask "what should I improve", look at their lowest Topic Proficiency or Resume Score.
2. If they ask about applying to jobs, compare their Success Rate and suggest whether they need to upskill or fix their resume. If they ask for their jobs list, provide the list from recent applied jobs.
3. Be encouraging, concise, and professional. Use formatting (bullet points, bold) to make reading easy.
4. Do NOT mention "database", "analyticsData", or "system context". Just act as if you intelligently know their profile.
`;
        } 
        
        // 2. Context Injection for Admins
        else if (user.role === 'admin') {
            // Aggregation pipeline to get real-time insights
            const totalStudents = await User.countDocuments({ role: 'student' });
            const placedStudents = await User.countDocuments({ role: 'student', 'studentProfile.isPlaced': true });
            
            // Average scores across all students (from the analytics data we seeded)
            const stats = await User.aggregate([
                { $match: { role: 'student', 'studentProfile.analyticsData': { $exists: true } } },
                {
                    $group: {
                        _id: null,
                        avgReadiness: { $avg: '$studentProfile.analyticsData.performanceMetrics.overallReadinessScore' },
                        avgMockInterview: { $avg: '$studentProfile.analyticsData.performanceMetrics.mockInterviewsAverage' },
                        avgSuccessRate: { $avg: '$studentProfile.analyticsData.behavioralData.applicationSuccessRate' },
                        totalApps: { $sum: '$studentProfile.analyticsData.behavioralData.jobsAppliedCount' }
                    }
                }
            ]);

            const globalStats = stats[0] || { avgReadiness: 0, avgMockInterview: 0, avgSuccessRate: 0, totalApps: 0 };
            
            // Full Database Access: List all students
            const allStudents = await User.find({ role: 'student' }).select('name email studentProfile').lean();
            const studentsList = allStudents.map(s => {
                const p = s.studentProfile || {};
                const m = p.analyticsData?.performanceMetrics || {};
                return `Name: ${s.name} | Status: ${p.isPlaced ? 'Placed at ' + p.placedAt : 'Not Placed'} | Readiness: ${m.overallReadinessScore || 'N/A'}/100`;
            }).join('\n');

            systemContext = `
You are the AI "Placement Director Assistant" for a University Placement Portal. You are talking to an Admin.
Your job is to provide factual, data-driven insights and directly answer questions about specific students in the university.

AGGREGATED ENTIRE UNIVERSITY DATABASE CONTEXT:
- Total Students Enrolled: ${totalStudents}
- Total Placed Students: ${placedStudents} / ${totalStudents}
- Average Student Readiness Score: ${Math.round(globalStats.avgReadiness)}/100
- Average Mock Interview Score: ${Math.round(globalStats.avgMockInterview)}/100
- Average Application Success (Shortlist) Rate: ${Math.round(globalStats.avgSuccessRate * 100)}%
- Total Global Job Applications Sent: ${globalStats.totalApps}

COMPLETE LIST OF ALL STUDENTS IN DATABASE:
${studentsList}

GUIDELINES:
1. YOU NOW HAVE FULL ACCESS TO ALL STUDENT NAMES AND DIRECT STATUSES.
2. If the admin asks for the names of students, a list of unplaced students, or details about a specific student, YOU MUST read the "COMPLETE LIST OF ALL STUDENTS IN DATABASE" provided above and explicitly list their names to the admin.
3. NEVER say "I don't have access to specific names." You absolutely have their names in the list above. Read it and answer precisely.
4. Do NOT mention "database aggregation" or how you got the data. Just act as a strategic advisor.
`;
        } else {
            return res.status(403).json({ error: 'AI Insights are currently available for students and admins only.' });
        }

        // 3. Format messages for OpenAI/OpenRouter
        const normalizedHistory = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        const messages = [
            { role: 'system', content: systemContext },
            ...normalizedHistory,
            { role: 'user', content: message }
        ];

        // 4. Call the LLM
        const aiResponseText = await callAI(messages, 0, 1000); // 1000 max tokens

        res.json({ reply: aiResponseText });

    } catch (error) {
        console.error('Insights Chatbot Error:', error);
        res.status(500).json({ error: 'Failed to generate AI insight.' });
    }
});

module.exports = router;
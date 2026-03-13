const envPath = require('fs').existsSync(require('path').join(__dirname, '../.env.production'))
    ? '../.env.production'
    : '../.env';
require('dotenv').config({ path: require('path').join(__dirname, envPath) });
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Announcement = require('../models/Announcement');
const PlacementDrive = require('../models/PlacementDrive');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB for seeding...');

        // 1. Get existing users
        const admin = await User.findOne({ role: 'admin' });
        const recruiter = await User.findOne({ role: 'recruiter', isApprovedByAdmin: true });
        const students = await User.find({ role: 'student' }).limit(5);

        if (!admin || !recruiter || students.length === 0) {
            console.error('❌ Missing required users (admin, recruiter, or students). Run primary seed first.');
            process.exit(1);
        }

        // 2. Seed Placement Drives
        console.log('🚀 Seeding Placement Drives...');
        const drives = [
            {
                title: 'Mega Tech Hiring Drive 2026',
                company: 'Google',
                date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                description: 'Annual mega hiring drive for Software Engineering and Data Science roles.',
                venue: 'University Convention Center',
                eligibility: 'CGPA > 8.0, B.Tech CSE/IT',
                createdBy: admin._id
            },
            {
                title: 'Core Engineering Internship Drive',
                company: 'Microsoft',
                date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                description: 'Summer internship opportunities for core engineering branches.',
                venue: 'Seminar Hall 1',
                eligibility: 'Open to all branches, 3rd year students',
                createdBy: admin._id
            }
        ];
        await PlacementDrive.insertMany(drives);

        // 3. Seed Announcements
        console.log('📢 Seeding Announcements...');
        const announcements = [
            {
                title: 'New Resume Format Guidelines',
                message: 'All students are requested to update their resumes according to the new university template available in the portal.',
                targetAudience: 'students',
                createdBy: admin._id
            },
            {
                title: 'Upcoming Mock Interview Series',
                message: 'Register for the upcoming mock interview series with industry experts starting next Monday.',
                targetAudience: 'students',
                createdBy: admin._id
            },
            {
                title: 'Recruiter Dashboard Tutorial',
                message: 'We have updated our AI ranking system. Please check the new help documentation for details.',
                targetAudience: 'recruiters',
                createdBy: admin._id
            }
        ];
        await Announcement.insertMany(announcements);

        // 4. Seed Job Approvals & Hires
        console.log('💼 Seeding Job Approvals & Successful Hires...');
        const companyNames = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'];

        for (let i = 0; i < companyNames.length; i++) {
            const company = companyNames[i];

            // Create a job for this company
            const job = await Job.create({
                title: `Software Engineer - ${company}`,
                company: company,
                description: `Join the engineering team at ${company} to build scalable systems.`,
                location: 'Bangalore, India',
                type: 'Full-time',
                salary: `${15 + i * 2}-${25 + i * 2} LPA`,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                eligibility: { minCGPA: 7.5, branches: ['CSE', 'IT'] },
                postedBy: recruiter._id,
                status: 'approved'
            });

            // Make a student apply and get selected
            const student = students[i % students.length];
            await Application.create({
                job: job._id,
                student: student._id,
                status: 'selected',
                appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                aiEvaluation: { matchScore: 85 + i, recommendation: 'Strong' }
            });

            // Update student placement status
            student.studentProfile.isPlaced = true;
            student.studentProfile.placedAt = company;
            await student.save();

            console.log(`✅ ${student.name} hired by ${company}`);
        }

        console.log('✨ Dummy data seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedData();

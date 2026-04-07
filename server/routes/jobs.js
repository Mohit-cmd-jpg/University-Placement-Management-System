const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all approved jobs (for students)
router.get('/', auth, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { status: 'approved', isActive: true };
        const jobs = await Job.find(query).populate('postedBy', 'name email recruiterProfile').sort('-createdAt');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get external jobs from public APIs and JSearch
router.get('/external', auth, async (req, res) => {
    try {
        // Build the search query from user skills
        let queryStr = 'Software Developer';
        
        let skills = [];
        // Assuming we need student's skills
        // Let's fetch the full user context to be safe
        const user = await User.findById(req.user._id);
        const profile = user?.studentProfile || {};

        if (Array.isArray(profile.skills) && profile.skills.length > 0) {
            skills = profile.skills.slice(0, 3);
            queryStr = skills.join(' ');
        } else if (typeof profile.skills === 'string' && profile.skills.trim()) {
            skills = profile.skills.split(',').map(s => s.trim()).slice(0, 3);
            queryStr = skills.join(' ');
        }

        let allJobs = [];

        // 1. Array of RapidAPI keys (round-robin) handling 400 to 500 requests a month
        const rapidApiKeys = [
            process.env.RAPIDAPI_KEY_1,
            process.env.RAPIDAPI_KEY_2,
            process.env.RAPIDAPI_KEY_3,
            process.env.RAPIDAPI_KEY_4,
            process.env.RAPIDAPI_KEY_5
        ].filter(Boolean); // Only keep valid truthy keys

        if (rapidApiKeys.length > 0) {
            // Select key randomly to distribute load
            const randomKey = rapidApiKeys[Math.floor(Math.random() * rapidApiKeys.length)];
            const jsearchOptions = {
                method: 'GET',
                url: 'https://jsearch.p.rapidapi.com/search',
                params: { query: queryStr, page: '1', num_pages: '1' },
                headers: {
                    'X-RapidAPI-Key': randomKey,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                }
            };
            
            try {
                const jsearchRes = await axios.request(jsearchOptions);
                if (jsearchRes.data && jsearchRes.data.data) {
                    const jobsFound = jsearchRes.data.data.map(j => ({
                        id: j.job_id,
                        title: j.job_title,
                        company: j.employer_name,
                        location: j.job_city ? `${j.job_city}, ${j.job_country}` : 'Remote',
                        type: j.job_employment_type || 'Full-time',
                        applyUrl: j.job_apply_link || j.job_google_link,
                        source: 'LinkedIn / Indeed (JSearch)',
                        postedAt: j.job_posted_at_datetime_utc || new Date(),
                        salary: j.job_min_salary ? `$${j.job_min_salary} - $${j.job_max_salary}` : null
                    }));
                    allJobs = [...allJobs, ...jobsFound];
                }
            } catch(e) {
                console.error("JSearch API error:", e.response?.data || e.message);
            }
        }

        // 2. Fetch from Arbeitnow (Free, Europe/Remote tech jobs)
        try {
            const arbeitRes = await axios.get('https://www.arbeitnow.com/api/job-board-api?page=1');
            if (arbeitRes.data && arbeitRes.data.data) {
                let filteredArbeit = arbeitRes.data.data;
               
                // Loose filter based on first skill if skills exist
                if (skills.length > 0) {
                    filteredArbeit = arbeitRes.data.data.filter(j => {
                        const titleLower = j.title.toLowerCase();
                        return titleLower.includes(skills[0].toLowerCase()) || 
                               (skills[1] && titleLower.includes(skills[1].toLowerCase()));
                    });
                }
                
                // Keep the top 5-10
                filteredArbeit = (filteredArbeit.length > 0 ? filteredArbeit : arbeitRes.data.data).slice(0, 10);

                const formattedArbeit = filteredArbeit.map(j => ({
                    id: j.slug,
                    title: j.title,
                    company: j.company_name,
                    location: j.location,
                    type: j.remote ? 'Remote' : 'On-site',
                    applyUrl: j.url,
                    source: 'Arbeitnow',
                    postedAt: new Date(j.created_at * 1000).toISOString(),
                    salary: null
                }));
                allJobs = [...allJobs, ...formattedArbeit];
            }
        } catch(e) {
            console.error("Arbeitnow API error:", e.message);
        }

        // 3. Fetch from Remotive (Free, mostly Remote Programming jobs)
        try {
            const remotiveQuery = skills.length > 0 ? encodeURIComponent(skills[0]) : 'Software dev';
            const remotiveRes = await axios.get(`https://remotive.com/api/remote-jobs?search=${remotiveQuery}&limit=10`);
            
            if (remotiveRes.data && remotiveRes.data.jobs) {
                const formattedRemotive = remotiveRes.data.jobs.slice(0, 10).map(j => ({
                    id: String(j.id),
                    title: j.title,
                    company: j.company_name,
                    location: j.candidate_required_location || 'Global',
                    type: j.job_type,
                    applyUrl: j.url,
                    source: 'Remotive',
                    postedAt: j.publication_date,
                    salary: j.salary || null
                }));
                allJobs = [...allJobs, ...formattedRemotive];
            }
        } catch(e) {
            console.error("Remotive API error:", e.message);
        }

        // 4. Fetch from GraphQL Jobs (Niche API focused on JS/GraphQL jobs)
        try {
            const gqlRes = await axios.get('https://graphql.jobs/api');
            if (gqlRes.data && Array.isArray(gqlRes.data)) {
                // Just grab a few recent ones
                const formattedGql = gqlRes.data.slice(0, 5).map(j => ({
                    id: j.id,
                    title: j.title,
                    company: j.company?.name || 'Unknown',
                    location: (j.cities && j.cities.map(c=>c.name).join(', ')) || 'Remote',
                    type: j.commitment?.title || 'Full-time',
                    applyUrl: j.applyUrl || j.websiteUrl,
                    source: 'GraphQL Jobs',
                    postedAt: j.publishedAt || new Date(),
                    salary: null
                }));
                allJobs = [...allJobs, ...formattedGql];
            }
        } catch(e) {
            console.error("GraphQL Jobs API error:", e.message);
        }

        // Send combined jobs back, sorting by random or leave grouped by source
        allJobs = allJobs.sort(() => 0.5 - Math.random());
        res.json(allJobs);
        
    } catch (error) {
        console.error('External Jobs Endpoint Error:', error);
        res.status(500).json({ error: 'Server error while fetching external jobs' });
    }
});

// Get job attachment (MUST be before /:id route)
router.get('/:id/attachment', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        if (!job.attachmentFile) {
            return res.status(404).json({ error: 'No attachment found for this job' });
        }
        
        const buffer = Buffer.from(job.attachmentFile, 'base64');
        const contentType = job.attachmentContentType || 'application/octet-stream';
        const filename = job.attachmentFileName || 'attachment';
        
        res.set('Content-Type', contentType);
        res.set('Content-Disposition', `attachment; filename="${filename}"`);
        res.set('Content-Length', buffer.length);
        return res.send(buffer);
    } catch (error) {
        console.error('Attachment download error:', error);
        return res.status(500).json({ error: 'Error downloading attachment: ' + error.message });
    }
});

// Get job by id
router.get('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name email recruiterProfile');
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create job posting (recruiter)
router.post('/', auth, authorize('recruiter'), upload.single('attachment'), async (req, res) => {
    try {
        const jobData = { ...req.body, postedBy: req.user._id, company: req.user.recruiterProfile?.company || req.body.company };
        
        // Handle file attachment if provided
        if (req.file) {
            const base64 = req.file.buffer.toString('base64');
            jobData.attachmentFile = base64;
            jobData.attachmentFileName = req.file.originalname;
            jobData.attachmentContentType = req.file.mimetype;
        }
        
        const job = new Job(jobData);
        await job.save();

        // Notify admin
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await new Notification({
                user: admin._id,
                title: 'New Job Posting',
                message: `${req.user.name} posted a new job: ${job.title}`,
                type: 'info',
                link: '/admin/jobs'
            }).save();
        }

        res.status(201).json(job);
    } catch (error) {
        console.error('Error creating job posting:', error);
        res.status(500).json({ error: error.message || 'Error creating job posting' });
    }
});

// Update job (recruiter who posted it)
router.put('/:id', auth, authorize('recruiter'), async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
        if (!job) return res.status(404).json({ error: 'Job not found or unauthorized' });

        Object.assign(job, req.body);
        await job.save();
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: 'Error updating job' });
    }
});

// Delete job
router.delete('/:id', auth, authorize('recruiter', 'admin'), async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, postedBy: req.user._id };
        const job = await Job.findOneAndDelete(query);
        if (!job) return res.status(404).json({ error: 'Job not found or unauthorized' });
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting job' });
    }
});

// Get jobs posted by recruiter
router.get('/recruiter/my-jobs', auth, authorize('recruiter'), async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user._id }).sort('-createdAt');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

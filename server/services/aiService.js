/**
 * AI Service â€” University Placement Portal
 * Primary: GitHub Models (gpt-4o-mini)
 * Fallback: OpenRouter (openrouter/free)
 */

const OpenAI = require('openai');
const pdf = require('pdf-parse');
const fs = require('fs');

const getGitHubToken = () => {
    // Backward compatibility: older deployments may still store PAT in OPENAI_API_KEY
    return process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY || '';
};

const getOpenRouterToken = () => process.env.OPENROUTER_API_KEY || '';

// â”€â”€â”€ AI Clients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const githubModels = new OpenAI({
    apiKey: getGitHubToken() || 'not-configured',
    baseURL: 'https://models.inference.ai.azure.com',
});

const openRouter = new OpenAI({
    apiKey: getOpenRouterToken() || 'not-configured',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5051',
        'X-Title': 'University Placement Portal',
    },
});

const GITHUB_MODELS = [
    'gpt-4o-mini',
    'mistral-small',
    'meta-llama/Llama-3.2-11B-Vision-Instruct',
];
const OPENROUTER_FALLBACK_MODEL = 'openrouter/free';

// â”€â”€â”€ Utilities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Sleep for ms milliseconds
 */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const formatAIError = (err, provider) => {
    const message = err?.message || String(err);
    const lower = message.toLowerCase();

    if (lower.includes('401') || lower.includes('authentication') || lower.includes('unauthorized')) {
        return `${provider} authentication failed`;
    }
    if (lower.includes('403') || lower.includes('permission') || lower.includes('forbidden')) {
        return `${provider} permission denied`;
    }
    if (lower.includes('429') || lower.includes('rate limit') || lower.includes('quota') || lower.includes('credit')) {
        return `${provider} rate limit or quota exceeded`;
    }
    if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('etimedout')) {
        return `${provider} request timed out`;
    }

    return `${provider} error: ${message}`;
};

const extractTextContent = (response) => {
    if (!response?.choices?.length) {
        throw new Error('AI returned an empty response.');
    }

    const message = response.choices[0]?.message || {};
    const content = message.content || message.reasoning;
    if (!content) {
        throw new Error('AI returned empty content.');
    }

    if (Array.isArray(content)) {
        return content
            .map((part) => (typeof part === 'string' ? part : part?.text || ''))
            .join('')
            .trim();
    }

    return String(content).trim();
};

/**
 * Call AI providers in priority order: GitHub Models first, OpenRouter fallback.
 */
const callAI = async (messages, attempt = 0, maxTokens = 2500) => {
    const hasGitHubToken = Boolean(getGitHubToken().trim());
    const hasOpenRouterToken = Boolean(getOpenRouterToken().trim());

    if (!hasGitHubToken && !hasOpenRouterToken) {
        throw new Error('AI service is not configured. Set GITHUB_TOKEN (or OPENAI_API_KEY legacy alias) as primary, or OPENROUTER_API_KEY as fallback.');
    }

    const providers = [];
    if (hasGitHubToken) {
        for (const model of GITHUB_MODELS) {
            providers.push({ client: githubModels, provider: 'GitHub Models', model });
        }
    }
    if (hasOpenRouterToken) {
        providers.push({ client: openRouter, provider: 'OpenRouter', model: OPENROUTER_FALLBACK_MODEL });
    }

    const startIndex = Math.min(Math.max(attempt, 0), providers.length - 1);
    const errors = [];

    for (let i = startIndex; i < providers.length; i++) {
        const current = providers[i];
        try {
            console.log(`[AI] Calling ${current.provider} with model: ${current.model}`);
            const response = await current.client.chat.completions.create(
                {
                    model: current.model,
                    messages,
                    temperature: 0.4,
                    max_tokens: maxTokens,
                },
                { timeout: 30000 }
            );

            return extractTextContent(response);
        } catch (err) {
            const formatted = formatAIError(err, current.provider);
            errors.push(`${current.provider}/${current.model}: ${formatted}`);
            console.error(`[AI] ${current.provider} failed (${current.model}): ${formatted}`);
            await sleep(Math.min(2000 * (i + 1), 5000));
        }
    }

    throw new Error(`All AI providers failed. ${errors.join(' | ')}`);
};

/**
 * Safely parse JSON from AI response (handles markdown code fences and extra text)
 */
const parseJsonSafely = (text) => {
    if (!text || typeof text !== 'string') {
        throw new Error('AI returned invalid response: ' + (text ? 'not a string' : 'null/undefined'));
    }
    
    // Strip markdown code fences and control characters if present
    let cleaned = text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .replace(/[\u0000-\u001F\u007F]/g, ' ')
        .trim();
    
    // Try to find JSON array or object by looking for the first [ or { and last matching ] or }
    // This handles cases where AI adds extra text before/after JSON
    const tryParseJson = (str) => {
        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    };
    
    // First try parsing the whole cleaned string
    let result = tryParseJson(cleaned);
    if (result !== null) return result;
    
    // Try to extract JSON array
    let startIdx = cleaned.indexOf('[');
    let endIdx = cleaned.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        result = tryParseJson(cleaned.substring(startIdx, endIdx + 1));
        if (result !== null) return result;
    }
    
    // Try to extract JSON object
    startIdx = cleaned.indexOf('{');
    endIdx = cleaned.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        result = tryParseJson(cleaned.substring(startIdx, endIdx + 1));
        if (result !== null) return result;
    }
    
    // Try cleaning up common issues
    cleaned = cleaned
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/}\s*,/g, '}')  // Remove trailing commas after }
        .replace(/]\s*,/g, ']'); // Remove trailing commas after ]
    
    result = tryParseJson(cleaned);
    if (result !== null) return result;
    
    // Try extracting JSON again after cleanup
    startIdx = cleaned.indexOf('[');
    endIdx = cleaned.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        result = tryParseJson(cleaned.substring(startIdx, endIdx + 1));
        if (result !== null) return result;
    }
    
    startIdx = cleaned.indexOf('{');
    endIdx = cleaned.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        result = tryParseJson(cleaned.substring(startIdx, endIdx + 1));
        if (result !== null) return result;
    }
    
    throw new Error('AI returned non-JSON response: ' + text.slice(0, 300));
};

// â”€â”€â”€ Feature 1: Mock Test Generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Generate a balanced mock test
 * @param {string} topic - e.g. "DSA", "Aptitude", "DBMS", "OS", "Web"
 * @param {string} difficulty - "Easy" | "Medium" | "Hard"
 * @param {number} count - number of questions (default 5)
 */
const generateMockTest = async (topic, difficulty = 'Medium', count = 5) => {
    const isTechnical = !['aptitude', 'soft skills', 'english', 'verbal', 'logical reasoning', 'quantitative'].some(t =>
        topic.toLowerCase().includes(t)
    );

    console.log(`[AI] Generating ${isTechnical ? 'Technical' : 'Non-Technical'} test for topic: "${topic}"`);

    const rules = isTechnical
        ? `- Include a mix of MCQ, coding, and concept (subjective) questions.
- Distribute questions logically to cover various sub-topics within ${topic}.
- Coding questions must have clear input/output examples.
- explanation is required for ALL questions.`
        : `- Use ONLY MCQ and subjective concept questions. 
- STRICT RULE: NO CODING QUESTIONS are allowed for this topic (${topic}).
- Focus on logical, verbal, or quantitative problems suitable for ${topic}.
- explanation is required for ALL questions.`;

    const questionTemplate = isTechnical
        ? `[
    {
      "type": "mcq",
      "question": "string",
      "options": ["string","string","string","string"],
      "correctAnswer": "string (must match one option exactly)",
      "explanation": "string",
      "points": 5
    },
    {
      "type": "coding",
      "question": "string",
      "inputExample": "string",
      "outputExample": "string",
      "correctAnswer": "Brief ideal solution description or pseudocode",
      "explanation": "Brief implementation logic",
      "difficulty": "${difficulty}",
      "points": 15
    },
    {
      "type": "subjective",
      "question": "string",
      "correctAnswer": "Key points expected in a good answer",
      "explanation": "Detailed explanation of the concept",
      "points": 10
    }
  ]`
        : `[
    {
      "type": "mcq",
      "question": "string",
      "options": ["string","string","string","string"],
      "correctAnswer": "string (must match one option exactly)",
      "explanation": "string",
      "points": 5
    },
    {
      "type": "subjective",
      "question": "string",
      "correctAnswer": "Key points expected in a good answer",
      "explanation": "Detailed explanation of the problem solving logic",
      "points": 10
    }
  ]`;

    const messages = [
        {
            role: 'system',
            content:
                'You are a technical interview question generator for a university placement preparation portal. You ONLY respond with valid, minified JSON. No explanations, no markdown, no extra text.',
        },
        {
            role: 'user',
            content: `Topic: ${topic}
Difficulty: ${difficulty}
Total Questions: ${count}

Rules:
- Questions must be ONLY about the topic: ${topic}.
${rules}
- MCQ options must be plausible â€” avoid obviously wrong distractors.
- Concept questions must test understanding, not just definitions.
- correctAnswer for MCQ must be one of the option strings exactly.

Return ONLY this exact JSON structure, nothing else:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": ${questionTemplate}
}`,
        },
    ];

    try {
        const raw = await callAI(messages);
        const data = parseJsonSafely(raw);
        // Normalize: ensure every question has required fields
        data.questions = (data.questions || []).map((q) => ({
            points: q.type === 'mcq' ? 5 : q.type === 'coding' ? 15 : 10,
            ...q,
        }));
        return data;
    } catch (err) {
        console.error('[AI] generateMockTest error:', err.message);
        throw new Error('Failed to generate mock test: ' + err.message);
    }
};

// â”€â”€â”€ Feature 2: Test Answer Evaluation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Evaluate a subjective or coding answer using a rubric
 * @returns { accuracyScore, conceptScore, clarityScore, totalScore, strengths, weaknesses, improvementAdvice }
 */
const evaluateTestAnswer = async (question, studentAnswer, correctAnswer) => {
    const messages = [
        {
            role: 'system',
            content:
                'You are an experienced technical interviewer evaluating student answers objectively. You ONLY respond with valid JSON. No explanations, no markdown.',
        },
        {
            role: 'user',
            content: `Evaluate this student answer using the scoring rubric below.

Question: ${question}

Expected/Ideal Answer: ${correctAnswer || 'Use your technical knowledge to judge correctness.'}

Student Answer: ${studentAnswer || '(No answer provided)'}

Scoring Rubric:
- Accuracy (0-5): Is the answer factually/technically correct?
- Concept Understanding (0-5): Does the student demonstrate deep understanding?
- Clarity (0-5): Is the answer well-structured and clearly communicated?
- Total Score = Accuracy + Concept + Clarity (max 15)

Return ONLY this exact JSON, nothing else:
{
  "accuracyScore": 0,
  "conceptScore": 0,
  "clarityScore": 0,
  "totalScore": 0,
  "strengths": "string",
  "weaknesses": "string",
  "improvementAdvice": "string"
}`,
        },
    ];

    try {
        const raw = await callAI(messages);
        const data = parseJsonSafely(raw);
        // Validate & clamp scores
        data.accuracyScore = Math.min(5, Math.max(0, Number(data.accuracyScore) || 0));
        data.conceptScore = Math.min(5, Math.max(0, Number(data.conceptScore) || 0));
        data.clarityScore = Math.min(5, Math.max(0, Number(data.clarityScore) || 0));
        data.totalScore = data.accuracyScore + data.conceptScore + data.clarityScore;
        return data;
    } catch (err) {
        console.error('[AI] evaluateTestAnswer error:', err.message);
        // Return safe fallback
        return {
            accuracyScore: 0,
            conceptScore: 0,
            clarityScore: 0,
            totalScore: 0,
            strengths: 'Unable to evaluate at this time.',
            weaknesses: 'Please reattempt the test.',
            improvementAdvice: 'Review the topic and try again.',
        };
    }
};

// â”€â”€â”€ Feature 3: Resume Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Analyze a student resume across 5 categories
 * @returns { resumeScore, technicalSkillsScore, projectsScore, experienceScore, atsScore, communicationScore, strengths[], weaknesses[], missingSkills[], improvementSuggestions[] }
 */
const analyzeResume = async (resumeText, studentProfile = {}) => {
    const messages = [
        {
            role: 'system',
            content: 'You are a senior ATS engineer and technical recruiter with 15+ years experience at FAANG. You evaluate resumes with the same rigor as Jobscan and Resume Worded. You are STRICT — most student resumes score 40–60/100. You ONLY respond with valid JSON. No explanations, no markdown.',
        },
        {
            role: 'user',
            content: `Critically evaluate this university student resume using the ATS scoring rubric below.

Student Context:
- Department: ${studentProfile.department || 'Computer Science'}
- CGPA: ${studentProfile.cgpa || 'Not specified'}
- Listed Skills: ${(studentProfile.skills || []).join(', ') || 'Not specified'}

Resume Text:
"""
${resumeText.slice(0, 4500)}
"""

SCORING RUBRIC (each category 0-20, total max 100). Be STRICT:

1. TECHNICAL SKILLS (0-20): Start at 20, deduct:
   -5 missing 5+ in-demand skills | -4 skills not backed by projects/experience
   -3 no tools/frameworks, only languages | -2 irrelevant filler skills (MS Word) | -3 no skills section
   +2 bonus for cloud/DevOps/CI-CD (cap 20)

2. PROJECTS QUALITY (0-20): Start at 20, deduct:
   -6 fewer than 2 substantial projects | -5 no quantified impact/metrics
   -3 no tech stack details | -3 no GitHub/demo link | -4 tutorial clones only
   +2 bonus for production-deployed project (cap 20)

3. EXPERIENCE & CREDENTIALS (0-20): Start at 20, deduct:
   -7 no internship/co-op | -5 bullets lack measurable achievements
   -4 no extracurriculars/leadership/open-source | -2 missing or inconsistent dates
   -3 CGPA below 6.5 with no compensating experience
   +2 bonus for named-company internship (cap 20)

4. ATS OPTIMIZATION (0-20): Start at 20, deduct:
   -4 per missing standard section header (max -8) | -3 no contact info/LinkedIn/GitHub
   -4 keywords only in skills section, not in bullets | -3 resume over 2 pages
   -5 uses tables/columns/graphics (ATS-hostile format)
   +2 bonus for strong keyword-JD alignment (cap 20)

5. CLARITY & STRUCTURE (0-20): Start at 20, deduct:
   -5 vague responsibilities, not achievements | -4 no action verbs
   -5 spelling/grammar errors | -3 inconsistent formatting | -2 no professional summary
   +2 bonus for STAR-method with Before/After impact (cap 20)

Calibration benchmark: 80-100=Exceptional, 60-79=Good, 40-59=Average, 20-39=Weak.
Most student resumes should score 35-65. Only truly exceptional resumes score above 75.

Return ONLY this exact JSON, nothing else:
{
  "resumeScore": 0,
  "technicalSkillsScore": 0,
  "projectsScore": 0,
  "experienceScore": 0,
  "atsScore": 0,
  "clarityScore": 0,
  "criteriaBreakdown": {
    "technicalSkills": { "grade": "A/B/C/D/F", "notes": "2-sentence specific finding about this resume" },
    "projects": { "grade": "A/B/C/D/F", "notes": "2-sentence specific finding about this resume" },
    "experience": { "grade": "A/B/C/D/F", "notes": "2-sentence specific finding about this resume" },
    "ats": { "grade": "A/B/C/D/F", "notes": "2-sentence specific finding about this resume" },
    "clarity": { "grade": "A/B/C/D/F", "notes": "2-sentence specific finding about this resume" }
  },
  "strengths": ["specific strength from the resume"],
  "weaknesses": ["specific weakness found in the resume"],
  "missingSkills": ["skill1", "skill2", "skill3"],
  "suggestions": ["actionable fix 1", "actionable fix 2", "actionable fix 3"]
}`,
        },
    ];

    try {
        const raw = await callAI(messages);
        const data = parseJsonSafely(raw);
        const clamp = (v, max) => Math.min(max, Math.max(0, Number(v) || 0));
        data.technicalSkillsScore = clamp(data.technicalSkillsScore, 20);
        data.projectsScore = clamp(data.projectsScore, 20);
        data.experienceScore = clamp(data.experienceScore, 20);
        data.atsScore = clamp(data.atsScore, 20);
        data.clarityScore = clamp(data.clarityScore, 20);
        data.resumeScore = data.technicalSkillsScore + data.projectsScore + data.experienceScore + data.atsScore + data.clarityScore;
        data.criteriaBreakdown = (data.criteriaBreakdown && typeof data.criteriaBreakdown === 'object') ? data.criteriaBreakdown : {};
        data.strengths = Array.isArray(data.strengths) ? data.strengths : [];
        data.weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses : [];
        data.missingSkills = Array.isArray(data.missingSkills) ? data.missingSkills : [];
        data.suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
        return data;
    } catch (err) {
        console.error('[AI] analyzeResume error:', err.message);

        // --- KEYWORD MATCHING FALLBACK ---
        console.log('[FALLBACK] Using keyword matching engine for resume analysis.');
        const textLower = resumeText.toLowerCase();
        const currentSkills = studentProfile.skills || [];
        const matchCount = currentSkills.filter(s => textLower.includes(s.toLowerCase())).length;
        const missing = currentSkills.filter(s => !textLower.includes(s.toLowerCase()));
        const presenceRatio = currentSkills.length > 0 ? matchCount / currentSkills.length : 0.5;
        const baseScore = Math.round(10 + (presenceRatio * 7));
        return {
            resumeScore: Math.min(100, baseScore * 5),
            technicalSkillsScore: baseScore,
            projectsScore: 12,
            experienceScore: 10,
            atsScore: 13,
            clarityScore: 13,
            criteriaBreakdown: {
                technicalSkills: { grade: 'C', notes: 'Fallback analysis only. Re-analyze resume for full AI scoring.' },
                projects: { grade: 'C', notes: 'Fallback analysis only. Re-analyze resume for full AI scoring.' },
                experience: { grade: 'C', notes: 'Fallback analysis only. Re-analyze resume for full AI scoring.' },
                ats: { grade: 'C', notes: 'Fallback analysis only. Re-analyze resume for full AI scoring.' },
                clarity: { grade: 'C', notes: 'Fallback analysis only. Re-analyze resume for full AI scoring.' }
            },
            strengths: matchCount > 0 ? [`${matchCount} listed skills found in resume text`] : ['Basic resume structure present'],
            weaknesses: ['Full AI analysis unavailable — re-analyze when AI is available'],
            missingSkills: missing.slice(0, 5),
            suggestions: ['Re-upload resume for full ATS analysis', 'Add quantifiable achievements to each bullet', 'Ensure all skills appear in project/experience bullets']
        };
    }
};

// â”€â”€â”€ Feature 6: Interview Question Generation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Generate role-specific interview questions
 * @param {string} role - e.g. "Software Engineer", "Data Analyst"
 * @returns { technicalQuestions[], behavioralQuestions[], hrQuestions[] }
 */
const generateInterviewQuestions = async (role, count = 10, types = ['technical', 'behavioral', 'hr']) => {
    const messages = [
        {
            role: 'system',
            content: 'You are an expert interviewer for top tech companies. You ONLY respond with valid JSON.',
        },
        {
            role: 'user',
            content: `Generate 15 interview questions for the role: "${role}" in each category.

Return ONLY this JSON:
{
  "technicalQuestions": ["q1", "q2", ... 15 technical questions],
  "behavioralQuestions": ["q1", "q2", ... 15 behavioral questions],
  "hrQuestions": ["q1", "q2", ... 15 HR questions]
}`,
        },
    ];

    const fallbackPool = {
        technicalQuestions: [
            `Explain how a hash map works internally and its time complexity.`,
            `What is the difference between TCP and UDP? When would you use each?`,
            `Describe the SOLID principles in OOP with examples.`,
            `How would you design a URL shortener system?`,
            `Explain the difference between SQL and NoSQL databases.`,
            `What is a deadlock and how do you prevent it?`,
            `Explain Big O notation with examples for common algorithms.`,
            `What are microservices? What are their pros and cons?`,
            `How does garbage collection work in Java/JavaScript?`,
            `What is the CAP theorem? Give real-world examples.`,
            `Explain RESTful API design best practices.`,
            `What are design patterns? Explain Observer and Singleton.`,
            `How does HTTPS/TLS work to secure communication?`,
            `Explain containerization and how Docker works.`,
            `What is event-driven architecture? When should you use it?`
        ],
        behavioralQuestions: [
            `Tell me about a time you had to meet a very tight deadline.`,
            `Describe a situation where you disagreed with your team lead.`,
            `How do you handle receiving harsh or critical feedback?`,
            `Tell me about a project you are most proud of and why.`,
            `Describe a time when you had to learn a new technology quickly.`,
            `How do you prioritize when you have multiple urgent tasks?`,
            `Tell me about a time you failed. What did you learn?`,
            `Describe a situation where you had to lead a team.`,
            `How do you handle ambiguity or unclear requirements?`,
            `Tell me about a time you went above and beyond your role.`,
            `Describe a conflict you resolved with a coworker.`,
            `How do you handle stress and high-pressure situations?`,
            `Tell me about a time you mentored or helped a junior colleague.`,
            `Describe your approach to debugging a complex issue.`,
            `Tell me about a time you had to convince others of your idea.`
        ],
        hrQuestions: [
            `Why do you want to work at our company specifically?`,
            `Where do you see yourself in 5 years?`,
            `What are your salary expectations for this role?`,
            `What are your greatest strengths and weaknesses?`,
            `Why are you leaving your current position?`,
            `What motivates you to do your best work?`,
            `How would your previous manager describe you?`,
            `What is your ideal work environment?`,
            `Do you prefer working independently or in a team?`,
            `How do you maintain work-life balance?`,
            `What questions do you have for us about this role?`,
            `Walk me through your resume briefly.`,
            `What makes you stand out from other candidates?`,
            `Describe your ideal manager or leadership style.`,
            `What are your long-term career goals?`
        ]
    };

    let pool;
    try {
        const raw = await callAI(messages);
        pool = parseJsonSafely(raw);
    } catch (err) {
        console.error('[AI] generateInterviewQuestions error:', err.message);
        pool = null;
    }

    // Use AI questions if available, fallback otherwise
    const techPool = (pool && Array.isArray(pool.technicalQuestions) && pool.technicalQuestions.length > 0) ? pool.technicalQuestions : fallbackPool.technicalQuestions;
    const behPool = (pool && Array.isArray(pool.behavioralQuestions) && pool.behavioralQuestions.length > 0) ? pool.behavioralQuestions : fallbackPool.behavioralQuestions;
    const hrPool = (pool && Array.isArray(pool.hrQuestions) && pool.hrQuestions.length > 0) ? pool.hrQuestions : fallbackPool.hrQuestions;

    // Strictly enforce requested types and count
    const activeTypes = types.filter(t => ['technical', 'behavioral', 'hr'].includes(t));
    const perType = Math.floor(count / activeTypes.length);
    let extra = count % activeTypes.length;

    const result = { technicalQuestions: [], behavioralQuestions: [], hrQuestions: [] };

    for (const t of activeTypes) {
        const take = perType + (extra > 0 ? 1 : 0);
        if (extra > 0) extra--;

        if (t === 'technical') result.technicalQuestions = techPool.slice(0, take);
        else if (t === 'behavioral') result.behavioralQuestions = behPool.slice(0, take);
        else if (t === 'hr') result.hrQuestions = hrPool.slice(0, take);
    }

    return result;
};

const evaluateInterviewAnswer = async (question, studentAnswer, questionType = 'Technical') => {
    const typeGuidance = {
        'Technical': `You are evaluating a TECHNICAL interview answer.
- Check every claim and fact for correctness. If anything is wrong, explain EXACTLY what is wrong and WHY.
- If code is provided, analyze it for correctness, edge cases, time/space complexity.
- If the answer is conceptual, verify technical accuracy of every point.
- The "sampleAnswer" MUST be a complete, correct, expert-level answer to the question (at least 150 words). Include code if the question asks for it.`,
        'Behavioral': `You are evaluating a BEHAVIORAL interview answer.
- Check if the answer uses the STAR method (Situation, Task, Action, Result).
- Point out which STAR components are missing or weak.
- The "sampleAnswer" MUST be a complete, well-structured behavioral answer using STAR method (at least 150 words).`,
        'HR': `You are evaluating an HR/culture fit interview answer.
- Evaluate sincerity, clarity, and alignment with professional standards.
- Point out vague or generic statements that should be more specific.
- The "sampleAnswer" MUST be a complete, professional HR answer (at least 100 words).`
    };

    const guidance = typeGuidance[questionType] || typeGuidance['Technical'];

    const messages = [
        {
            role: 'system',
            content: 'You are a senior interviewer at Google/Meta. You give brutally honest but constructive feedback. You ALWAYS explain exactly what is wrong and provide a complete correct answer. You ONLY respond with valid JSON. Never return empty strings.',
        },
        {
            role: 'user',
            content: `${guidance}

QUESTION: ${question}

STUDENT'S ANSWER: ${studentAnswer}

EVALUATION RULES:
1. Score 1-10. Be fair but honest. A partial answer should get 3-5, a good answer 6-8, only perfect gets 9-10.
2. "feedback": Write 3-5 sentences. First acknowledge what's correct. Then explain SPECIFICALLY what is incorrect or missing and WHY it matters. Reference specific parts of the student's answer.
3. "sampleAnswer": Write a COMPLETE correct answer that would score 9-10. This is the most important field. It must be a full, detailed, expert-level response â€” NOT a summary or tips. If it's a coding question, include working code.  
4. "strengths": List 2-3 specific things the student did well (with references to their answer).
5. "weaknesses": List 2-3 specific mistakes or gaps. Explain WHY each is wrong or problematic.
6. "improvementTips": Give 3-4 actionable steps to improve, specific to this answer.

Return ONLY valid JSON. Every field MUST have substantial content (never empty or one word):
{
  "score": 6,
  "feedback": "Your answer correctly identifies X and Y, which shows understanding of the basics. However, you incorrectly stated that Z because [reason]. You also missed the important concept of W, which is critical because [reason]. Overall, the answer demonstrates foundational knowledge but lacks the depth expected in a technical interview.",
  "sampleAnswer": "A complete, detailed, expert-level answer that would score 9-10...",
  "strengths": "1. Correctly identified X. 2. Good structure in explaining Y.",
  "weaknesses": "1. Incorrectly stated Z â€” the correct approach is [correction]. 2. Missing coverage of W.",
  "improvementTips": "1. Study [topic] to understand why Z works differently. 2. Practice explaining W with real examples. 3. Structure answers with introduction, main points, and conclusion."
}`,
        },
    ];

    try {
        const raw = await callAI(messages, 0, 3500);
        const data = parseJsonSafely(raw);
        data.score = Math.min(10, Math.max(1, Number(data.score) || 5));
        data.feedback = data.feedback || 'Your answer has been evaluated. Review the strengths and weaknesses below.';
        data.sampleAnswer = data.sampleAnswer || data.improvementTips || 'Please re-submit for a detailed model answer.';
        data.strengths = data.strengths || 'Answer addressed the question.';
        data.weaknesses = data.weaknesses || 'Could benefit from more depth and examples.';
        data.improvementTips = data.improvementTips || 'Structure your answers with concrete examples and clear reasoning.';
        return data;
    } catch (err) {
        console.error('[AI] evaluateInterviewAnswer error:', err.message);
        return {
            score: 5,
            feedback: 'Unable to fully evaluate due to a service issue. Your response was recorded.',
            sampleAnswer: 'Please try submitting again for a detailed model answer.',
            strengths: 'Answer was submitted.',
            weaknesses: 'Evaluation service temporarily unavailable.',
            improvementTips: 'Please try again later.'
        };
    }
};

// â”€â”€â”€ PDF Extraction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Extract text from a PDF resume buffer
 */
const extractTextFromPDF = async (buffer) => {
    try {
        const data = await pdf(buffer);
        return data.text || '';
    } catch (err) {
        console.error('[PDF] Extraction error:', err.message);
        throw new Error('Failed to parse PDF resume');
    }
};

// â”€â”€â”€ Feature 3: Resume Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Analyze a student resume using ATS-standard criteria
 * @returns { resumeScore, technicalSkillsScore, projectsScore, experienceScore, atsScore, clarityScore, criteriaBreakdown, strengths[], weaknesses[], missingSkills[], suggestions[] }
 */
const analyzeResume = async (resumeText, studentProfile = {}) => {
    const messages = [
        {
            role: 'system',
            content: 'You are a senior ATS engineer and technical recruiter with 15+ years of experience at FAANG. You evaluate resumes with the same rigour as Jobscan and Resume Worded. You are STRICT â€” the average student resume scores 45â€“60/100. You ONLY respond with valid JSON. No explanations, no markdown.',
        },
        {
            role: 'user',
            content: `Critically evaluate this university student resume using the ATS scoring rubric below.

Student Context:
- Department: ${studentProfile.department || 'Computer Science'}
- CGPA: ${studentProfile.cgpa || 'Not specified'}
- Listed Skills: ${(studentProfile.skills || []).join(', ') || 'Not specified'}

Resume Text:
"""
${resumeText.slice(0, 4500)}
"""

SCORING RUBRIC (each category out of 20, total 100):

1. TECHNICAL SKILLS (0â€“20) â€” Start at 20, deduct:
   â€¢ Missing 5+ in-demand skills: -5 | Skills not backed by projects/experience: -4
   â€¢ No tools/frameworks (only languages): -3 | Irrelevant filler skills (MS Word): -2 | No skills section: -3
   Bonus for cloud/DevOps/CI-CD: +2 (cap 20)

2. PROJECTS QUALITY (0â€“20) â€” Start at 20, deduct:
   â€¢ Fewer than 2 substantial projects: -6 | No quantified impact/metrics: -5
   â€¢ No tech stack details: -3 | No GitHub/demo link: -3 | Tutorial clones only: -4
   Bonus for production-deployed project: +2 (cap 20)

3. EXPERIENCE & CREDENTIALS (0â€“20) â€” Start at 20, deduct:
   â€¢ No internship/co-op: -7 | Bullets lack achievements with numbers: -5
   â€¢ No extracurriculars/leadership/open-source: -4 | Missing or inconsistent dates: -2
   â€¢ CGPA below 6.5 with no compensating experience: -3
   Bonus for named-company internship: +2 (cap 20)

4. ATS OPTIMIZATION (0â€“20) â€” Start at 20, deduct:
   â€¢ Missing standard section headers (Education/Experience/Projects/Skills): -4 each (max -8)
   â€¢ No contact info/LinkedIn/GitHub: -3 | Keywords only in skills, not bullets: -4
   â€¢ Resume >2 pages for student: -3 | Uses tables/columns/graphics (ATS-hostile): -5
   Bonus for strong keyword-JD alignment: +2 (cap 20)

5. CLARITY & STRUCTURE (0â€“20) â€” Start at 20, deduct:
   â€¢ Vague responsibilities instead of achievements: -5 | No action verbs: -4
   â€¢ Spelling/grammar errors: -5 | Inconsistent formatting: -3 | No professional summary: -2
   Bonus for STAR-method with Before/After impact: +2 (cap 20)

Calibration (be strict): 80â€“100=Exceptional, 60â€“79=Good, 40â€“59=Average, 20â€“39=Weak, 0â€“19=Very weak.

Return ONLY this exact JSON, nothing else:
{
  "resumeScore": 0,
  "technicalSkillsScore": 0,
  "projectsScore": 0,
  "experienceScore": 0,
  "atsScore": 0,
  "clarityScore": 0,
  "criteriaBreakdown": {
    "technicalSkills": { "grade": "A/B/C/D/F", "notes": "2-sentence specific finding" },
    "projects": { "grade": "A/B/C/D/F", "notes": "2-sentence specific finding" },
    "experience": { "grade": "A/B/C/D/F", "notes": "2-sentence specific finding" },
    "ats": { "grade": "A/B/C/D/F", "notes": "2-sentence specific finding" },
    "clarity": { "grade": "A/B/C/D/F", "notes": "2-sentence specific finding" }
  },
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weaknesses": ["specific weakness 1", "specific weakness 2", "specific weakness 3"],
  "missingSkills": ["skill1", "skill2", "skill3"],
  "suggestions": ["actionable fix 1", "actionable fix 2", "actionable fix 3"]
}`,
        },
    ];

    try {
        const raw = await callAI(messages);
        const data = parseJsonSafely(raw);
        const clamp = (v, max) => Math.min(max, Math.max(0, Number(v) || 0));
        data.technicalSkillsScore = clamp(data.technicalSkillsScore, 20);
        data.projectsScore = clamp(data.projectsScore, 20);
        data.experienceScore = clamp(data.experienceScore, 20);
        data.atsScore = clamp(data.atsScore, 20);
        data.clarityScore = clamp(data.clarityScore, 20);
        data.resumeScore = data.technicalSkillsScore + data.projectsScore + data.experienceScore + data.atsScore + data.clarityScore;
        data.criteriaBreakdown = (data.criteriaBreakdown && typeof data.criteriaBreakdown === 'object') ? data.criteriaBreakdown : {};
        data.strengths = Array.isArray(data.strengths) ? data.strengths : [];
        data.weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses : [];
        data.missingSkills = Array.isArray(data.missingSkills) ? data.missingSkills : [];
        data.suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
        return data;
    } catch (err) {
        console.error('[AI] analyzeResume error:', err.message);
        console.log('[FALLBACK] Using keyword matching engine for resume analysis.');
  "interviewPreparationTips": ["string", "string"],
  "suggestedCompanies": ["string", "string"]
}`
        }
    ];

    const attemptGeneration = async (retries = 2) => {
        try {
            const raw = await callAI(messages, 0, 4000);
            // Clean up markdown formatting if the model wraps the output in ```json ... ```
            const jsonStr = raw.replace(/```(json)?|```/g, '').trim();
            const data = JSON.parse(jsonStr);

            // Structure validation & normalization
            if (!Array.isArray(data.roadmap) || data.roadmap.length < 4) {
                console.warn(`[AI] Generated roadmap has only ${data.roadmap?.length || 0} phases. Retrying...`);
                if (retries > 0) return attemptGeneration(retries - 1);
                throw new Error("AI failed to generate a sufficient number of roadmap phases.");
            }

            // Ensure roadmap topics and tasks are objects
            data.roadmap = data.roadmap.map(phase => ({
                phase: phase.phase || 'Phase 1',
                title: phase.title || 'Core Fundamentals',
                duration: phase.duration || '2 weeks',
                focusArea: phase.focusArea || 'General',
                strategy: phase.strategy || phase.practiceStrategy || 'Practice exercises',
                topics: Array.isArray(phase.topics) ? phase.topics.map(t =>
                    typeof t === 'string' ? { name: t, completed: false } : (t || { name: 'Topic', completed: false })
                ) : [],
                tasks: Array.isArray(phase.tasks) ? phase.tasks.map(t =>
                    typeof t === 'string' ? { name: t, completed: false } : (t || { name: 'Task', completed: false })
                ) : []
            }));

            // Normalize string arrays to handle AI returning objects instead of strings
            const normalizeStringArray = (arr, key1, key2) => {
                if (!Array.isArray(arr)) return [];
                return arr.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        const v1 = item[key1] || item.name || item.title || item.skill || item.resource || item.gap || item.company || item.tip || '';
                        const v2 = item[key2] || item.description || item.whyItMatters || item.whyItIsUseful || item.reason || '';
                        return `${v1}${v2 && v1 ? ': ' + v2 : v2}`.trim();
                    }
                    return String(item);
                });
            };

            data.recommendedProjects = normalizeStringArray(data.recommendedProjects, 'title', 'description');
            data.prioritySkills = normalizeStringArray(data.prioritySkills, 'skill', 'whyItMatters');
            data.recommendedResources = normalizeStringArray(data.recommendedResources, 'resource', 'whyItIsUseful');
            data.skillGapAnalysis = normalizeStringArray(data.skillGapAnalysis, 'gap', 'description');
            data.interviewPreparationTips = normalizeStringArray(data.interviewPreparationTips, 'tip', 'description');
            data.suggestedCompanies = normalizeStringArray(data.suggestedCompanies, 'company', 'reason');

            return data;
        } catch (err) {
            if (retries > 0) {
                console.warn(`[AI] Error parsing roadmap generation, parsing failed. Retrying... (${retries} left)`);
                return attemptGeneration(retries - 1);
            }
            console.error('[AI] generateRecommendations error:', err.message);

            // --- FALLBACK PLAN ---
            return {
                targetRole: targetRole,
                overallAssessment: "Based on a basic analysis, continue improving your core skills and practicing mock tests.",
                skillGapAnalysis: ["Advanced algorithms", "System design details"],
                prioritySkills: ["Data Structures", targetRole.includes('Data') ? "Python" : "JavaScript"],
                roadmap: [
                    {
                        phase: "Phase 1",
                        title: "Core Fundamentals",
                        duration: "2-4 weeks",
                        focusArea: "Language Syntax & Basics",
                        strategy: "Daily coding exercises and theoretical review.",
                        topics: [{ name: "Review basic syntax", completed: false }, { name: "Practice easy logic puzzles", completed: false }],
                        tasks: [{ name: "Solve 10 easy questions", completed: false }]
                    },
                    {
                        phase: "Phase 2",
                        title: "Data Structures",
                        duration: "3-4 weeks",
                        focusArea: "Arrays, LinkedLists, Trees",
                        strategy: "Focus on implementation and traversing structures.",
                        topics: [{ name: "Linked Lists", completed: false }, { name: "Trees & Graphs", completed: false }],
                        tasks: [{ name: "Implement a Binary Search Tree", completed: false }]
                    },
                    {
                        phase: "Phase 3",
                        title: "Algorithms & Problem Solving",
                        duration: "3-4 weeks",
                        focusArea: "Sorting, Searching, DP",
                        strategy: "Identify patterns and optimize time complexity.",
                        topics: [{ name: "Dynamic Programming", completed: false }, { name: "Graph Algorithms", completed: false }],
                        tasks: [{ name: "Solve 20 medium LeetCode questions", completed: false }]
                    },
                    {
                        phase: "Phase 4",
                        title: "Interview Preparation",
                        duration: "2-3 weeks",
                        focusArea: "Mock Interviews & System Design",
                        strategy: "Do mock interviews, refine resume, study system design basics.",
                        topics: [{ name: "System Design Basics", completed: false }, { name: "Behavioral Questions", completed: false }],
                        tasks: [{ name: "Conduct 2 mock interviews", completed: false }]
                    }
                ],
                recommendedProjects: [
                    "Portfolio Website: Showcase your resume online."
                ],
                recommendedResources: ["LeetCode", "FreeCodeCamp"],
                interviewPreparationTips: ["Practice speaking clearly", "Always use the STAR method"],
                suggestedCompanies: ["Local Tech Startups", "IT Servicing Firms"]
            };
        }
    };

    return attemptGeneration(2);
};

module.exports = {
    // New API
    generateMockTest,
    evaluateTestAnswer,
    analyzeResume,
    rankCandidateForJob,
    generateInterviewQuestions,
    evaluateInterviewAnswer,
    extractTextFromPDF,
    generateRecommendations,
    // Legacy aliases
    evaluateTestAnswers,
    evaluateCandidateForJob,
};

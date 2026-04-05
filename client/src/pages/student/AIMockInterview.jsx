import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { FiMic, FiSend, FiSquare, FiCheckCircle, FiUpload, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Animated Score Ring ───
const ScoreRing = ({ score, max = 100, size = 160, strokeWidth = 10, color }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const [animatedScore, setAnimatedScore] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 300);
        return () => clearTimeout(timer);
    }, [score]);
    const offset = circumference - (animatedScore / max) * circumference;
    const scoreColor = color || (score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444');
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(37,99,235,0.15)" strokeWidth={strokeWidth} fill="none" />
                <circle cx={size/2} cy={size/2} r={radius} stroke={scoreColor} strokeWidth={strokeWidth} fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black" style={{ color: scoreColor }}>{animatedScore}</span>
                <span className="text-xs text-gray-500">/ {max}</span>
            </div>
        </div>
    );
};

// ─── Criteria Bar ───
const CriteriaBar = ({ label, score, max = 20, feedback }) => {
    const pct = (score / max) * 100;
    const barColor = pct >= 70 ? '#10b981' : pct >= 45 ? '#f59e0b' : '#ef4444';
    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">{label}</span>
                <span className="text-gray-900 font-bold">{score}/{max}</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ backgroundColor: barColor }} />
            </div>
            {feedback && <p className="text-xs text-gray-600 mt-1">{feedback}</p>}
        </div>
    );
};

// ─── Audio Waveform Visualizer ───
const WaveformVisualizer = ({ isActive, color = '#2563eb' }) => (
    <div className="flex items-center gap-[3px] h-8">
        {[...Array(12)].map((_, i) => (
            <div key={i} className="w-[3px] rounded-full transition-all duration-150" style={{
                backgroundColor: color, opacity: isActive ? 0.8 : 0.3,
                height: isActive ? `${12 + Math.random() * 20}px` : '6px',
                animation: isActive ? `waveform 0.4s ease-in-out ${i * 0.05}s infinite alternate` : 'none',
            }} />
        ))}
    </div>
);

// ─── AI Avatar ───
const AIAvatar = ({ isSpeaking }) => (
    <div className="relative">
        <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl ${isSpeaking ? 'ring-4 ring-blue-400/50 animate-pulse' : ''}`}>
            <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
                <circle cx="40" cy="28" r="14" fill="white" opacity="0.95"/>
                <path d="M18 65c0-12 10-22 22-22s22 10 22 22" stroke="white" strokeWidth="3" fill="white" opacity="0.85"/>
                <circle cx="34" cy="26" r="2" fill="#1d4ed8"/><circle cx="46" cy="26" r="2" fill="#1d4ed8"/>
                <path d="M35 34 Q40 38 45 34" stroke="#1d4ed8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
        </div>
        {isSpeaking && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2"><WaveformVisualizer isActive={true} /></div>}
    </div>
);

const AIMockInterview = () => {
    const [step, setStep] = useState('setup');
    const [jobRole, setJobRole] = useState('Software Engineer');
    const [questionType, setQuestionType] = useState('technical');
    const [difficulty, setDifficulty] = useState('Medium');
    const [questionCount, setQuestionCount] = useState(8);
    const [resume, setResume] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [candidateProfile, setCandidateProfile] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [interviewTime, setInterviewTime] = useState(0);
    const [showTranscript, setShowTranscript] = useState(false);
    const [expandedQ, setExpandedQ] = useState(null);
    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const speakingTimeoutRef = useRef(null);
    const isInterviewActiveRef = useRef(false);
    const userInputRef = useRef(userInput);
    const timerRef = useRef(null);
    const [voices, setVoices] = useState([]);

    useEffect(() => { userInputRef.current = userInput; }, [userInput]);

    // Cleanup
    useEffect(() => {
        return () => {
            isInterviewActiveRef.current = false;
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            [speakingTimeoutRef, silenceTimerRef, timerRef].forEach(r => r.current && clearTimeout(r.current));
            if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Load voices
    useEffect(() => {
        const load = () => setVoices(window.speechSynthesis.getVoices());
        load();
        if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = load;
    }, []);

    // Timer
    useEffect(() => {
        if (step === 'interview') {
            timerRef.current = setInterval(() => setInterviewTime(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [step]);

    const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

    const questionsAsked = chatHistory.filter(m => m.role === 'assistant').length;

    // ─── Speech ───
    const speakText = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (voices.length > 0) {
            const v = voices.find(v => v.name.includes("Google US English") || v.name.includes("Zira") || v.lang === "en-US");
            if (v) utterance.voice = v;
        }
        utterance.rate = 1.0; utterance.pitch = 1.05;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (!isInterviewActiveRef.current) return;
            speakingTimeoutRef.current = setTimeout(() => { if (isInterviewActiveRef.current) toggleListening(); }, 500);
        };
        window.speechSynthesis.speak(utterance);
    }, [voices]);

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
        if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    };

    // ─── Chat Submission ───
    const submitChat = useCallback(async (textToSubmit) => {
        if (!isInterviewActiveRef.current) return;
        if (recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); }
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (!textToSubmit.trim()) textToSubmit = "(Candidate did not provide a response)";
        stopSpeaking();
        const newMessage = { role: 'user', content: textToSubmit };
        const updatedChat = [...chatHistory, newMessage];
        setChatHistory(updatedChat);
        setUserInput('');
        setIsLoading(true);
        try {
            const res = await api.post('/preparation/mock-interview/chat', {
                candidateProfile, jobRole, questionType, chatHistory: updatedChat, difficulty, questionCount
            });
            setChatHistory([...updatedChat, { role: 'assistant', content: res.data.reply }]);
            speakText(res.data.reply);
        } catch (err) { toast.error('Failed to send message.'); }
        finally { setIsLoading(false); }
    }, [chatHistory, candidateProfile, jobRole, questionType, difficulty, questionCount, speakText]);

    // ─── Speech Recognition ───
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            const recognition = new SR();
            recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
            recognition.onresult = (event) => {
                let t = '';
                for (let i = 0; i < event.results.length; i++) t += event.results[i][0].transcript;
                setUserInput(t);
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => submitChat(userInputRef.current), 10000);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };
    }, [chatHistory, submitChat]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop(); setIsListening(false);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        } else {
            if (!recognitionRef.current) { toast.error('Voice Recognition not supported.'); return; }
            setUserInput(''); recognitionRef.current.start(); setIsListening(true);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => submitChat(""), 10000);
        }
    }, [isListening, submitChat]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

    // ─── Actions ───
    const startInterview = async (e) => {
        e.preventDefault();
        try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { toast.error('Microphone access required.'); return; }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('jobRole', jobRole); formData.append('questionType', questionType);
        formData.append('difficulty', difficulty); formData.append('questionCount', questionCount);
        if (resume) formData.append('resume', resume);
        try {
            const res = await api.post('/preparation/mock-interview/start', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setCandidateProfile(res.data.candidateProfile);
            setChatHistory([{ role: 'assistant', content: res.data.initialReply }]);
            isInterviewActiveRef.current = true; setStep('interview'); setInterviewTime(0);
            speakText(res.data.initialReply);
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to start.'); }
        finally { setIsLoading(false); }
    };

    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!isInterviewActiveRef.current || !userInput.trim()) return;
        if (isListening && recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); }
        stopSpeaking();
        const updatedChat = [...chatHistory, { role: 'user', content: userInput }];
        setChatHistory(updatedChat); setUserInput(''); setIsLoading(true);
        try {
            const res = await api.post('/preparation/mock-interview/chat', {
                candidateProfile, jobRole, questionType, chatHistory: updatedChat, difficulty, questionCount
            });
            setChatHistory([...updatedChat, { role: 'assistant', content: res.data.reply }]);
            speakText(res.data.reply);
        } catch { toast.error('Failed to send message.'); }
        finally { setIsLoading(false); }
    };

    const endInterview = async () => {
        isInterviewActiveRef.current = false; stopSpeaking();
        [silenceTimerRef, timerRef].forEach(r => { if (r.current) { clearTimeout(r.current); clearInterval(r.current); } });
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false); setIsLoading(true);
        try {
            const res = await api.post('/preparation/mock-interview/evaluate', { jobRole, questionType, chatHistory, difficulty });
            setEvaluation(res.data.evaluation); setStep('evaluation');
        } catch { toast.error('Failed to generate evaluation.'); }
        finally { setIsLoading(false); }
    };

    const resetInterview = () => { setStep('setup'); setChatHistory([]); setEvaluation(null); setInterviewTime(0); };

    // ─── RENDER ───
    return (
        <Layout title="AI Mock Interview">
            <style>{`
                @keyframes waveform { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
                @keyframes shimmer { 0% { backgroundPosition: -1000px 0; } 100% { backgroundPosition: 1000px 0; } }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
                .interview-bg { background: var(--bg-dark); }
                .interview-bg-alt { background: var(--bg-dark); }
                .glass-card { background: rgba(255,255,255,0.6); backdrop-filter: blur(12px) saturate(180%); border: 1px solid var(--border-glass); box-shadow: var(--shadow-glass); }
                .glass-card-sm { background: rgba(255,255,255,0.5); backdrop-filter: blur(8px); border: 1px solid var(--border-light); }
                .glow-btn { box-shadow: 0 0 20px rgba(37,99,235,0.3), 0 0 40px rgba(37,99,235,0.1); transition: box-shadow 0.3s ease; }
                .gradient-btn { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; }
                .gradient-btn:hover { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); box-shadow: 0 0 20px rgba(37,99,235,0.5); }
                .input-field { background: rgba(255,255,255,1); border: 1px solid var(--border); transition: all 0.3s ease; color: var(--text-primary); }
                .input-field:focus { background: var(--bg-input); border-color: #2563eb; box-shadow: inset 0 0 0 2px rgba(37,99,235,0.1); }
                .input-field::placeholder { color: var(--text-muted); }
                .float-animation { animation: float 3s ease-in-out infinite; }
                .interview-fullscreen { position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100vh; z-index: 999; margin: 0 !important; padding: 0 !important; overflow: hidden; }
            `}</style>

            {/* ═══ SETUP ═══ */}
            {step === 'setup' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen interview-bg py-12 px-4">
                    <div className="max-w-2xl mx-auto">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
                            <div className="text-center mb-10">
                                <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.1 }}
                                    className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg float-animation">
                                    <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none">
                                        <circle cx="20" cy="14" r="7" fill="white" opacity="0.95"/>
                                        <path d="M9 33c0-6 5-11 11-11s11 5 11 11" fill="white" opacity="0.85"/>
                                        <circle cx="13" cy="12" r="1.5" fill="#1d4ed8" opacity="0.8"/><circle cx="27" cy="12" r="1.5" fill="#1d4ed8" opacity="0.8"/>
                                    </svg>
                                </motion.div>
                                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                    AI Mock Interview
                                </h1>
                                <p className="text-gray-600 mt-3 text-lg">Practice with AI-powered realistic interviews powered by advanced language models</p>
                            </div>

                            <form onSubmit={startInterview} className="space-y-6">
                                {/* Job Role */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2.5 uppercase tracking-wider">
                                        🎯 Target Role *
                                    </label>
                                    <input type="text" value={jobRole} onChange={e => setJobRole(e.target.value)} required placeholder="e.g. Senior Frontend Engineer"
                                        className="input-field w-full px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none" />
                                </div>

                                {/* Interview Type & Difficulty */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2.5 uppercase tracking-wider">
                                            📚 Interview Type
                                        </label>
                                        <select value={questionType} onChange={e => setQuestionType(e.target.value)}
                                            className="input-field w-full px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 outline-none appearance-none cursor-pointer">
                                            <option value="technical" className="bg-white">Technical</option>
                                            <option value="behavioral" className="bg-white">Behavioral</option>
                                            <option value="hr" className="bg-white">HR</option>
                                            <option value="system-design" className="bg-white">System Design</option>
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2.5 uppercase tracking-wider">
                                            ⚡ Difficulty
                                        </label>
                                        <div className="flex gap-2">
                                            {['Easy','Medium','Hard'].map(d => (
                                                <button key={d} type="button" onClick={() => setDifficulty(d)}
                                                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${difficulty === d
                                                        ? 'gradient-btn text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Question Count */}
                                <div className="glass-card rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            📝 Number of Questions
                                        </label>
                                        <span className="text-lg font-bold text-blue-600">
                                            {questionCount}
                                        </span>
                                    </div>
                                    <input type="range" min="3" max="10" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}
                                        className="w-full accent-blue-500 h-2 bg-gray-200 rounded-full cursor-pointer" />
                                    <div className="flex justify-between text-xs text-gray-600 mt-2"><span>3 (Quick)</span><span>10 (Full)</span></div>
                                </div>

                                {/* Resume Upload */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2.5 uppercase tracking-wider">
                                        📄 Resume (PDF - Optional)
                                    </label>
                                    <div className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl p-8 text-center transition-all cursor-pointer bg-blue-50"
                                        onClick={() => document.getElementById('resume-input').click()}>
                                        <div className="flex justify-center mb-3">
                                            <FiUpload className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700">{resume ? resume.name : 'Upload your resume'}</p>
                                        <p className="text-xs text-gray-600 mt-1">PDF format • Max 5MB</p>
                                        <input id="resume-input" type="file" accept="application/pdf" onChange={e => setResume(e.target.files[0])} className="hidden" />
                                    </div>
                                </div>

                                {/* Start Button */}
                                <button type="submit" disabled={isLoading}
                                    className="gradient-btn w-full text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg glow-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all mt-8">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                            Preparing Your Interview...
                                        </>
                                    ) : (
                                        <>
                                            <span>🚀</span> Start Interview
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* ═══ INTERVIEW ═══ */}
            {step === 'interview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="interview-fullscreen bg-white flex flex-col" style={{ marginTop: 0 }}>
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg" />
                            <span className="text-gray-900 font-bold tracking-wide">Live Interview</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 font-medium">{jobRole} • {questionType}</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2 text-gray-700 text-sm font-mono bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                <FiClock className="w-4 h-4 text-blue-600" />
                                {formatTime(interviewTime)}
                            </div>
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
                                Q{questionsAsked}/{questionCount}
                            </span>
                            <button onClick={endInterview} className="text-sm font-semibold border border-red-300 hover:bg-red-50 hover:border-red-400 px-4 py-1.5 rounded-lg text-red-600 flex items-center gap-2 transition-all">
                                <FiSquare className="w-3.5 h-3.5" /> End Session
                            </button>
                        </div>
                    </div>

                    {/* Main area */}
                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        {/* AI Panel */}
                        <div className="lg:w-1/3 flex flex-col items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gradient-to-b from-blue-50 to-white">
                            <AIAvatar isSpeaking={isSpeaking} />
                            <h3 className="text-gray-900 font-bold text-xl mt-5">Sarah Chen</h3>
                            <p className="text-gray-600 text-sm font-medium">Senior AI Interviewer</p>
                            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="mt-5 glass-card rounded-xl px-5 py-3">
                                <span className={`text-sm font-semibold transition-colors ${isSpeaking ? 'text-blue-600' : isLoading ? 'text-amber-600' : 'text-green-600'}`}>
                                    {isSpeaking ? '🎙️ Speaking...' : isLoading ? '🤔 Thinking...' : '👂 Listening'}
                                </span>
                            </motion.div>
                        </div>

                        {/* Chat / Transcript */}
                        <div className="flex-1 flex flex-col bg-white">
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                                {chatHistory.map((msg, idx) => (
                                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl transition-all ${msg.role === 'assistant'
                                            ? 'glass-card text-gray-800 rounded-tl-sm shadow-sm border border-blue-100' : 'bg-blue-600 text-white rounded-tr-sm shadow-md'}`}>
                                            <span className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: msg.role === 'assistant' ? '#2563eb' : 'white' }}>
                                                {msg.role === 'assistant' ? '🤖 Sarah' : '👤 You'}
                                            </span>
                                            <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start"><div className="glass-card p-4 rounded-2xl rounded-tl-sm flex items-center gap-3 shadow-sm border border-blue-100">
                                        <span className="text-[10px] font-bold text-blue-600 uppercase">Sarah</span>
                                        <span className="flex gap-1.5">{[0,1,2].map(i => <motion.span key={i} className="w-2 h-2 bg-blue-600 rounded-full" animate={{ y: [-4, 4, -4] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.1 }} />)}</span>
                                    </div></div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input bar */}
                            <div className="p-4 border-t border-gray-200 bg-white shadow-sm">
                                <form onSubmit={sendMessage} className="flex gap-3 items-center">
                                    <motion.button type="button" onClick={toggleListening} disabled={isLoading}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all font-bold ${isListening
                                            ? 'bg-red-100 border-2 border-red-500 text-red-600 shadow-md' : 'glass-card text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-300'} disabled:opacity-50`}>
                                        <FiMic className="w-6 h-6" />
                                    </motion.button>
                                    <input value={userInput} onChange={e => setUserInput(e.target.value)} disabled={isLoading || isListening}
                                        placeholder={isListening ? "Listening... speak now" : "Type your answer..."} 
                                        className="input-field flex-1 h-14 px-5 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:ring-opacity-50 outline-none" />
                                    <motion.button type="submit" disabled={isLoading || !userInput.trim()}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className="w-14 h-14 shrink-0 gradient-btn rounded-2xl flex items-center justify-center disabled:opacity-30 transition-all shadow-md">
                                        <FiSend className="w-5 h-5" />
                                    </motion.button>
                                </form>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ═══ EVALUATION ═══ */}
            {step === 'evaluation' && evaluation && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen interview-bg py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 mb-6">
                            <div className="text-center mb-8">
                                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 0.1 }}>
                                    <div className="inline-block p-4 rounded-full bg-green-100 border border-green-300 mb-4">
                                        <FiCheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                </motion.div>
                                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Interview Complete! 🎉</h1>
                                <p className="text-gray-600">{jobRole} • {questionType} • {difficulty} • {formatTime(interviewTime)}</p>
                            </div>

                            {/* Score Ring */}
                            <div className="flex justify-center mb-8">
                                <ScoreRing score={evaluation.score || 0} />
                            </div>
                        </motion.div>

                        {/* Criteria Breakdown */}
                        {evaluation.criteria && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                                    Performance Breakdown
                                </h2>
                                <div className="space-y-5">
                                    <CriteriaBar label="Technical Accuracy" score={evaluation.criteria.technicalAccuracy?.score || 0} feedback={evaluation.criteria.technicalAccuracy?.feedback} />
                                    <CriteriaBar label="Communication Clarity" score={evaluation.criteria.communicationClarity?.score || 0} feedback={evaluation.criteria.communicationClarity?.feedback} />
                                    <CriteriaBar label="Problem Solving" score={evaluation.criteria.problemSolving?.score || 0} feedback={evaluation.criteria.problemSolving?.feedback} />
                                    <CriteriaBar label="Confidence & Delivery" score={evaluation.criteria.confidenceDelivery?.score || 0} feedback={evaluation.criteria.confidenceDelivery?.feedback} />
                                    <CriteriaBar label="Role Relevance" score={evaluation.criteria.roleRelevance?.score || 0} feedback={evaluation.criteria.roleRelevance?.feedback} />
                                </div>
                            </motion.div>
                        )}

                        {/* Feedback */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="text-2xl">💡</span> Overall Feedback
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-lg">{evaluation.feedback}</p>
                        </motion.div>

                        {/* Strengths & Improvements */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-200">
                                <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                                    <span>✨</span> Strengths
                                </h3>
                                <ul className="space-y-3">
                                    {(evaluation.strengths || []).map((s,i) => (
                                        <li key={i} className="text-gray-700 text-sm flex gap-3">
                                            <span className="text-green-600 shrink-0 font-bold">✓</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white rounded-3xl p-8 shadow-lg border border-amber-200">
                                <h3 className="text-xl font-bold text-amber-700 mb-4 flex items-center gap-2">
                                    <span>🎯</span> Areas to Improve
                                </h3>
                                <ul className="space-y-3">
                                    {(evaluation.improvements || []).map((s,i) => (
                                        <li key={i} className="text-gray-700 text-sm flex gap-3">
                                            <span className="text-amber-600 shrink-0 font-bold">→</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        {/* Per-Question */}
                        {evaluation.perQuestion && evaluation.perQuestion.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                    <span className="text-2xl">📋</span> Question-by-Question Review
                                </h2>
                                <div className="space-y-2">
                                    {evaluation.perQuestion.map((q, i) => (
                                        <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                                            <button onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                                                className="w-full flex justify-between items-center py-4 px-5 hover:bg-gray-50 transition-colors text-left">
                                                <span className="text-gray-700 text-sm flex-1 pr-4 font-medium">
                                                    <span className="text-blue-600 font-bold">Q{i+1}</span>: {q.question?.substring(0, 80)}{q.question?.length > 80 ? '...' : ''}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-bold px-3 py-1 rounded-lg ${q.score >= 7 ? 'bg-green-100 text-green-700' : q.score >= 4 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                        {q.score}/10
                                                    </span>
                                                    {expandedQ === i ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                                                </div>
                                            </button>
                                            <AnimatePresence>
                                                {expandedQ === i && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden border-t border-gray-200 bg-gray-50 px-5 py-4">
                                                        <p className="text-gray-700 text-sm leading-relaxed">{q.feedback}</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Actions */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                            className="flex gap-4 justify-center">
                            <button onClick={resetInterview} className="gradient-btn text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-lg glow-btn transition-all">
                                🚀 Try Another Interview
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </Layout>
    );
};

export default AIMockInterview;

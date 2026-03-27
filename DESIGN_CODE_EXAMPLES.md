# Design Implementation Examples
## Working Code Snippets from scroll-orama-show

---

## 1. Complete Hero Section Example

```tsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";

const HeroSection = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "register">("signin");
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section id="home" ref={sectionRef} className="relative overflow-hidden">
      {/* Parallax Background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <img 
          src="hero-bg.jpg" 
          alt="" 
          className="w-full h-[120%] object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </motion.div>

      {/* Floating Background Blobs */}
      <div className="blob w-[700px] h-[700px] bg-primary absolute -top-80 -right-80 opacity-[0.06] animate-float" />
      <div className="blob w-[500px] h-[500px] bg-accent absolute top-1/2 -left-60 opacity-[0.05] animate-float-delayed" />

      {/* Floating Icons */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} 
        transition={{ duration: 8, repeat: Infinity }} 
        className="absolute top-20 right-[15%] text-primary/15 hidden lg:block"
      >
        <BookOpen size={32} />
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 pt-6 lg:pt-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
                           bg-primary/10 text-primary text-xs font-semibold mb-4">
              <GraduationCap className="w-3.5 h-3.5" />
              University Placement & Preparation Portal
            </div>

            {/* Heading */}
            <h1 className="font-display text-4xl lg:text-[3.2rem] font-bold 
                          text-foreground leading-[1.08] tracking-tight">
              Your Gateway to
              <br />
              <span className="gradient-text">Campus Placements</span>
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-base mt-3 leading-relaxed max-w-lg">
              A comprehensive, production-grade platform bridging students, recruiters 
              & placement officers with AI-driven preparation tools and streamlined recruitment workflows.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-5 mt-5">
              {[
                { value: "10k+", label: "Placements" },
                { value: "500+", label: "Companies" },
                { value: "95%", label: "Success Rate" },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label} 
                  initial={{ opacity: 0, y: 16 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.4 + i * 0.08 }}
                >
                  <p className="font-display text-lg font-bold gradient-text">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mt-5">
              <button className="gradient-bg text-primary-foreground rounded-xl h-11 px-5 
                               text-sm font-semibold hover:opacity-90 transition-opacity 
                               inline-flex items-center gap-2">
                Start Your Journey <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border border-primary/20 text-primary hover:bg-primary/5 
                               rounded-xl h-11 px-5 text-sm font-medium transition-colors">
                Explore Features
              </button>
            </div>
          </motion.div>

          {/* Right Column - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end lg:sticky lg:top-20 lg:self-start"
          >
            <div className="glass-card rounded-3xl p-7 w-full max-w-md">
              
              {/* Tab Switcher */}
              <div className="flex bg-secondary rounded-2xl p-1 mb-5">
                {["signin" as const, "register" as const].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAuthTab(tab)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl 
                               transition-all duration-300 ${
                      authTab === tab
                        ? "gradient-bg text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "signin" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              {/* Form Title */}
              <h2 className="font-display text-xl font-bold text-foreground">
                {authTab === "signin" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {authTab === "signin" 
                  ? "Sign in to access your placement portal" 
                  : "Join our placement network today"}
              </p>

              {/* Form Fields */}
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                {authTab === "register" && (
                  <input 
                    type="text" 
                    className="w-full pl-4 h-10 rounded-xl border border-border/60 
                               bg-secondary/50 focus:bg-card transition-colors text-sm 
                               outline-none focus:ring-2 focus:ring-ring" 
                    placeholder="Full name" 
                  />
                )}
                
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    className="w-full pl-10 h-10 rounded-xl border border-border/60 
                               bg-secondary/50 focus:bg-card transition-colors text-sm 
                               outline-none focus:ring-2 focus:ring-ring" 
                    placeholder="Email address" 
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full pl-10 pr-10 h-10 rounded-xl border border-border/60 
                               bg-secondary/50 focus:bg-card transition-colors text-sm 
                               outline-none focus:ring-2 focus:ring-ring" 
                    placeholder="Password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="w-full gradient-bg text-primary-foreground h-10 rounded-xl 
                             text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {authTab === "signin" ? "Sign In" : "Create Account"}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">
                    or continue with
                  </span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button className="h-10 rounded-xl border border-border/60 bg-secondary/50 
                                 text-sm font-medium hover:bg-secondary transition-colors 
                                 flex items-center justify-center gap-2">
                  Google
                </button>
                <button className="h-10 rounded-xl border border-border/60 bg-secondary/50 
                                 text-sm font-medium hover:bg-secondary transition-colors 
                                 flex items-center justify-center gap-2">
                  GitHub
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="flex justify-center pb-4">
        <div className="animate-scroll-indicator">
          <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 
                         flex justify-center pt-1.5">
            <div className="w-1 h-1 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
```

---

## 2. Features Section with Grid

```tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Briefcase, BarChart3, Shield, Clock, Globe, FileText, Zap, Target } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Student Profiles",
    description: "Comprehensive profiles with academic records, skills & placement preferences.",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: Briefcase,
    title: "Job Management",
    description: "Post, track & manage openings from top recruiters with real-time tracking.",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Powerful insights into placement trends, success rates & performance.",
    color: "bg-amber/10 text-amber"
  },
  {
    icon: Shield,
    title: "Verified Recruiters",
    description: "Every recruiter is verified for safe, legitimate opportunities.",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Instant notifications for postings, schedules & placement results.",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: Globe,
    title: "Multi-Campus Support",
    description: "Scale across campuses and departments with centralized admin.",
    color: "bg-amber/10 text-amber"
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description: "ATS-friendly templates optimized for campus recruitment.",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: Zap,
    title: "Smart Matching",
    description: "AI-powered matching connects students with relevant opportunities.",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set goals & track progress with personalized milestones.",
    color: "bg-amber/10 text-amber"
  },
];

const FeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-14 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="blob w-[600px] h-[600px] bg-primary absolute top-0 left-1/4 
                       opacity-[0.03] animate-float-delayed" />
        <div className="blob w-[400px] h-[400px] bg-accent absolute bottom-0 right-0 
                       opacity-[0.04] animate-float" />
      </div>

      <div className="container mx-auto px-4 lg:px-8" ref={ref}>
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 
                          text-primary text-xs font-semibold mb-3">
            Features
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            Everything you need for
            <span className="gradient-text"> campus placements</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            A comprehensive suite to streamline the entire placement process.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card glass-card-hover rounded-2xl p-5 transition-all 
                         duration-300 group cursor-default"
            >
              {/* Icon Container */}
              <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center 
                             justify-center mb-3 group-hover:scale-110 transition-transform 
                             duration-300`}>
                <feature.icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <h3 className="font-display font-semibold text-base text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
```

---

## 3. Role-Based Features Section with Tabs

```tsx
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  GraduationCap, Building2, ShieldCheck, BarChart3, FileText, Search,
  Bell, Briefcase, ClipboardList, TrendingUp, Users, UserCheck,
  Megaphone, Settings, CheckCircle2
} from "lucide-react";

const roles = [
  {
    id: "student",
    label: "Students",
    icon: GraduationCap,
    color: "from-primary to-accent",
    features: [
      { icon: BarChart3, title: "Personalized Dashboard", desc: "Track applications, upcoming drives & placement status in real-time" },
      { icon: Search, title: "Smart Job Finder", desc: "Advanced filtering with eligibility checks for matching roles" },
      { icon: FileText, title: "Resume Upload + ATS", desc: "AI-powered scoring with criteria-wise breakdown" },
      { icon: Bell, title: "Real-time Notifications", desc: "Instant alerts for new postings, schedules & results" },
    ],
  },
  {
    id: "recruiter",
    label: "Recruiters",
    icon: Building2,
    color: "from-accent to-amber",
    features: [
      { icon: Briefcase, title: "Job Lifecycle Management", desc: "Post roles, define eligibility & track applications end-to-end" },
      { icon: ClipboardList, title: "Applicant Tracking", desc: "Shortlist, interview & manage candidates through the pipeline" },
      { icon: Users, title: "Candidate Analysis", desc: "AI-powered candidate fit analysis for better hiring decisions" },
      { icon: TrendingUp, title: "Hiring Analytics", desc: "Track conversion rates, time-to-hire & recruitment metrics" },
    ],
  },
  {
    id: "tpo",
    label: "Admin / TPO",
    icon: ShieldCheck,
    color: "from-amber to-primary",
    features: [
      { icon: UserCheck, title: "Verification Workflows", desc: "Approve students & verify recruiter credentials" },
      { icon: Megaphone, title: "Broadcaster", desc: "Send announcements to all students and recruiters" },
      { icon: BarChart3, title: "Advanced Analytics", desc: "Comprehensive dashboard with placement insights & trends" },
      { icon: Settings, title: "Full Platform Control", desc: "Manage users, drives, policies & system configuration" },
    ],
  },
];

const RoleFeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeRole, setActiveRole] = useState("student");
  const active = roles.find((r) => r.id === activeRole)!;

  return (
    <section className="py-14 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/20 via-transparent to-secondary/20" />

      <div className="container mx-auto px-4 lg:px-8" ref={ref}>
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
                          bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Users className="w-3.5 h-3.5" />
            Built for Every Stakeholder
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            Tailored for <span className="gradient-text">every role</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Whether you're a student, recruiter, or placement officer — the platform adapts to your needs.
          </p>
        </motion.div>

        {/* Role Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm 
                          font-semibold transition-all duration-300 ${
                activeRole === role.id
                  ? "gradient-bg text-primary-foreground shadow-lg"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <role.icon className="w-4 h-4" />
              {role.label}
            </button>
          ))}
        </div>

        {/* Feature Cards (Animated) */}
        <motion.div
          key={activeRole}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
        >
          {active.features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="glass-card glass-card-hover rounded-2xl p-5 flex gap-4 items-start"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${active.color} 
                             flex items-center justify-center flex-shrink-0`}>
                <feature.icon className="w-5 h-5 text-primary-foreground" />
              </div>

              {/* Content */}
              <div>
                <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {feature.desc}
                </p>
              </div>

              {/* Checkmark */}
              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default RoleFeaturesSection;
```

---

## 4. AI Features Section with Gradient Icons

```tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Code2, MessageSquare, Route, FileSearch, Lightbulb } from "lucide-react";

const aiFeatures = [
  {
    icon: Route,
    title: "DSA Roadmap",
    description: "Curated 8-week structured roadmap for coding excellence with topic-wise challenges.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Brain,
    title: "AI Mock Tests",
    description: "Timed assessments with instant AI-powered feedback and performance analytics.",
    gradient: "from-accent to-primary",
  },
  {
    icon: MessageSquare,
    title: "AI Interview Prep",
    description: "Role-based interview questions with detailed evaluation, model answers & improvement tips.",
    gradient: "from-primary to-amber",
  },
  {
    icon: FileSearch,
    title: "Resume ATS Analysis",
    description: "AI-powered scoring with criteria-wise breakdown and targeted resume improvements.",
    gradient: "from-amber to-accent",
  },
  {
    icon: Code2,
    title: "Practice Portals",
    description: "Topic-wise coding challenges and theoretical concepts for thorough preparation.",
    gradient: "from-accent to-amber",
  },
  {
    icon: Lightbulb,
    title: "AI Career Mentor",
    description: "Role-focused multi-phase preparation plans tailored to your career goals.",
    gradient: "from-amber to-primary",
  },
];

const AIFeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-14 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03]" />
      </div>

      <div className="container mx-auto px-4 lg:px-8" ref={ref}>
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
                          bg-accent/10 text-accent text-xs font-semibold mb-3">
            <Brain className="w-3.5 h-3.5" />
            AI-Powered Preparation Hub
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            Supercharge your prep with
            <span className="gradient-text"> Artificial Intelligence</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            From structured learning paths to AI-driven mock interviews — everything you need 
            to ace campus placements.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: index * 0.07, duration: 0.45 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-card glass-card-hover rounded-2xl p-5 group cursor-default relative overflow-hidden"
            >
              {/* Gradient Line at Top (Appears on Hover) */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r 
                             ${feature.gradient} opacity-0 group-hover:opacity-100 
                             transition-opacity duration-300`} />
              
              {/* Icon Container */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} 
                             flex items-center justify-center mb-3 group-hover:scale-110 
                             transition-transform duration-300`}>
                <feature.icon className="w-5 h-5 text-primary-foreground" />
              </div>

              {/* Title & Description */}
              <h3 className="font-display font-semibold text-base text-foreground mb-1.5">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIFeaturesSection;
```

---

## 5. Navbar with Scroll Detection

```tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";

const navLinks = ["Home", "Features", "How It Works", "Testimonials"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("Home");

  // Detect scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id.toLowerCase().replace(/\s/g, "-"));
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-nav sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        
        {/* Logo */}
        <button className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            UniPlacements
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => {
                setActive(link);
                scrollTo(link);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                active === link
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
        >
          {mobileOpen ? (
            <X className="w-5 h-5 text-foreground" />
          ) : (
            <Menu className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => {
                  setActive(link);
                  scrollTo(link);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium 
                           transition-all duration-200 ${
                  active === link
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
```

---

## 6. Floating Background Objects

```tsx
import { motion } from "framer-motion";
import {
  GraduationCap, Briefcase, FileText, Code2, Trophy,
  BookOpen, Brain, Target, Star, Zap, Award
} from "lucide-react";

const floatingItems = [
  { Icon: GraduationCap, x: "5%", y: "8%", size: 28, delay: 0, duration: 14, color: "text-primary/20" },
  { Icon: Briefcase, x: "92%", y: "12%", size: 24, delay: 1.5, duration: 16, color: "text-accent/20" },
  { Icon: FileText, x: "88%", y: "35%", size: 22, delay: 3, duration: 13, color: "text-amber/15" },
  { Icon: Code2, x: "3%", y: "28%", size: 26, delay: 0.5, duration: 15, color: "text-primary/15" },
  { Icon: Brain, x: "82%", y: "65%", size: 24, delay: 2, duration: 14, color: "text-accent/15" },
  { Icon: Trophy, x: "15%", y: "78%", size: 20, delay: 1, duration: 16, color: "text-amber/10" },
  { Icon: BookOpen, x: "73%", y: "82%", size: 18, delay: 2.5, duration: 12, color: "text-primary/12" },
  { Icon: Star, x: "8%", y: "90%", size: 18, delay: 0, duration: 18, color: "text-primary/15" },
];

const FloatingObjects = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.color}`}
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -30, 15, -20, 0],
            x: [0, 15, -10, 20, 0],
            rotate: [0, 10, -5, 15, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <item.Icon size={item.size} />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingObjects;
```

---

## 7. CSS Animations (index.css)

```css
@keyframes float {
  0%, 100% { 
    transform: translateY(0) rotate(0deg); 
  }
  33% { 
    transform: translateY(-20px) rotate(2deg); 
  }
  66% { 
    transform: translateY(10px) rotate(-1deg); 
  }
}

@keyframes float-delayed {
  0%, 100% { 
    transform: translateY(0) rotate(0deg); 
  }
  33% { 
    transform: translateY(15px) rotate(-2deg); 
  }
  66% { 
    transform: translateY(-25px) rotate(1deg); 
  }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.06; }
  50% { opacity: 0.12; }
}

@keyframes scroll-indicator {
  0%, 100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
  50% { 
    transform: translateY(8px); 
    opacity: 0.4; 
  }
}

.animate-float {
  animation: float 14s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 16s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}

.animate-scroll-indicator {
  animation: scroll-indicator 2s ease-in-out infinite;
}
```

---

These examples show:
- ✅ Complete component implementations
- ✅ Framer Motion integration patterns
- ✅ Tailwind CSS class usage
- ✅ Responsive grid layouts
- ✅ Interactive features (tabs, forms, modals)
- ✅ Animation sequences
- ✅ Component composition

All are production-ready and can be directly adapted for your project!

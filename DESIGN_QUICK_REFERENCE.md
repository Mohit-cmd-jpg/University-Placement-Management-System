# Design Quick Reference Guide
## scroll-orama-show / scrollorama-polish Design System

---

## 🎨 COLOR PALETTE COPY-PASTE

### CSS Variables (Light Mode)
```css
:root {
  /* Brand Colors */
  --primary: 239 84% 67%;              /* Bright Blue #6B9BFF */
  --primary-foreground: 0 0% 100%;     /* White */
  
  --accent: 174 60% 40%;               /* Teal/Cyan #1FA89F */
  --accent-foreground: 0 0% 100%;      /* White */
  
  --amber: 38 92% 50%;                 /* Orange/Amber #FFC107 */
  --amber-foreground: 0 0% 100%;       /* White */
  
  /* Backgrounds */
  --background: 225 25% 97%;           /* Very Light Blue #F6F7FB */
  --card: 0 0% 100%;                   /* Pure White */
  --popover: 0 0% 100%;                /* Pure White */
  --secondary: 225 20% 93%;            /* Light Gray-Blue #EEF1F8 */
  --muted: 225 15% 92%;                /* Soft Gray-Blue #EAF0F5 */
  
  /* Text */
  --foreground: 230 25% 10%;           /* Dark Blue-Gray #1B2839 */
  --secondary-foreground: 230 25% 10%; /* Dark Blue-Gray */
  --muted-foreground: 225 10% 45%;     /* Medium Gray-Blue #647195 */
  
  /* UI Elements */
  --border: 225 15% 88%;               /* Light Border #DDEAFE */
  --input: 225 15% 88%;                /* Input Border #DDEAFE */
  --ring: 239 84% 67%;                 /* Focus Ring (=primary) */
  --destructive: 0 84% 60%;            /* Red Error #FE4B23 */
  --destructive-foreground: 0 0% 100%; /* White */
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, hsl(239 84% 67%), hsl(174 60% 40%));
  --gradient-warm: linear-gradient(135deg, hsl(239 84% 67%), hsl(38 92% 50%));
  
  /* Shadows */
  --shadow-glow: 0 0 60px -15px hsl(239 84% 67% / 0.3);
  --shadow-card: 0 4px 24px -4px hsl(230 25% 10% / 0.08), 0 0 0 1px hsl(225 15% 88% / 0.5);
  --shadow-card-hover: 0 12px 40px -8px hsl(230 25% 10% / 0.15), 0 0 0 1px hsl(239 84% 67% / 0.2);
}
```

### Dark Mode Overrides
```css
:root[class="dark"] {
  --background: 230 25% 10%;           /* Dark Blue-Gray */
  --foreground: 225 25% 97%;           /* Very Light Blue */
  --card: 225 15% 18%;                 /* Dark Card */
  --secondary: 225 20% 20%;            /* Dark Secondary */
  --border: 230 20% 18%;               /* Dark Border */
  
  /* Keep accent colors same */
  --primary: 239 84% 67%;
  --accent: 174 60% 40%;
}
```

### Hex Equivalents (Approximate)
```
Primary:      #6B9BFF (Blue)
Primary BG:   #FFFFFF (White)
Accent:       #1FA89F (Teal/Cyan)
Amber:        #FFC107 (Orange)
Background:   #F6F7FB (Very light)
Foreground:   #1B2839 (Dark)
Secondary:    #EEF1F8 (Light gray)
Muted:        #EAF0F5 (Softer gray)
Border:       #DDEAFE (Light border)
```

---

## 🔤 TYPOGRAPHY SYSTEM

### Font Imports
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet">
```

### CSS Classes
```css
.font-display  { font-family: 'Space Grotesk', sans-serif; }
.font-body     { font-family: 'DM Sans', sans-serif; }
```

### Heading Sizes
```html
<!-- H1: Hero Title -->
<h1 class="font-display text-4xl lg:text-[3.2rem] font-bold leading-[1.08] tracking-tight">
  Your Gateway to Campus Placements
</h1>

<!-- H2: Section Header -->
<h2 class="font-display text-3xl lg:text-4xl font-bold text-foreground">
  Everything you need for<span class="gradient-text"> campus placements</span>
</h2>

<!-- H3: Card Title -->
<h3 class="font-display font-semibold text-base text-foreground mb-1.5">
  Card Title Here
</h3>

<!-- H4: Smaller heading -->
<h4 class="font-display font-semibold text-sm text-foreground">Category</h4>
```

### Body Text
```html
<!-- Main paragraph -->
<p class="text-base text-muted-foreground">
  Supporting description text that explains the feature or benefit.
</p>

<!-- Small text (labels, captions) -->
<span class="text-sm text-muted-foreground">Secondary text</span>

<!-- Smallest (timestamps, hints) -->
<span class="text-xs text-muted-foreground">Hint text</span>
```

---

## ⚙️ TAILWIND UTILITY PATTERNS

### Spacing Multiplier
```
Base unit: 4px (0.25rem)
├── p-1   = 4px
├── p-2   = 8px
├── p-3   = 12px
├── p-4   = 16px
├── p-5   = 20px
├── p-6   = 24px
├── p-8   = 32px
└── p-14  = 56px (common section padding)
```

### Border Radius
```css
rounded-full   /* 9999px - circles */
rounded-2xl    /* 1rem - cards */
rounded-xl     /* 0.75rem - buttons, icons */
rounded-lg     /* 0.5rem - smaller elements */
```

### Common Patterns

#### Glass Card
```html
<div class="glass-card rounded-2xl p-5 group cursor-default relative overflow-hidden">
  <!-- Icon -->
  <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent 
              flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
    <Icon className="w-5 h-5 text-primary-foreground" />
  </div>
  
  <!-- Title -->
  <h3 class="font-display font-semibold text-base text-foreground mb-1.5">
    Title
  </h3>
  
  <!-- Description -->
  <p class="text-muted-foreground text-sm leading-relaxed">
    Description text
  </p>
</div>
```

#### Feature Badge
```html
<span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
             bg-primary/10 text-primary text-xs font-semibold mb-3">
  <Icon className="w-3.5 h-3.5" />
  Label Text
</span>
```

#### Button Styles
```html
<!-- Primary CTA -->
<button class="gradient-bg text-primary-foreground rounded-xl h-11 px-5 text-sm 
               font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
  Start Your Journey <ArrowRight class="w-4 h-4" />
</button>

<!-- Secondary Button -->
<button class="border border-primary/20 text-primary hover:bg-primary/5 
               rounded-xl h-11 px-5 text-sm font-medium transition-colors">
  Explore Features
</button>

<!-- Tab Button (Active) -->
<button class="gradient-bg text-primary-foreground shadow-md rounded-xl py-2 px-4 
               text-sm font-semibold transition-all duration-300">
  Active Tab
</button>

<!-- Tab Button (Inactive) -->
<button class="text-muted-foreground hover:text-foreground rounded-xl py-2 px-4 
               text-sm font-semibold transition-all duration-300">
  Inactive Tab
</button>
```

#### Grid Sections
```html
<!-- 3-column grid (responsive) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>

<!-- 2-column grid -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
  <!-- Content -->
</div>

<!-- Container -->
<div class="container mx-auto px-4 lg:px-8">
  <!-- Content -->
</div>
```

---

## ✨ ANIMATION PATTERNS

### Scroll-Reveal Section
```tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Section = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-14 relative">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Content */}
      </motion.div>
    </section>
  );
};
```

### Staggered Grid Animation
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card rounded-2xl p-5"
    >
      {/* Card content */}
    </motion.div>
  ))}
</div>
```

### Floating Object (Continuous)
```tsx
<motion.div
  animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
  transition={{ duration: 6, repeat: Infinity }}
  className="absolute"
>
  <Icon size={32} />
</motion.div>
```

### Parallax Scroll Effect
```tsx
import { useScroll, useTransform } from "framer-motion";

const HeroSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={sectionRef} className="relative">
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        {/* Background content */}
      </motion.div>
    </section>
  );
};
```

---

## 📦 COMMON COMPONENT CODE SNIPPETS

### Hero Section Header
```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="text-center max-w-2xl mx-auto mb-10"
>
  <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary 
                   text-xs font-semibold mb-3">
    Section Badge
  </span>
  <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
    Main Title with
    <span className="gradient-text"> Gradient Accent</span>
  </h2>
  <p className="text-muted-foreground mt-3 text-base">
    Supporting description text
  </p>
</motion.div>
```

### Role Tabs
```tsx
const [activeRole, setActiveRole] = useState("student");

<div className="flex justify-center gap-2">
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
```

### Feature Grid
```tsx
const features = [
  { 
    icon: Users, 
    title: "Student Profiles", 
    description: "Comprehensive profiles...",
    color: "bg-primary/10 text-primary" 
  },
  // ... more features
];

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {features.map((feature, index) => (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card glass-card-hover rounded-2xl p-5"
    >
      <div className={`w-10 h-10 rounded-xl ${feature.color} 
                      flex items-center justify-center mb-3 group-hover:scale-110 
                      transition-transform`}>
        <feature.icon className="w-5 h-5" />
      </div>
      <h3 className="font-display font-semibold text-base text-foreground mb-1">
        {feature.title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  ))}
</div>
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Setup
- [ ] Install Tailwind CSS & PostCSS
- [ ] Install Framer Motion
- [ ] Install Radix UI primitives
- [ ] Install Lucide React icons
- [ ] Import Google Fonts (Space Grotesk, DM Sans)
- [ ] Copy CSS variables to index.css
- [ ] Create utility classes (.glass-card, .gradient-bg, etc.)

### Components to Create
- [ ] Navbar (sticky, glass effect)
- [ ] Hero Section (with auth form)
- [ ] Features Section (grid)
- [ ] AI Features Section
- [ ] Role/Role Tabs Section
- [ ] How It Works (steps)
- [ ] Footer
- [ ] Floating Objects (background)

### Design Customization
- [ ] Update primary color if needed
- [ ] Customize feature cards data
- [ ] Update role/features
- [ ] Modify CTA text and links
- [ ] Adjust hero background images
- [ ] Update footer links

### Testing
- [ ] Test responsive breakpoints (320px, 768px, 1024px)
- [ ] Verify animations on scroll
- [ ] Check dark mode (if implementing)
- [ ] Test form interactions
- [ ] Performance audit (animations)

---

## 📱 RESPONSIVE BREAKPOINTS QUICK GUIDE

```
sm: 640px   (tablets portrait)
md: 768px   (tablets landscape)  ⚠️ Most important breakpoint
lg: 1024px  (desktops)
xl: 1280px  (large screens)
2xl: 1400px (extra large)
```

### Grid Collapse Pattern
```
grid-cols-1           /* Mobile (base) */
md:grid-cols-2        /* Tablet - 2 columns */
lg:grid-cols-3        /* Desktop - 3 columns */
```

---

**Quick Links**:
- Color Palette: Copy CSS Variables section
- Typography: Use .font-display and .font-body classes
- Icons: Import from lucide-react
- Animations: Use framer-motion with patterns provided

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mail, Phone, MapPin, Linkedin, Github,
  Code2, Database, Globe, Trophy, Briefcase, GraduationCap,
  Menu, X, ArrowUpRight, Layers, Cpu, Monitor,
  Send, CheckCircle, AlertCircle, User, MessageSquare, Sparkles,
  ChevronDown,
} from 'lucide-react';

/* ─── Custom cursor ─────────────────────────────────────────────── */
function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top  = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', move);

    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top  = `${ring.current.y}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

/* ─── Particle canvas ───────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.08,
    }));

    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${p.alpha})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56,189,248,${0.06 * (1 - d / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ─── Typewriter ────────────────────────────────────────────────── */
function useTypewriter(words: string[], speed = 75, pause = 2200) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx % words.length];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) setTimeout(() => setDeleting(true), pause);
        else setCharIdx(c => c + 1);
      } else {
        setDisplay(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setWordIdx(w => w + 1); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);
  return display;
}

/* ─── Scroll-reveal hook ────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Tilt card ─────────────────────────────────────────────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * 10;
    const y = ((e.clientY - top)  / height - 0.5) * -10;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(6px)`;
  }, []);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
  }, []);
  return (
    <div ref={ref} className={`tilt-card ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

/* ─── Counter number animation ──────────────────────────────────── */
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const { ref, visible } = useReveal();
  const num = parseFloat(value);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!visible || isNaN(num)) return;
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCurrent(parseFloat((ease * num).toFixed(2)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, num]);

  const display = isNaN(num) ? value : (num % 1 !== 0 ? current.toFixed(2) : Math.round(current).toString());

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Skill bar ─────────────────────────────────────────────────── */
function SkillBar({ name, level, icon, delay }: { name: string; level: number; icon: React.ReactNode; delay: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className="space-y-2 group">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
          <span className="text-sky-400">{icon}</span>
          {name}
        </div>
        <span className="text-sky-400 font-semibold tabular-nums">{level}%</span>
      </div>
      <div className="skill-bar">
        <div className="skill-bar-fill" style={{ width: visible ? `${level}%` : '0%', transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

/* ─── Section wrapper ───────────────────────────────────────────── */
function Section({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative py-16 md:py-20 px-6 md:px-12 lg:px-24 ${className}`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

/* ─── Section header ────────────────────────────────────────────── */
function SectionHeader({ eyebrow, title, num }: { eyebrow: string; title: string; num?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`mb-12 reveal ${visible ? 'visible' : ''}`}>
      <div className="flex items-center gap-4 mb-4">
        <p className="text-sky-400 text-xs font-semibold tracking-[0.3em] uppercase">{eyebrow}</p>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-white font-display leading-tight">{title}</h2>
      <div className="mt-5 h-px w-16 bg-gradient-to-r from-sky-400 to-transparent" />
    </div>
  );
}

/* ─── Reveal wrapper ─────────────────────────────────────────────── */
function Reveal({
  children, className = '', direction = 'up', delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
  delay?: number;
}) {
  const { ref, visible } = useReveal();
  const cls = direction === 'left' ? 'reveal-left' : direction === 'right' ? 'reveal-right' : direction === 'scale' ? 'reveal-scale' : 'reveal';
  return (
    <div ref={ref} className={`${cls} ${visible ? 'visible' : ''} delay-${delay} ${className}`}>
      {children}
    </div>
  );
}

/* ─── Contact form ───────────────────────────────────────────────── */
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', opportunityType: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message');
      }
      setStatus('success');
      setForm({ name: '', email: '', opportunityType: '', company: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center animate-float">
          <CheckCircle size={28} className="text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Message Sent!</h3>
        <p className="text-slate-400 text-sm max-w-xs">Thanks for reaching out. I'll get back to you as soon as possible.</p>
        <button onClick={() => setStatus('idle')} className="mt-1 text-sky-400 text-sm hover:text-sky-300 transition-colors border-b border-sky-400/30 hover:border-sky-300 pb-0.5">
          Send another message
        </button>
      </div>
    );
  }

  const inputCls = 'w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:bg-slate-800/80 transition-all duration-200 hover:border-slate-600';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><User size={11} className="text-sky-400" /> Name *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Jane Smith" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><Mail size={11} className="text-sky-400" /> Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@company.com" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><Briefcase size={11} className="text-sky-400" /> Opportunity *</label>
          <select name="opportunityType" value={form.opportunityType} onChange={handleChange} required className={`${inputCls} appearance-none cursor-pointer`}>
            <option value="" disabled className="bg-slate-900 text-slate-400">Select type...</option>
            {['Full-time Role','Internship','Freelance Project','Collaboration','Other'].map(t => (
              <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><Globe size={11} className="text-sky-400" /> Company</label>
          <input type="text" name="company" value={form.company} onChange={handleChange} placeholder="Acme Corp (optional)" className={inputCls} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><MessageSquare size={11} className="text-sky-400" /> Message *</label>
        <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="Tell me about the opportunity..." className={`${inputCls} resize-none`} />
      </div>
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/8 border border-red-400/20 rounded-xl px-4 py-3">
          <AlertCircle size={15} />{errorMsg}
        </div>
      )}
      <button type="submit" disabled={status === 'loading'}
        className="btn-glow w-full flex items-center justify-center gap-2 bg-sky-500 text-white font-semibold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
        <span className="relative z-10 flex items-center gap-2">
          {status === 'loading'
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
            : <><Send size={15} />Send Message</>}
        </span>
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════ */
const NAV_LINKS = ['About', 'Experience', 'Projects', 'Skills', 'Achievements', 'Contact'];

const SKILLS = [
  { name: 'MERN Stack',          level: 88, icon: <Layers size={15} /> },
  { name: 'REST API Integration',level: 85, icon: <Globe size={15} /> },
  { name: 'MongoDB',             level: 82, icon: <Database size={15} /> },
  { name: 'React.js',            level: 85, icon: <Code2 size={15} /> },
  { name: 'Python & OpenCV',     level: 72, icon: <Cpu size={15} /> },
  { name: 'MS Excel & Office',   level: 80, icon: <Monitor size={15} /> },
  { name: 'Web Research',        level: 88, icon: <Globe size={15} /> },
  { name: 'Node.js / Express.js',level: 80, icon: <Code2 size={15} /> },
];

const INTERNSHIPS = [
  {
    role: 'Full Stack Intern',
    company: 'ALO Info Tech',
    period: 'Feb 2025 – May 2025',
    type: 'On-site',
    summary: 'Built production MERN modules, REST APIs, auth flows, and responsive UI components.',
    tags: ['MERN Stack', 'REST API', 'MongoDB', 'React', 'Node.js'],
    accentFrom: 'from-sky-500', accentTo: 'to-cyan-500',
    barGrad: 'from-sky-500 to-cyan-400',
  },
  {
    role: 'Computer Vision Intern',
    company: 'Wenoxo Technologies Pvt. Ltd.',
    period: 'May 2024 – Jun 2024',
    type: 'On-site',
    summary: 'Built image preprocessing and detection pipelines with Python & OpenCV; produced structured analysis reports.',
    tags: ['Python', 'OpenCV', 'Computer Vision', 'Data Analysis'],
    accentFrom: 'from-blue-500', accentTo: 'to-sky-400',
    barGrad: 'from-blue-500 to-sky-400',
  },
];

const PROJECTS = [
  {
    title: 'JR Corporate Solutions', subtitle: 'Corporate Registration Platform',
    url: 'jrcorpregister.in', year: '2026', status: 'live' as const,
    description: 'Live platform for corporate registrations with real user data, form workflows, and structured DB management.',
    tags: ['MERN', 'REST API', 'MongoDB'],
    gradient: 'from-sky-500/12 to-cyan-500/6', border: 'border-sky-500/20',
    iconBg: 'bg-sky-500/12 border-sky-500/20', iconColor: 'text-sky-400',
    subtitleColor: 'text-sky-400', barColor: 'bg-gradient-to-r from-sky-400 to-cyan-300',
    urlColor: 'text-sky-400', shadow: 'hover:shadow-sky-500/15',
  },
  {
    title: 'TN Business Chambers', subtitle: 'Institutional Web Portal',
    url: 'tnbacouncil.in', year: '2026', status: 'live' as const,
    description: 'Portal for Tamil Nadu Business Advisory Council — built end-to-end from brief to deployment.',
    tags: ['React', 'Node.js', 'Full Stack'],
    gradient: 'from-teal-500/12 to-emerald-500/6', border: 'border-teal-500/20',
    iconBg: 'bg-teal-500/12 border-teal-500/20', iconColor: 'text-teal-400',
    subtitleColor: 'text-teal-400', barColor: 'bg-gradient-to-r from-teal-400 to-emerald-300',
    urlColor: 'text-teal-400', shadow: 'hover:shadow-teal-500/15',
  },
  {
    title: 'Kanyakumari Essential Goods', subtitle: 'Producer Society Website',
    url: 'kegps.com', year: '2026', status: 'live' as const,
    description: 'Data-driven live site with real-time search, dynamic modules, and full ownership from brief to launch.',
    tags: ['Node.js', 'MongoDB', 'Data-Driven'],
    gradient: 'from-blue-500/12 to-sky-500/6', border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/12 border-blue-500/20', iconColor: 'text-blue-400',
    subtitleColor: 'text-blue-400', barColor: 'bg-gradient-to-r from-blue-400 to-sky-300',
    urlColor: 'text-blue-400', shadow: 'hover:shadow-blue-500/15',
  },
  {
    title: 'MoneyGrid', subtitle: 'Personal Finance & Budget Tracker',
    url: null, year: '2025', status: 'completed' as const,
    description: 'Savings planner based on income with category-wise expenditure tracking and smart budget-limit alerts.',
    tags: ['React', 'Finance', 'Charts'],
    gradient: 'from-amber-500/12 to-orange-500/6', border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/12 border-amber-500/20', iconColor: 'text-amber-400',
    subtitleColor: 'text-amber-400', barColor: 'bg-gradient-to-r from-amber-400 to-orange-300',
    urlColor: 'text-amber-400', shadow: 'hover:shadow-amber-500/15',
  },
  {
    title: 'JobGate Consultancy', subtitle: 'Recruitment & Hiring Platform',
    url: null, year: '2025', status: 'ongoing' as const,
    description: 'Two-sided platform connecting companies and job seekers — post roles, apply, screen, and manage the full hiring pipeline.',
    tags: ['MERN', 'Full Stack', 'HR Tech'],
    gradient: 'from-rose-500/12 to-pink-500/6', border: 'border-rose-500/20',
    iconBg: 'bg-rose-500/12 border-rose-500/20', iconColor: 'text-rose-400',
    subtitleColor: 'text-rose-400', barColor: 'bg-gradient-to-r from-rose-400 to-pink-300',
    urlColor: 'text-rose-400', shadow: 'hover:shadow-rose-500/15',
  },
];

const ACHIEVEMENTS = [
  {
    event: 'Kumari Hackathon 2023', year: '2023',
    description: 'Designed an innovative solution for automated classification of non-biodegradable waste materials.',
  },
  {
    event: 'Cosmic Codes Hackathon 2024', year: '2024',
    description: 'Delivered a creative game-development solution under competitive time constraints with rapid prototyping.',
  },
];

/* ═══════════════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const role = useTypewriter(['Full Stack Developer', 'MERN Stack Engineer', 'React Specialist', 'Problem Solver']);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map(n => n.toLowerCase());
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-300 overflow-x-hidden">
      <CustomCursor />

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled ? 'glass-strong shadow-2xl shadow-black/40' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-4 flex items-center justify-between">
          <button onClick={() => scrollTo('about')} className="font-display text-xl font-bold gradient-text tracking-tight hover:scale-105 transition-transform">AJ</button>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button key={link} onClick={() => scrollTo(link)}
                className={`nav-link text-sm font-medium transition-colors ${activeSection === link.toLowerCase() ? 'text-sky-400 active' : 'text-slate-400 hover:text-white'}`}>
                {link}
              </button>
            ))}
          </div>
          <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden glass border-t border-white/5 px-6 py-5 flex flex-col gap-5">
            {NAV_LINKS.map(link => (
              <button key={link} onClick={() => scrollTo(link)} className="text-left text-slate-300 hover:text-sky-400 transition-colors text-sm font-medium">
                {link}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="about" className="relative min-h-screen w-full hero-bg flex items-center overflow-hidden">
        {/* backgrounds */}
        <div className="absolute inset-0 hero-grid pointer-events-none opacity-60" />
        <ParticleCanvas />
        <div className="hero-orb absolute -top-60 -left-60 w-[700px] h-[700px] bg-sky-500/10 animate-glow-pulse pointer-events-none" style={{ animationDelay: '0s' }} />
        <div className="hero-orb absolute -bottom-60 -right-60 w-[600px] h-[600px] bg-cyan-500/7 animate-glow-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        {/* orbit rings — center-anchored */}
        <div className="orbit-ring absolute top-1/2 left-1/2 w-[600px] h-[600px] hidden lg:block" />
        <div className="orbit-ring orbit-ring-2 absolute top-1/2 left-1/2 w-[900px] h-[900px] hidden lg:block" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-28 pb-16">
          <div className="hero-stagger flex flex-col items-start gap-7 max-w-4xl">

            {/* available badge */}
            <div className="relative inline-flex items-center gap-2.5 glass rounded-full px-5 py-2 text-xs font-semibold tracking-wider text-emerald-300 border border-emerald-400/20">
              <div className="badge-ring" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <Sparkles size={10} className="text-emerald-400" />
              Available for Opportunities
            </div>

            {/* role */}
            <p className="text-sky-400 text-sm font-semibold tracking-[0.3em] uppercase cursor-blink min-h-[1.25rem]">{role}</p>

            {/* name — single line, full width */}
            <h1 className="font-display font-bold text-white leading-[0.95] text-[clamp(2.8rem,12vw,7rem)] sm:text-[clamp(3.5rem,10vw,7rem)]">
              <span className="block sm:inline">Anlin </span><span className="shimmer-text block sm:inline">Jerisha</span>
            </h1>

            {/* bio */}
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              Motivated full-stack developer skilled in the MERN stack, data analysis, and computer vision — eager to build, learn, and grow in collaborative teams.
            </p>

            {/* stats row */}
            <div className="flex flex-wrap gap-3">
              {[
                { value: '8.07', label: 'CGPA',        color: 'text-sky-400',     glow: 'shadow-sky-500/15' },
                { value: '3',    label: 'Live Sites',  color: 'text-emerald-400', glow: 'shadow-emerald-500/15', suffix: '+' },
                { value: '2',    label: 'Internships', color: 'text-amber-400',   glow: 'shadow-amber-500/15' },
                { value: '2',    label: 'Hackathons',  color: 'text-rose-400',    glow: 'shadow-rose-500/15' },
              ].map(({ value, label, color, glow, suffix = '' }) => (
                <TiltCard key={label}>
                  <div className={`glass rounded-2xl px-6 py-4 text-center min-w-[88px] shadow-lg ${glow} hover:border-white/15 transition-all duration-300`}>
                    <div className={`text-2xl font-bold font-display ${color}`}>
                      <AnimatedCounter value={value} suffix={suffix} />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
                  </div>
                </TiltCard>
              ))}
            </div>

            {/* meta */}
            <div className="flex flex-wrap gap-5 text-slate-500 text-sm">
              <span className="flex items-center gap-2 hover:text-slate-300 transition-colors cursor-default">
                <MapPin size={13} className="text-sky-400 flex-shrink-0" /> Nagercoil, Tamil Nadu
              </span>
              <a href="mailto:jerishaanlin@gmail.com" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                <Mail size={13} className="text-sky-400 flex-shrink-0" /> jerishaanlin@gmail.com
              </a>
              <a href="tel:7904142931" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                <Phone size={13} className="text-sky-400 flex-shrink-0" /> +91 7904142931
              </a>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => scrollTo('Contact')}
                className="btn-glow flex items-center gap-2 bg-sky-500 text-white px-7 py-3.5 rounded-full text-sm font-semibold">
                <span className="relative z-10 flex items-center gap-2"><Mail size={14} />Get in Touch</span>
              </button>
              <a href="https://github.com/Jerisha-JK" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 glass hover:bg-white/8 text-slate-300 hover:text-white px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105">
                <Github size={14} /> GitHub
              </a>
              <a href="https://www.linkedin.com/in/anlin-jerisha-j-k/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 glass hover:bg-white/8 text-slate-300 hover:text-white px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105">
                <Linkedin size={14} /> LinkedIn
              </a>
            </div>
          </div>

          {/* scroll indicator */}
          <button onClick={() => scrollTo('Experience')}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 hover:text-sky-400 transition-colors group">
            <span className="text-[9px] tracking-[0.4em] uppercase">Scroll</span>
            <ChevronDown size={18} className="animate-bounce" />
          </button>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <Section id="experience">
        <div className="section-num">01</div>
        <SectionHeader eyebrow="Work History" title="Experience" num="01" />

        <div className="relative">
          {/* timeline spine */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-sky-500/50 via-sky-500/20 to-transparent hidden md:block" />

          <div className="space-y-6">
            {INTERNSHIPS.map((intern, i) => (
              <Reveal key={i} delay={i === 0 ? 100 : 300}>
                <div className="group relative md:pl-20">
                  {/* dot */}
                  <div className="absolute left-3.5 top-7 hidden md:block">
                    <div className={`relative w-5 h-5 rounded-full bg-gradient-to-br ${intern.accentFrom} ${intern.accentTo} ring-4 ring-[#05050a] group-hover:scale-125 transition-transform duration-300 timeline-dot`} />
                  </div>

                  <div className="glass rounded-2xl p-7 card-interactive border border-white/5 hover:border-white/12 hover:shadow-xl hover:shadow-sky-500/8">
                    {/* top accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${intern.barGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />

                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-sky-50 transition-colors">{intern.role}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Briefcase size={12} className="text-sky-400" />
                          <span className="text-sky-400 text-sm font-medium">{intern.company}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-600 font-mono">{intern.period}</span>
                        <span className="tag text-xs">{intern.type}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">{intern.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {intern.tags.map(tag => <span key={tag} className="tag text-xs">{tag}</span>)}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ── EDUCATION ── */}
      <Section id="education">
        <div className="section-num">02</div>
        <SectionHeader eyebrow="Academic Background" title="Education" num="02" />

        <Reveal direction="scale">
          <TiltCard>
            <div className="relative glass-strong rounded-3xl p-10 border border-emerald-500/15 bg-gradient-to-br from-emerald-500/6 to-teal-500/3 overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10 transition-shadow duration-300">
              {/* background glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-500/6 blur-3xl pointer-events-none" />

              <div className="relative flex flex-wrap items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={26} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 text-xs font-semibold tracking-[0.3em] uppercase mb-2">Bachelor of Technology</p>
                    <h3 className="text-2xl font-bold text-white font-display">Information Technology</h3>
                    <p className="text-slate-400 text-sm mt-2">University College of Engineering, Nagercoil</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-slate-600 font-mono mb-2 tracking-wider">2021 – 2025</div>
                  <div className="font-display text-5xl font-bold gradient-text leading-none">8.07</div>
                  <div className="text-xs text-slate-500 mt-1.5 tracking-widest uppercase">CGPA</div>
                </div>
              </div>
            </div>
          </TiltCard>
        </Reveal>
      </Section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ── PROJECTS ── */}
      <Section id="projects">
        <div className="section-num">03</div>
        <SectionHeader eyebrow="Portfolio" title="Projects" num="03" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map((proj, i) => {
            const statusBadge =
              proj.status === 'live'
                ? <span className="tag text-xs bg-emerald-400/10 border-emerald-400/20 text-emerald-400">Live</span>
                : proj.status === 'completed'
                ? <span className="tag text-xs bg-sky-400/10 border-sky-400/20 text-sky-400">Completed</span>
                : <span className="tag text-xs bg-amber-400/10 border-amber-400/20 text-amber-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />In Progress</span>;

            const delay = [0, 100, 200, 0, 100][i] as 0 | 100 | 200;

            const inner = (
              <>
                <div className={`absolute top-0 left-0 right-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ${proj.barColor}`} />
                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-10 h-10 rounded-xl ${proj.iconBg} border flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <Globe size={17} className={proj.iconColor} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="tag text-xs">{proj.year}</span>
                      {statusBadge}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-sky-50 transition-colors">{proj.title}</h3>
                  <p className={`${proj.subtitleColor} text-xs font-semibold tracking-widest uppercase mb-3`}>{proj.subtitle}</p>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-5">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {proj.tags.map(t => <span key={t} className="tag text-xs">{t}</span>)}
                  </div>
                  <div className={`flex items-center justify-between ${proj.urlColor} text-xs font-medium border-t border-white/5 pt-4 mt-auto`}>
                    <span className="truncate mr-2 font-mono">{proj.url ?? 'Coming soon'}</span>
                    {proj.url && <ArrowUpRight size={13} className="flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />}
                  </div>
                </div>
              </>
            );

            const cardCls = `group relative glass rounded-2xl overflow-hidden border ${proj.border} bg-gradient-to-br ${proj.gradient} flex flex-col hover:shadow-2xl ${proj.shadow} card-interactive`;

            return (
              <Reveal key={i} delay={delay} direction="up">
                {proj.url
                  ? <a href={`https://${proj.url}`} target="_blank" rel="noopener noreferrer" className={cardCls}>{inner}</a>
                  : <div className={cardCls}>{inner}</div>
                }
              </Reveal>
            );
          })}
        </div>
      </Section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ── SKILLS ── */}
      <Section id="skills">
        <div className="section-num">04</div>
        <SectionHeader eyebrow="Expertise" title="Technical Skills" num="04" />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* bars */}
          <div className="grid gap-5">
            {SKILLS.map((skill, i) => (
              <SkillBar key={skill.name} {...skill} delay={i * 80} />
            ))}
          </div>

          {/* capability cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Web Development',    icon: <Globe size={24} />,    desc: 'React, Node, Express' },
              { label: 'Database Design',    icon: <Database size={24} />, desc: 'MongoDB, REST APIs' },
              { label: 'Computer Vision',    icon: <Cpu size={24} />,      desc: 'Python, OpenCV' },
              { label: 'Team Collaboration', icon: <Layers size={24} />,   desc: 'Agile, Git' },
            ].map(({ label, icon, desc }, i) => (
              <Reveal key={label} delay={i * 100 as 0 | 100 | 200} direction="scale">
                <TiltCard>
                  <div className="glass rounded-2xl p-6 hover:border-white/15 hover:shadow-lg hover:shadow-sky-500/8 transition-all duration-300 border border-white/5 h-full">
                    <div className="text-sky-400 mb-3">{icon}</div>
                    <p className="text-slate-200 text-sm font-semibold mb-1">{label}</p>
                    <p className="text-slate-600 text-xs">{desc}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ── ACHIEVEMENTS ── */}
      <Section id="achievements">
        <div className="section-num">05</div>
        <SectionHeader eyebrow="Recognition" title="Achievements" num="05" />

        <div className="grid md:grid-cols-2 gap-6">
          {ACHIEVEMENTS.map((ach, i) => (
            <Reveal key={i} direction={i === 0 ? 'left' : 'right'} delay={i * 100 as 0 | 100}>
              <TiltCard className="h-full">
                <div className="group relative glass rounded-2xl p-8 border border-white/5 hover:border-amber-400/20 card-interactive hover:shadow-xl hover:shadow-amber-500/8 h-full overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-amber-500/4 blur-3xl pointer-events-none group-hover:bg-amber-500/8 transition-colors duration-500" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/12 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300">
                        <Trophy size={20} />
                      </div>
                      <span className="tag text-xs bg-amber-400/10 border-amber-400/20 text-amber-400">Hackathon</span>
                      <span className="ml-auto text-slate-600 text-xs font-mono">{ach.year}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-amber-50 transition-colors">{ach.event}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{ach.description}</p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ── CONTACT ── */}
      <Section id="contact">
        <div className="section-num">06</div>
        <SectionHeader eyebrow="Let's Connect" title="Get In Touch" num="06" />

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* info */}
          <Reveal direction="left" className="lg:col-span-2">
            <div className="space-y-7">
              <p className="text-slate-400 leading-relaxed text-base">
                I'm eager to contribute, learn from experienced professionals, and grow in a collaborative environment. Reach out for opportunities, collaborations, or just to say hello.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Mail size={17} />,    label: 'Email',    value: 'jerishaanlin@gmail.com', href: 'mailto:jerishaanlin@gmail.com' },
                  { icon: <Phone size={17} />,   label: 'Phone',    value: '+91 7904142931',          href: 'tel:7904142931' },
                  { icon: <MapPin size={17} />,  label: 'Location', value: 'Nagercoil, Tamil Nadu',   href: '#' },
                ].map(({ icon, label, value, href }) => (
                  <a key={label} href={href} className="flex items-center gap-4 group">
                    <div className="w-11 h-11 glass rounded-xl flex items-center justify-center text-sky-400 group-hover:bg-sky-500/12 group-hover:border-sky-500/20 transition-all duration-200 flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 font-medium uppercase tracking-wider">{label}</div>
                      <div className="text-sm text-slate-300 group-hover:text-sky-400 transition-colors font-medium mt-0.5">{value}</div>
                    </div>
                  </a>
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <a href="https://www.linkedin.com/in/anlin-jerisha-j-k/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 glass hover:bg-white/8 text-slate-300 hover:text-sky-400 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 duration-200">
                  <Linkedin size={14} /> LinkedIn
                </a>
                <a href="https://github.com/Jerisha-JK" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 glass hover:bg-white/8 text-slate-300 hover:text-sky-400 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 duration-200">
                  <Github size={14} /> GitHub
                </a>
              </div>
            </div>
          </Reveal>

          {/* form */}
          <Reveal direction="right" className="lg:col-span-3">
            <div className="glass-strong rounded-2xl p-8 border border-white/8">
              <h3 className="text-lg font-bold text-white mb-6 font-display">Send a Message</h3>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="font-display text-lg font-bold gradient-text">AJ</span>
          <p className="text-slate-700 text-sm">&copy; {new Date().getFullYear()} Anlin Jerisha J K — Nagercoil</p>
          <div className="flex items-center gap-1 text-slate-700 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available for hire
          </div>
        </div>
      </footer>
    </div>
  );
}

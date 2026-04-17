import React from "react";
import { 
  Github, 
  Linkedin, 
  ExternalLink, 
  Code, 
  Smartphone, 
  Database, 
  Layers,
  ArrowRight
} from "lucide-react";
import Image from "next/image";

const projects = [
  {
    title: "Indi Cabs Partner",
    subtitle: "Elite Flutter Driver Ecosystem",
    description: "A professional Flutter application for gig-economy drivers. Features include real-time background location tracking, automated earnings settlement via Cashfree, and Google Maps Navigation integration.",
    tags: ["Flutter", "Firebase", "Google Maps SDK", "Cloud Functions"],
    link: "https://github.com/kratosvijay/indi_cabs_driver_app-main",
    icon: <Smartphone size={18} />,
    type: "Mobile App"
  },
  {
    title: "Indi Cabs Rider",
    subtitle: "High-Performance User Experience",
    description: "A high-conversion ride-hailing application with AI-powered ride matching, live estimated time of arrival (ETA), and secure payment gateways (Cashfree / Razorpay).",
    tags: ["Flutter", "Firebase", "Google Mobile Ads", "Apple Pay"],
    link: "https://github.com/kratosvijay/indi_cabs_user_app",
    icon: <Smartphone size={18} />,
    type: "Mobile App"
  },
  {
    title: "Indi Cabs Admin Panel",
    subtitle: "Full-Stack Control Center",
    description: "Custom-built premium admin dashboard for managing the entire Indi Cabs ecosystem. Features real-time Firestore synchronization, driver KYC verification, and live ride monitoring.",
    tags: ["Next.js", "Firebase", "Tailwind CSS", "Recharts"],
    link: "https://github.com/kratosvijay/indi_cabs_admin",
    icon: <Code size={18} />,
    type: "Full-Stack Web"
  },
  {
    title: "Indi Cabs Marketing Site",
    subtitle: "SEO & Growth Powerhouse",
    description: "Highly optimized, premium landing page designed for driver recruitment and user acquisition with modern animations and high-performance metrics.",
    tags: ["Next.js", "Tailwind CSS", "Framer Motion", "SEO"],
    link: "https://github.com/kratosvijay/indi_cabs_marketing_site",
    icon: <Layers size={18} />,
    type: "Frontend Web"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-8 py-3 glass rounded-full flex items-center gap-8 shadow-sm">
        <a href="#hero" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">Home</a>
        <a href="#projects" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">Projects</a>
        <a href="#skills" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">Skills</a>
        <a href="#contact" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">Contact</a>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Animated Background Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-float opacity-70"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-float [animation-delay:-3s] opacity-70"></div>
        
        <div className="text-center z-10 max-w-4xl">
          <span className="inline-block px-4 py-1.5 mb-6 rounded-full glass text-xs font-bold tracking-widest text-primary uppercase shadow-sm">
            Available for Projects
          </span>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight font-outfit text-slate-900">
            Turning Ideas into <br/>
            <span className="gradient-text">Premium Reality.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
            I'm Dilli Vijay, a **Full Stack Developer** specializing in elite, real-time ecosystems. 
            Currently architecting state-of-the-art solutions at Indi Cabs.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#projects" className="btn-primary flex items-center gap-2 group">
              View Work <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="https://github.com/kratosvijay" target="_blank" className="px-8 py-4 glass text-slate-900 font-bold rounded-2xl flex items-center gap-3 hover:bg-white transition-all shadow-sm">
              <Github size={20} /> GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-32 px-4 max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="section-title">The Ecosystem.</h2>
          <p className="text-xl text-text-muted max-w-2xl leading-relaxed">
            A comprehensive showcase of the Indi Cabs platform, demonstrating high-performance mobile apps, 
            robust full-stack control systems, and conversion-focused web architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <div key={i} className="group relative overflow-hidden rounded-[32px] glass p-8 md:p-10 border-slate-200 hover:border-primary/30 transition-all shadow-md hover:shadow-2xl hover:translate-y-[-8px]">
              <div className="flex flex-col h-full">
                <div className="mb-6 flex items-center justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {project.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/5 px-3 py-1 rounded-full">{project.type}</span>
                </div>
                
                <h3 className="text-3xl font-black mb-2 font-outfit text-slate-900">{project.title}</h3>
                <p className="text-primary font-bold text-xs tracking-wide mb-6 italic">{project.subtitle}</p>
                <p className="text-text-muted text-base mb-8 leading-relaxed flex-grow">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-10">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>

                <a href={project.link} target="_blank" className="inline-flex items-center gap-2 text-primary font-bold group/link mt-auto">
                  Explore Repository <ExternalLink size={16} className="group-hover/link:-translate-y-1 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="section-title text-center mx-auto mb-20">The Tech Stack.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Web Development", icons: <Code className="text-primary" size={32} />, tech: "Next.js, React, Node.js" },
              { name: "App Development", icons: <Smartphone className="text-primary" size={32} />, tech: "Flutter, Dart, iOS/Android" },
              { name: "Backend Architecture", icons: <Database className="text-primary" size={32} />, tech: "Firebase, Cloud Functions, SQL" },
              { name: "Design & UX", icons: <Layers className="text-primary" size={32} />, tech: "Figma, Tailwind, Framer" },
            ].map((skill, i) => (
              <div key={i} className="glass p-10 rounded-[24px] hover:translate-y-[-8px] transition-all flex flex-col items-center group shadow-sm hover:shadow-md bg-white/80">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {skill.icons}
                </div>
                <h4 className="text-xl font-bold mb-2 font-outfit text-slate-900">{skill.name}</h4>
                <p className="text-sm text-text-muted">{skill.tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <footer id="contact" className="py-32 px-4 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-10 font-outfit underline decoration-primary underline-offset-8 text-slate-900">
            Let's Connect.
          </h2>
          <p className="text-xl text-text-muted mb-12">
            Always open to discussing new high-impact projects or technical solutions.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <a href="mailto:dillivijay123@gmail.com" className="btn-primary w-full md:w-auto shadow-xl">
              Send a Message
            </a>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/in/dillivijay-v-209965219/" target="_blank" className="w-14 h-14 glass rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                <Linkedin size={24} />
              </a>
              <a href="https://github.com/kratosvijay" target="_blank" className="w-14 h-14 glass rounded-full flex items-center justify-center hover:bg-slate-200 transition-all shadow-sm">
                <Github size={24} />
              </a>
            </div>
          </div>
          <div className="mt-24 text-sm text-text-muted italic">
            © {new Date().getFullYear()} Dilli Vijay. Built with Next.js & Premium Excellence.
          </div>
        </div>
      </footer >
    </main>
  );
}

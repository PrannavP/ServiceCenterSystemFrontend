import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiMonitor, FiTool, FiBriefcase, FiAperture, FiFileText, FiPieChart, FiSettings, FiCheckCircle, FiPhone, FiMail, FiMapPin, FiArrowRight, FiMenu } from "react-icons/fi";
import "../styles/landing.css";
import { useState } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const aboutRef = useRef(null);
    const contactRef = useRef(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Hero Animation
        const heroElements = heroRef.current.querySelectorAll('.hero-anim');
        gsap.fromTo(heroElements, 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
        );

        // Features Animation
        const featureCards = featuresRef.current.querySelectorAll('.feature-card');
        gsap.fromTo(featureCards,
            { y: 40, opacity: 0 },
            {
                y: 0, 
                opacity: 1, 
                duration: 0.7, 
                stagger: 0.1, 
                ease: "power2.out",
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // About & Contact Animations
        [aboutRef, contactRef].forEach(ref => {
            if(ref.current) {
                gsap.fromTo(ref.current.children,
                    { y: 40, opacity: 0 },
                    {
                        y: 0, opacity: 1, duration: 0.7, stagger: 0.2, ease: "power2.out",
                        scrollTrigger: { trigger: ref.current, start: "top 80%", toggleActions: "play none none reverse" }
                    }
                );
            }
        });
    }, []);

    const handleNavClick = (e, targetId) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="landing-wrapper">
            <nav className="landing-navbar">
                <div className="navbar-container">
                    <div className="navbar-brand">
                        <div className="brand-logo">
                            <FiAperture size={24} />
                        </div>
                        <span>ServiceCenter</span>
                    </div>
                    
                    <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <FiMenu size={24} />
                    </button>

                    <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                        <div className="navbar-links">
                            <a href="#features" onClick={(e) => handleNavClick(e, 'features')}>Features</a>
                            <a href="#about" onClick={(e) => handleNavClick(e, 'about')}>About</a>
                            <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
                        </div>
                        <div className="navbar-actions">
                            <Link to="/login" className="btn-signin">Sign In</Link>
                            <Link to="/login" className="btn-get-started">Get Started</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <section className="hero-section" ref={heroRef}>
                <div className="hero-background"></div>
                <div className="hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title hero-anim">
                            The operating system for modern service centers.
                        </h1>
                        <p className="hero-subtitle hero-anim">
                            Millions of repairs are managed on our platform. Streamline your job cards, automate inventory tracking, and deliver exceptional customer experiences with our enterprise-grade infrastructure.
                        </p>
                        <div className="hero-cta-group hero-anim">
                            <Link to="/login" className="btn-primary-large">
                                Start your free trial <FiArrowRight />
                            </Link>
                            <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="btn-secondary-large">
                                Contact sales
                            </a>
                        </div>
                    </div>
                    
                    <div className="hero-visual hero-anim">
                        <div className="dashboard-mockup">
                            <div className="mockup-header">
                                <div className="mockup-dots"><span></span><span></span><span></span></div>
                            </div>
                            <div className="mockup-body">
                                <div className="mockup-sidebar"></div>
                                <div className="mockup-content">
                                    <div className="mockup-stats">
                                        <div className="m-stat"></div>
                                        <div className="m-stat"></div>
                                        <div className="m-stat"></div>
                                    </div>
                                    <div className="mockup-chart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="features-section" ref={featuresRef}>
                <div className="section-container">
                    <div className="landing-section-header">
                        <h2 className="landing-section-title">A complete toolkit for your workshop</h2>
                        <p className="landing-section-subtitle">We've obsessed over every detail of the repair lifecycle so you don't have to. Experience software designed for speed and reliability.</p>
                    </div>
                    
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="f-icon"><FiBriefcase /></div>
                            <h3>Intelligent Job Cards</h3>
                            <p>Track every vehicle digitally. From intake photos to final QA checklists, maintain a perfect audit trail of every repair.</p>
                        </div>
                        <div className="feature-card">
                            <div className="f-icon"><FiTool /></div>
                            <h3>Real-time Inventory</h3>
                            <p>Prevent stockouts with automated thresholds. Parts are automatically deducted from inventory as soon as they're added to a job.</p>
                        </div>
                        <div className="feature-card">
                            <div className="f-icon"><FiFileText /></div>
                            <h3>One-Click Billing</h3>
                            <p>Convert completed job cards into professional, tax-compliant invoices instantly. Accept payments and track receivables effortlessly.</p>
                        </div>
                        <div className="feature-card">
                            <div className="f-icon"><FiMonitor /></div>
                            <h3>Customer Transparency</h3>
                            <p>Keep customers informed via automated SMS or email updates. Reduce status-check phone calls by up to 60%.</p>
                        </div>
                        <div className="feature-card">
                            <div className="f-icon"><FiPieChart /></div>
                            <h3>Financial Insights</h3>
                            <p>Visualize your revenue, profitability per mechanic, and fastest-moving parts with our beautiful analytics dashboards.</p>
                        </div>
                        <div className="feature-card">
                            <div className="f-icon"><FiSettings /></div>
                            <h3>Enterprise Security</h3>
                            <p>Your data is protected by bank-level encryption, regular audits, and 99.99% guaranteed uptime SLA.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="about" className="about-section" ref={aboutRef}>
                <div className="section-container">
                    <div className="about-grid">
                        <div className="about-content">
                            <div className="badge">Our Story</div>
                            <h2 className="landing-section-title">Engineered for excellence.</h2>
                            <p className="about-desc">
                                We realized that the automotive repair industry was running on legacy software from the 90s, or worse—paper and clipboards. We set out to build a platform that matches the sophistication of the modern vehicles you repair.
                            </p>
                            <p className="about-desc">
                                Today, ServiceCenter is crafted by a team of senior engineers from leading tech companies, combining cutting-edge cloud infrastructure with deep automotive industry expertise.
                            </p>
                            <div className="about-stats">
                                <div className="a-stat">
                                    <h4>99.99%</h4>
                                    <span>Uptime</span>
                                </div>
                                <div className="a-stat">
                                    <h4>10k+</h4>
                                    <span>Workshops</span>
                                </div>
                                <div className="a-stat">
                                    <h4>24/7</h4>
                                    <span>Support</span>
                                </div>
                            </div>
                        </div>
                        <div className="about-visual">
                            <div className="image-wrapper">
                                <img src="https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&q=80&w=800" alt="Professional Mechanics" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="contact" className="contact-section" ref={contactRef}>
                <div className="section-container">
                    <div className="contact-wrapper">
                        <div className="contact-info">
                            <h2 className="landing-section-title">Ready to upgrade?</h2>
                            <p className="landing-section-subtitle">Get in touch with our engineering and sales team to see how we can transform your operations.</p>
                            
                            <div className="c-details">
                                <div className="c-item">
                                    <FiMapPin /> <span>Kathmandu, Nepal</span>
                                </div>
                                <div className="c-item">
                                    <FiPhone /> <span>+977 1-4220000</span>
                                </div>
                                <div className="c-item">
                                    <FiMail /> <span>hello@servicecenter.app</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="contact-form-card">
                            <form className="premium-form" onSubmit={(e) => e.preventDefault()}>
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>First name</label>
                                        <input type="text" placeholder="Jane" />
                                    </div>
                                    <div className="input-group">
                                        <label>Last name</label>
                                        <input type="text" placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Work email</label>
                                    <input type="email" placeholder="jane@company.com" />
                                </div>
                                <div className="input-group">
                                    <label>How can we help?</label>
                                    <textarea rows="4" placeholder="Tell us about your workshop..."></textarea>
                                </div>
                                <button className="btn-submit">Send message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="footer-section">
                <div className="section-container">
                    <div className="footer-grid">
                        <div className="f-brand-col">
                            <div className="footer-logo">
                                <FiAperture /> ServiceCenter
                            </div>
                            <p>The operating system for modern service centers and repair workshops.</p>
                        </div>
                        <div className="f-link-col">
                            <h4>Product</h4>
                            <a href="#">Features</a>
                            <a href="#">Pricing</a>
                            <a href="#">Changelog</a>
                        </div>
                        <div className="f-link-col">
                            <h4>Company</h4>
                            <a href="#">About</a>
                            <a href="#">Blog</a>
                            <a href="#">Careers</a>
                        </div>
                        <div className="f-link-col">
                            <h4>Legal</h4>
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Security</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} ServiceCenter Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

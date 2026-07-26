import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiMonitor, FiTool, FiBriefcase, FiAperture } from "react-icons/fi";
import "../styles/landing.css";

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
    const heroRef = useRef(null);
    const featuresRef = useRef(null);

    useEffect(() => {
        const heroElements = heroRef.current.querySelectorAll('.hero-anim');
        gsap.fromTo(heroElements, 
            { y: 50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out", delay: 0.2 }
        );

        const featureCards = featuresRef.current.querySelectorAll('.feature-card');
        gsap.fromTo(featureCards,
            { y: 60, opacity: 0 },
            {
                y: 0, 
                opacity: 1, 
                duration: 0.6, 
                stagger: 0.2, 
                ease: "power2.out",
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, []);

    return (
        <div className="landing-wrapper">
            <nav className="landing-navbar">
                <div className="navbar-brand">
                    <FiAperture size={24} />
                    ServiceCenter
                </div>
                <div className="navbar-links">
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                </div>
                <div className="navbar-actions">
                    <Link to="/login" className="btn-login">Sign In</Link>
                </div>
            </nav>

            <div className="hero-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>

            <section className="hero-section" ref={heroRef}>
                <div className="hero-content">
                    <div className="hero-badge hero-anim">v2.0 Now Available</div>
                    <h1 className="hero-title hero-anim">
                        Manage Your Service Center with <span>Elegance</span>
                    </h1>
                    <p className="hero-subtitle hero-anim">
                        A powerful, modern platform to track job cards, inventory, billing, and streamline your entire service operation.
                    </p>
                    <Link to="/login" className="hero-cta hero-anim">
                        Get Started
                    </Link>
                </div>
            </section>

            <section id="features" className="features-section" ref={featuresRef}>
                <div className="section-header">
                    <h2 className="section-title">Everything you need</h2>
                    <p className="section-subtitle">Powerful features designed specifically for modern service centers.</p>
                </div>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FiBriefcase size={28} />
                        </div>
                        <h3 className="feature-title">Job Management</h3>
                        <p className="feature-desc">Track every repair job from creation to completion with our intuitive job card system.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FiTool size={28} />
                        </div>
                        <h3 className="feature-title">Inventory Control</h3>
                        <p className="feature-desc">Monitor stock levels, track parts usage per job, and never run out of critical components.</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FiMonitor size={28} />
                        </div>
                        <h3 className="feature-title">Detailed Analytics</h3>
                        <p className="feature-desc">Get comprehensive insights into your service center's performance and revenue.</p>
                    </div>
                </div>
            </section>

            <footer className="footer-section">
                <div className="footer-content">
                    <div className="footer-brand">
                        <FiAperture size={20} />
                        ServiceCenter
                    </div>
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Support</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    &copy; {new Date().getFullYear()} ServiceCenter Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

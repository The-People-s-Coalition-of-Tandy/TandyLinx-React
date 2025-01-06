import React, { useState, useEffect } from 'react';
import './index.css';

function Hero({slimeRef}) {
    const [isHovered, setIsHovered] = useState(false);
    const [currentTagline, setCurrentTagline] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const taglines = [
        "Links like you've never seen before.",
        `"Express yourself through our unique link templates."
        \n- julie bodian`,
        "Not just links, TandyLinx.",
        `"Links are formed karmically on the earth and then continue between death and a new birth. Those who are able to see into the spiritual world perceive how the dead person gradually makes more and more links"
        \n- Rudolf Steiner`,
        "The bold new future of links is here.",
        "Share a link, change the world.",
        `"Nothing is more indispensable to true religiosity than a mediator that links us with divinity." -Novalis`
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentTagline((prev) => (prev + 1) % taglines.length);
                setIsAnimating(false);
            }, 500); // Half of our transition time
        }, 5000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
        slimeRef.current.startTransition({
            secondaryColor: [0.8, 0.2, 0.91],
            noiseFactor: 0.20,
            metalness: 1.0,
            duration: 500,
            neighborThreshold: 0.5
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <section className="hero">
            <div className="hero-text">
                <h1>Tandylinx</h1>
                <h2 className={`tagline ${isAnimating ? 'slide-out' : ''}`}>
                    {taglines[currentTagline]}
                </h2>
                <a 
                    href="/login" 
                    className={`cta-button ${isHovered ? 'hovered' : ''}`}
                    id="signup-button"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    Get Started
                </a>
            </div>
        </section>
    );
}

export default Hero;

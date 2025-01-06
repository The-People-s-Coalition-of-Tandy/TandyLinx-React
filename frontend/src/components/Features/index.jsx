import React, { useEffect, useRef, useState } from 'react';
import './index.css';

function Features() {
    const [isVisible, setIsVisible] = useState(false);
    const featuresRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1
            }
        );

        if (featuresRef.current) {
            observer.observe(featuresRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section 
            ref={featuresRef}
            id="features" 
            className={`features ${isVisible ? 'features-visible' : ''}`}
        >
            <h2>Features</h2>
            <div className="features-grid">
                <div className="feature-card">
                    <h3>Custom Link Pages</h3>
                    <p>Create personalized pages to showcase all your important links</p>
                </div>
                <div className="feature-card">
                    <h3>Unique Templates</h3>
                    <p>Choose from our collection of distinctive, eye-catching designs</p>
                </div>
                <div className="feature-card">
                    <h3>Easy Customization</h3>
                    <p>Personalize your page layout and style to match your brand</p>
                </div>
            </div>
        </section>
    );
}

export default Features;

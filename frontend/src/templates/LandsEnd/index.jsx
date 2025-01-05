import React, { useEffect, useRef } from 'react';
import styles from './index.module.css';
import templateBase from '../shared/template-base.module.css';
import landEndVideo from './assets/shortlandsend.mp4';
import tandyLogoSpiro from './assets/TandyLogo.png';
import elieExplosion from './assets/elieExplosionIcon.gif';
import tandyLinx from '../shared/assets/tandyLinx1.png';

const LandsEnd = ({ pageTitle, links }) => {
  const mainRef = useRef(null);
  
  useEffect(() => {
    const main = mainRef.current;
    
    const update = (e) => {
      const rect = main.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      main.style.setProperty("--cursorX", x + "px");
      main.style.setProperty(
        "--cursorY",
        y + window.scrollY + "px"
      );
    };

    const remove = () => {
      main.style.setProperty("--cursorX", "0px");
      main.style.setProperty("--cursorY", "0px");
    };

    main.addEventListener("mousemove", update);
    main.addEventListener("mouseout", remove);
    main.addEventListener("touchmove", update);

    return () => {
      main.removeEventListener("mousemove", update);
      main.removeEventListener("mouseout", remove);
      main.removeEventListener("touchmove", update);
      // Clean up any remaining custom properties
      main.style.removeProperty("--cursorX");
      main.style.removeProperty("--cursorY");
    };
  }, []);

  return (
    <div className={`${styles.landsEndTemplate} ${templateBase.templateBase}`}>
      <video autoPlay muted loop className={styles.backgroundVideo}>
        <source src={landEndVideo} type="video/mp4" />
      </video>
      
      <main className={styles.main} ref={mainRef}>
        <img 
          src={tandyLogoSpiro}
          alt="People's Coalition of Tandy Logo"
          className={styles.pcotLogo}
        />
        <br />
        
        <header className={styles.header}>
          <p>
            <span className={styles.releaseName}>{pageTitle}</span>
            <br />
          </p>
        </header>

        <div className={styles.links}>
          {links.map((link, index) => (
            <a key={index} href={link.url} className={styles.link}>
              {link.name}
            </a>
          ))}
        </div>

        <footer className={styles.footer}>
          <img src={elieExplosion} alt="Gif of pixel fireworks" className={styles.explosion} />
          <a href="https://www.pcotandy.org">
            <img 
              className={styles.tandyLinx} 
              src={tandyLinx}
              alt="Tandy Linx logo"
            />
          </a>
          <img src={elieExplosion} alt="Gif of pixel fireworks" className={styles.explosion} />
        </footer>
        <div className={styles.cover}></div>
      </main>

      <svg className={`${styles.filtersSvg} ${styles.svg}`}>
        <defs>
          {[1, 2, 3, 4, 5, 6, 8, 9, 10].map((num) => (
            <filter key={num} id={`turbulence-${num}`}>
              <feTurbulence 
                type="fractalNoise" 
                baseFrequency={num <= 6 ? 0.01 * num : 0.1 * (num - 4)} 
                numOctaves="2" 
                data-filterid="3" 
              />
              <feDisplacementMap 
                xChannelSelector="R" 
                yChannelSelector="G" 
                in="SourceGraphic" 
                scale="25" 
              />
            </filter>
          ))}
        </defs>
      </svg>
    </div>
  );
};

export default LandsEnd;
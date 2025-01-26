import React, { useRef } from 'react';
import styles from './index.module.css';
import templateBase from '../shared/template-base.module.css';
import WheatSketch from './components/WheatSketch';
import EmbroideryFrame from './components/EmbroideryFrame';
import elieExplosion from '../shared/assets/elieExplosionIcon.gif';
import tandyLinx from '../shared/assets/tandyLinx1.png';
import albumCover from './assets/cover-min.png';

const Embroidery = ({ pageTitle, links }) => {
  const mainDivRef = useRef(null);

  return (
    <div className={`${styles.embroideryTemplate} ${templateBase.templateBase}`}>
      <div className={styles.wheat}>
        <WheatSketch />
      </div>
      
      <main className={styles.mainContent} ref={mainDivRef}>
        <EmbroideryFrame containerRef={mainDivRef} />
        
        <div className={styles.albumCover}>
          <img 
            src={albumCover}
            alt="Album Cover" 
          />
        </div>

        <header className={styles.header}>
          Welcome to the <br />
          <a href="https://youtu.be/2zfUIc63BZo">{pageTitle}</a><br />
          Tandy Link Tree
        </header>

        <div className={styles.links}>
          {links.map((link, index) => (
            <a key={index} href={link.url} className={styles.link}>
              {link.name}
            </a>
          ))}
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <img 
              className={styles.explosion} 
              src={elieExplosion}
              alt="Gif of pixel fireworks"
            />
            <a href="https://tandylinx.pcotandy.org/" target="_blank" rel="noopener noreferrer">
              <img 
                className={styles.tandyLinx} 
                src={tandyLinx}
                alt="Tandy Linx logo"
              />
            </a>
            <img 
              className={styles.explosion} 
              src={elieExplosion}
              alt="Gif of pixel fireworks"
            />
          </div>
        </footer>
      </main>
      
      <div className={styles.spacer}></div>
    </div>
  );
};

export default Embroidery;
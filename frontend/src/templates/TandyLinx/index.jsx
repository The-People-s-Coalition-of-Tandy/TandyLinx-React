import React from 'react';
import styles from './index.module.css';
import templateBase from '../shared/template-base.module.css';


const Classic = ({ pageTitle, links }) => (
  <div className={`${styles.tandyTemplate} ${templateBase.templateBase}`}>
    <h1 className={styles.title}>{pageTitle}</h1>
    <ul className={styles.linkList}>
      {links.map((link, index) => (
        <li key={index} className={styles.linkItem}>
          <a href={link.url} className={styles.link}>{link.name}</a>
        </li>
      ))}
    </ul>
  </div>
);

export default Classic;
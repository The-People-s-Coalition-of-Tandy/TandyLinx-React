import styles from './index.module.css';
import tandyLogo from './assets/tandycubelogo.png';
import { useEffect } from 'react';
const About = () => {


    useEffect(() => {
        window.dispatchEvent(new CustomEvent('themeChange', {
            detail: { theme: 'dorficWhite', duration: 800, easingFunction: "linear" }
        }));    
    }, []);

    return (
        <>
        <a href="/"><img src={tandyLogo} alt="TandyLinx Logo" className={styles.tandyLogo} /></a>
            <div className={styles.aboutContainer}>

            <h1>✮𖦹 About TandyLinx 𖦹✮</h1>
            <p><b>What is TandyLinx?</b></p>
            <p>
                TandyLinx is a tool for making "Link-in-bio" pages. 
                In 2021 TandyLinx was created by <a href="https://github.com/SunEinynEeenan">the Prolan Kurfwen</a> and <a href="https://julipode.net/">julipode</a> as a foil to the growing popularity of link-in-bio services, featuring hand coded pages to share links for the <a href="https://pcotandy.org">People's Coalition of Tandy</a>. Along the way we developed a fun visual style, while other link services grew monotonous. Now we've come full circle, and TandyLinx will generate fun link pages for you!
            </p>
            
            <p><b>Does TandyLinx cost money?</b></p>
            <p>
                No, TandyLinx is free to use. 
            </p>
            
            <p><b>Will TandyLinx ever cost money?</b></p>
            <p>
                Possibly! In the future we may offer premium features, templates, or statistics for link clicks. The TandyLinx tool is just <a href="https://julipode.net">me</a> right now, and it would be amazing to be able to be financially supported by this in any way. For now I felt the best way to get started was to first see if anyone was interested in this at all, and then go from there!<br/>
                I'd also like to be able to collaborate with other artists to make cool templates and be able to compensate them for their work.
            </p>

            <p><b>I found a bug or want to suggest a feature!</b></p>
            <p>
                You can find my contact info on my <a href="https://julipode.net">website</a>. Feedback is always welcome!
            </p>
        </div>
        </>
    );
};

export default About;
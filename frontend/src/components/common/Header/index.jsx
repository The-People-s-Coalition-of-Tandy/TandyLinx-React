import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';


function Header() {
    return (
        <header>
            <nav className="nav">
                <div className="logo">
                    <Link to="/">
                        <img src="/assets/images/TandyLogoSpiro.png" alt="Tandylinx" />
                    </Link>
                </div>
                <button className="menu-button" aria-label="Toggle menu">☰</button>
                <ul className="nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#templates">Templates</a></li>
                    <li><a href="https://pcotandy.org">Contact</a></li>
                    <li><Link to="/edit-links">Edit Links</Link></li>
                </ul>
                <div className="login">
                    <a href="/login" className="signup-button">Sign up</a>
                </div>
            </nav>
        </header>
    );
}

export default Header;

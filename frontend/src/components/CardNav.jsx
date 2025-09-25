import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { GoArrowUpRight } from 'react-icons/go';
import './CardNav.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CardNav = () => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);
  const { user, logout } = useAuth();

  const items = [
    {
      label: "Menu",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "About Us", href: "/about", ariaLabel: "About Us" },
        { label: "Contact", href: "/contact", ariaLabel: "Contact" }
      ]
    }
  ];

  const calculateHeight = () => (window.matchMedia('(max-width: 768px)').matches ? 200 : 260);

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease: 'power3.out' });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.08 }, '-=0.1');
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => { tl?.kill(); tlRef.current = null; };
  }, []);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (isProfileOpen) setProfileOpen(false); // Close profile menu if open
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const toggleProfile = () => {
    if (isExpanded) toggleMenu(); // Close main menu if open
    setProfileOpen(!isProfileOpen);
  };
  
  return (
    <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''} mx-4 lg:mx-6 mt-6`} style={{ backgroundColor: '#fff' }}>
      <div className="card-nav-top">
        <div
          className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          role="button"
          aria-label={isExpanded ? 'Close menu' : 'Open menu'}
        >
          <div className="hamburger-line" />
          <div className="hamburger-line" />
        </div>

        <div className="logo-container">
          <span className="logo-text">HealthSync</span>
        </div>

        {/* Profile Dropdown */}
        <div className="profile-container">
          <button
            type="button"
            className="card-nav-cta-button"
            onClick={toggleProfile}
          >
            {user?.name.split(' ')[0] || 'Profile'}
          </button>
          {isProfileOpen && (
            <div className="profile-menu">
              <div className="profile-menu-header">
                Signed in as <br />
                <strong>{user?.name}</strong>
              </div>
              <button onClick={logout} className="profile-menu-item logout-button">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-nav-content" aria-hidden={!isExpanded}>
        {items.map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="nav-card"
            ref={(el) => (cardsRef.current[idx] = el)}
            style={{ backgroundColor: item.bgColor, color: item.textColor }}
          >
            <div className="nav-card-links">
              {item.links?.map((lnk) => (
                <Link key={lnk.label} className="nav-card-link" to={lnk.href} aria-label={lnk.ariaLabel}>
                  <GoArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                  {lnk.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default CardNav;
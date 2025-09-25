import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ProfileButton.css';
import { GoArrowRight } from 'react-icons/go';


export default function ProfileButton() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  if (!user) return null;

  const getInitials = (name = '') => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
    }
    return names[0].charAt(0);
  };

  return (
    <div className="profile-container" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="profile-avatar-button">
        {user.photoUrl ? (
          <img src={user.photoUrl} alt="Profile" className="profile-image" />
        ) : (
          <div className="profile-initials">
            <span>{getInitials(user.name)}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <p className="profile-menu-name">{user.name}</p>
            <p className="profile-menu-email">{user.email}</p>
          </div>
          <button onClick={logout} className="profile-menu-item logout-button">
            <span>Logout</span>
            <GoArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}
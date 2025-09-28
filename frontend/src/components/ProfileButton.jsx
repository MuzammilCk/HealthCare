import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './ui';
import './ProfileButton.css';
import { GoArrowRight } from 'react-icons/go';
import { FiUser } from 'react-icons/fi';


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

  return (
    <div className="profile-container" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="profile-avatar-button">
        <Avatar 
          src={user.photoUrl} 
          name={user.name} 
          size="md"
          className="w-full h-full"
        />
      </button>

      {isOpen && (
        <div className="profile-menu">
          {/* --- MODIFIED HEADER --- */}
          <div className="profile-menu-header">
            {/* Part 1: Avatar */}
            <div className="flex-shrink-0">
              <Avatar 
                src={user.photoUrl} 
                name={user.name} 
                size="xl"
              />
            </div>
            {/* Part 2: Info Column */}
            <div className="profile-info-details">
              <p className="profile-menu-name">{user.name}</p>
              <p className="profile-menu-email">{user.email}</p>
              <span className="profile-menu-role">{user.role}</span>
            </div>
          </div>
          
          <div className="profile-menu-items">
            <Link 
              to="/profile" 
              className="profile-menu-item"
              onClick={() => setIsOpen(false)}
            >
              <FiUser className="w-4 h-4" />
              <span>Profile</span>
              <GoArrowRight />
            </Link>
          </div>
          
          <div className="profile-menu-divider"></div>
          
          <button onClick={logout} className="profile-menu-item logout-button">
            <span>Logout</span>
            <GoArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}


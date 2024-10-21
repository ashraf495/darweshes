import React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink for active styling
import './header.css';
import headerImage from '../assets/images/3.png';  // Import the header background image

const Header = () => {
  return (
    <header className="app-header" style={{ backgroundImage: `url(${headerImage})` }}>
      <a href="/" className="logo">سوق الدراويش</a>  {/* Make the logo clickable */}
      <nav>
        <ul>
          <li>
            <NavLink 
              to="/control" 
              className={({ isActive }) => isActive ? 'active-link' : ''}
            >
              لوحة التحكم
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/customers" 
              className={({ isActive }) => isActive ? 'active-link' : ''}
            >
              عمليات العملاء
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/resellers" 
              className={({ isActive }) => isActive ? 'active-link' : ''}
            >
              الموزعين
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/agency" 
              className={({ isActive }) => isActive ? 'active-link' : ''}
            >
              وكالتنا
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

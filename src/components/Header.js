import React, { useState, useEffect, useRef } from 'react';
import '../stylesheet/Header.css';
import '../stylesheet/global.css';

const Header = ({ onSearch, onToggleUserProfile, onLogout, nickname, handleToggleSidebar }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuVisible(prevVisible => !prevVisible);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="header">
      <button className="menu-button" onClick={handleToggleSidebar}>☰</button>
      <div className="search-container">
        <input
          type="text"
          className="search"
          placeholder="Поиск..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="user-profile" onClick={toggleMenu} ref={menuRef}>
        <div className="user-pic">Pic</div>
        <div className="user-name">{nickname}</div>
        {menuVisible && (
          <div className="dropdown-menu">
            <div className="menu-item" onClick={onToggleUserProfile}>Личный кабинет</div>
            <div className="menu-item">Настройки</div>
            <div className="menu-item">Тех. поддержка</div>
            <div className="menu-item" onClick={onLogout}>Выход</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;


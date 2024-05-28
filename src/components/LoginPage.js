import React, { useState } from 'react';
import axios from 'axios';
import '../stylesheet/global.css';

const LoginPage = ({ onLogin, onGoToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    axios.post('http://localhost:5000/api/login', { username, password })
      .then(response => {
        onLogin(response.data.user, response.data.token);
      })
      .catch(error => {
        setError('Invalid username or password');
      });
  };

  return (
    <div className="login-page">
      <h1 className="app-title">SmartNote</h1>
      <div className="login-container">
        <h2>Вход</h2>
        <div className="input-box">
          <input
            type="text"
            placeholder="Введите username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Введите пароль..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="login-button" onClick={handleLogin}>Войти</button>
        <button className="register-button" onClick={onGoToRegister}>Регистрация</button>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import axios from 'axios';
import '../stylesheet/global.css';

const RegisterPage = ({ onRegister, onGoBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleRegister = () => {
    if (!nickname || !username || !password || !email) {
      setError('All fields are required');
      return;
    }

    axios.post('http://localhost:5000/api/register', { nickname, username, password, email })
      .then(response => {
        onRegister(response.data.user, response.data.token);
      })
      .catch(error => {
        setError('Регистрация провалена');
      });
  };

  return (
    <div className="register-page">
      <h1 className="app-title">SmartNote</h1>
      <div className="register-container">
        <h2>Регистрация</h2>

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

        <div className="input-box">
          <input
          type="text"
          placeholder="Введите nickname..."
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        </div>

        <div className="input-box">
          <input
          type="email"
          placeholder="Введите ваш email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        </div>

        <button className="register-button" onClick={handleRegister}>Готово</button>
        <button className="back-button2" onClick={onGoBack}>Назад</button>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default RegisterPage;

import React from 'react';
import '../stylesheet/global.css';

const Login = ({ onLogin }) => {
  return (
    <div className="login-page">
      <h1 className="app-title">SmartNote</h1>
      <div className="login-container">
        <h2>Начать работу!</h2>
        <div className="button-group">
          <button className="login-button" onClick={onLogin}>Войти</button>
          <button className="register-button">Регистрация</button>
        </div>
      </div>
    </div>
  );
};

export default Login;

import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/', // Используем относительный путь
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance;
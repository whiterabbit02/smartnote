import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Используем относительный путь
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance;

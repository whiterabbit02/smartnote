import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://185.173.94.160:5000/', // Используем относительный путь
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance;

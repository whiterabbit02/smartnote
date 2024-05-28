import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://smartnote-phi.vercel.app/', // Используем относительный путь
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance;

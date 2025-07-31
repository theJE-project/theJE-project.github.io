import axios from "axios";

export const springBoot = axios.create({
  baseURL: 'http://localhost:8888/api/',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  }
});
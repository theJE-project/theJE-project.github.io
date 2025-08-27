import axios from "axios";

export const springBoot = axios.create({
  baseURL: 'http://localhost:8888/api/',
  // baseURL: 'http://15.164.93.30:8888/api/',
  // baseURL: 'https://thejeteam.p-e.kr/api',
  // timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  }
});
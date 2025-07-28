import axios from "axios";

const apiKey = 'AIzaSyAP3q_Lv18QasTEgiLarbsk89K2_OptzE0';

export const youtube = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3/',
  timeout: 5000,
  params: {
    part: 'snippet',
    type: 'video',
    videoCategoryId: '10',
    key: apiKey,
    maxResults: 10,
  },
});
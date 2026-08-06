export const CRM_LANDING_URL = import.meta.env.VITE_CRM_LANDING_URL || 'http://localhost:5174/landing';

const envApiUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = envApiUrl !== undefined && envApiUrl !== '' ? envApiUrl : (import.meta.env.PROD ? '' : 'http://localhost:8086');

const envWsUrl = import.meta.env.VITE_WS_BROKER_URL;
const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8086';
export const WS_BROKER_URL = envWsUrl !== undefined && envWsUrl !== '' ? envWsUrl : (import.meta.env.PROD ? `${protocol}//${host}/ws` : 'ws://localhost:8086/ws');

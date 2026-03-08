// API configuration for Bot Bu mobile
// Change this to your deployed Next.js backend URL
// For local dev, use your Mac's local IP (not localhost/127.0.0.1)

// To find your local IP: run `ifconfig | grep inet` in terminal
// Example: http://192.168.1.51:3000

// npm run dev 2>&1

// > bing_chat@0.1.0 dev
// > next dev --turbopack

//    ▲ Next.js 15.5.7 (Turbopack)
//    - Local:        http://localhost:3000
//    - Network:      http://149.125.178.50:3000 
//    - Environments: .env.local

const DEV_API_URL = 'http://192.168.1.136:3000';
// const DEV_API_URL = 'http://149.125.178.50:3000';
const PROD_API_URL = 'https://bu-chat-test.vercel.app';

// Toggle this when deploying
const IS_PRODUCTION = false;

export const API_BASE_URL = IS_PRODUCTION ? PROD_API_URL : DEV_API_URL;

export const ENDPOINTS = {
  CHAT: `${API_BASE_URL}/api/chat`,
  CHAT_RAG: `${API_BASE_URL}/api/chat-rag`,
  USAGE: `${API_BASE_URL}/api/usage`,
  TRANSCRIBE: `${API_BASE_URL}/api/transcribe`,
};

/**
 * Application constants for the Sadqah web application
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
  },
  DASHBOARD: {
    PROFILE: '/api/dashboard/profile',
    USERS: '/api/dashboard/users',
  },
} as const;

// App Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  USERS: '/dashboard/users',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  NAVBAR_HEIGHT: '64px',
  SIDEBAR_WIDTH: '250px',
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Donation Categories
export const DONATION_CATEGORIES = [
  'Education',
  'Healthcare',
  'Food & Water',
  'Emergency Relief',
  'Community Development',
] as const;
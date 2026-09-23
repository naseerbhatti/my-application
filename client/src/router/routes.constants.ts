/**
 * Route paths constants
 * Use these instead of hardcoding route paths throughout the app
 */

export const ROUTES = {
  // Public routes
  LOGIN: "/login",

  // Protected routes
  ROOT: "/",
  DASHBOARD: "/dashboard",
  FILES: "/files",
  RACK_MANAGEMENT: "/rack-management",

  // Special routes
  NOT_FOUND: "*",
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  LIBRARIAN: "librarian",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

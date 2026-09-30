/// <reference types="vite/client" />

export const Server =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api/";

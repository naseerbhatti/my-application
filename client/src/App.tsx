import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Providers from "@/src/providers";
import AuthProvider from "@/src/providers/AuthProvider";

import DashboardLayout from "@/src/pages/DashboardLayout";
import NotFound from "./components/NotFound";
import LoginPage from "./pages/auth/login";
import AppRouter from "./router";

function App() {
  return (
    <Providers>
      <Toaster />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Providers>
  );
}

export default App;

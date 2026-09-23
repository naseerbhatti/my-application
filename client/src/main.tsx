import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";
import { Agentation } from "agentation";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {import.meta.env.DEV && <Agentation />}
    </BrowserRouter>
  </React.StrictMode>,
);

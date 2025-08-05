/* =================================================================
 * FOLDER: frontend-web/src/
 * This is the main entry point for the React application.
 * ================================================================= */
// PATH: frontend-web/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

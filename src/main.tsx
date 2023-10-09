import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import log from "loglevel";

if (import.meta.env.PROD) {
  log.setLevel(log.levels.WARN);
} else {
  log.setLevel(log.levels.DEBUG);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

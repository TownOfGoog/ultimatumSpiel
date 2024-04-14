import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import "@fontsource/inter";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { GameManagerProvider } from "./service/useGameManager";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <GameManagerProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/create" element={<App />} />
          <Route path="/lobby/:lobby_code" element={<App />} />
          <Route path="*"element={<App />} />
        </Routes>
      </GameManagerProvider>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

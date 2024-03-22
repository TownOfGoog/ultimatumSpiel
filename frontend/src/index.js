import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CssVarsProvider } from '@mui/joy/styles';
import { GameManagerProvider } from './service/useGameManager'



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CssVarsProvider defaultMode="dark">
      <GameManagerProvider>
        <App />
      </GameManagerProvider>
    </CssVarsProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
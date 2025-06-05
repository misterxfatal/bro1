import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import database from './db/database';

// Initialize database before rendering the app
const init = async () => {
  try {
    await database.initialize();
    
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Show error message to user
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = '<div style="color: red; padding: 20px;">Failed to initialize the application. Please try refreshing the page.</div>';
    }
  }
};

init();
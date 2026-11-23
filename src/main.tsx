import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Welcome from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Welcome />
  </StrictMode>,
);

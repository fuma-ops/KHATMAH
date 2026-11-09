import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Garde l'invitation d'installation (Android / Chrome) même si elle arrive avant l'affichage du bouton.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).__khatmahInstall = e;
});

import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client
import App from './app'; // Import your app component (lowercase 'a')

// Get the root element from the DOM
const rootElement = document.getElementById('root');

// Create a root and render the App component
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

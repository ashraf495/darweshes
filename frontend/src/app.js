import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import React Router components
import Header from './components/header';
import Footer from './components/footer';
import Control from './components/control';
import Customers from './components/customers';
import Resellers from './components/resellers';
import Agency from './components/agency';
import backgroundImage from './assets/images/background.jpg';  // Importing the image
import './app.css';

const App = () => {
  return (
    <Router>
      <div 
        className="app"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Header className="app-header" />
        <div className="main-content">
          <Routes>
            <Route path="/control" element={<Control />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/resellers" element={<Resellers />} />
            <Route path="/agency" element={<Agency />} />
          </Routes>
        </div>

        <Footer className="app-footer" />
      </div>
    </Router>
  );
};

export default App;

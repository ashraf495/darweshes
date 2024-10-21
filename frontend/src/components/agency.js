import React from 'react';
import './agency.css';

const Agency = () => {
  return (
    <div className="agency-dashboard-container">
      {/* Add the iframe with the Metabase public link */}
      <iframe
        src="http://localhost:3001/public/dashboard/2f6ce37d-2859-4e4b-bff1-8364f1cdec5b" // Replace with the actual Metabase dashboard link
        width="100%"
        height="800px"
        style={{ border: 'none' }}
        title="Metabase Dashboard"
      ></iframe>
    </div>
  );
};

export default Agency;


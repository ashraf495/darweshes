import React, { useEffect, useState } from 'react';
import './footer.css';

const images = [
  "/images/photo1.png",
  "/images/photo2.png",
  "/images/photo3.png",
  "/images/photo4.png"
];

const Footer = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Set the interval to match the full animation time (4 seconds)
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);  // Change image every 4 seconds

    return () => clearInterval(interval);  // Clean up on unmount
  }, []);

  return (
    <footer className="app-footer">
      <div className="image-slider">
        <div className="slider-track">
          <img
            src={images[currentImageIndex]}  // Only display the current image
            alt={`Slider image ${currentImageIndex + 1}`}
            className="slider-image"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState, useEffect } from "react";

const ImageGallery = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const images = [
    "/images/chapters/012/012-1.jpeg",
    "/images/chapters/012/012-2.jpeg",
    "/images/chapters/012/012-3.jpeg",
  ];

  useEffect(() => {
    // Simulate a slight delay before showing images to ensure smooth animation
    const timer = setTimeout(() => {
      setImagesLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen flex">
      {images.map((image, index) => (
        <div
          key={image}
          className="flex-1 p-2"
          style={{
            opacity: imagesLoaded ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            transitionDelay: `${index * 0.2}s`,
          }}
        >
          <img
            src={image}
            alt={`Image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;

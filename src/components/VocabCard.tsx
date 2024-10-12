import React, { useEffect, useState } from "react";

interface VocabCardProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

const VocabCard: React.FC<VocabCardProps> = ({
  term,
  definition,
  children,
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const simplifiedTerm = term.split("(")[0].trim().replace(/ /g, "_");
  const imagePath = `/images/vocab/${simplifiedTerm}.webp`;

  console.log(
    `VocabCard: Attempting to load image for term "${term}" at path: ${imagePath}`
  );

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      console.log(`VocabCard: Successfully loaded image for "${term}"`);
      setBackgroundImage(imagePath);
    };
    img.onerror = () =>
      console.error(`VocabCard: Failed to load image: ${imagePath}`);
    img.src = imagePath;
  }, [imagePath, term]);

  return (
    <div
      className="bg-white shadow-md rounded-lg p-4 h-96 relative overflow-hidden"
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent transition-opacity duration-300"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-lg font-semibold mb-2">{term}</h3>
        <p className="text-sm">{definition}</p>
        {children}
      </div>
    </div>
  );
};

export default VocabCard;

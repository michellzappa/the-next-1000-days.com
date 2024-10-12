import React from "react";

interface VocabCardProps {
  term: string;
  definition: string;
}

const VocabCard: React.FC<VocabCardProps> = ({ term, definition }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">{term}</h3>
      <p className="text-sm text-gray-700">{definition}</p>
    </div>
  );
};

export default VocabCard;

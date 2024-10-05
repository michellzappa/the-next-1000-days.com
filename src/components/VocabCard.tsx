import React from "react";

interface VocabCardProps {
  term: string;
}

const VocabCard: React.FC<VocabCardProps> = ({ term }) => {
  return (
    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
      {term}
    </span>
  );
};

export default VocabCard;

import React from "react";

interface VocabCardProps {
  name: string;
  vocabData: Record<string, { title: string; summary: string }>;
}

const VocabCard: React.FC<VocabCardProps> = ({ name, vocabData }) => {
  const vocabEntry = vocabData[name];

  if (!vocabEntry) {
    return <div>Vocab entry not found for {name}</div>;
  }

  return (
    <div className="vocab-card">
      <h3 className="font-bold">{vocabEntry.title}</h3>
      <p>{vocabEntry.summary}</p>
    </div>
  );
};

export default VocabCard;

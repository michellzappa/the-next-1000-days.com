import React from "react";

interface VocabCardProps {
  name: string;
  vocabData: Record<string, { title: string; summary: string }>;
}

const VocabCard: React.FC<VocabCardProps> = ({ name, vocabData }) => {
  if (
    !vocabData ||
    typeof vocabData !== "object" ||
    Object.keys(vocabData).length === 0
  ) {
    console.warn("vocabData is invalid in VocabCard");
    return <span className="text-yellow-500">{name}</span>;
  }

  const lowercaseName = name.toLowerCase();
  const vocabEntry = vocabData[lowercaseName];

  if (!vocabEntry) {
    console.warn(`No vocab entry found for "${lowercaseName}"`);
    return <span className="text-yellow-500">{name}</span>;
  }

  return (
    <span
      className="vocab-card inline-block bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 cursor-help"
      title={vocabEntry.summary}
    >
      {vocabEntry.title}
    </span>
  );
};

export default VocabCard;

import React from "react";

interface QuestionCardProps {
  question: string;
  options: string[];
  selected: string | undefined;
  onSelect: (option: string, idx: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, options, selected, onSelect }) => {
  return (
    <div className="p-4 border rounded-md shadow-md mb-4 bg-white">
      <p className="font-semibold mb-2">{question}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            className={`p-2 border rounded-md text-left ${selected === String(idx) ? 'bg-green-200' : 'bg-gray-100'}`}
            onClick={() => onSelect(opt, idx)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;

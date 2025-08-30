import React from "react";

interface QuestionCardProps {
  question: string;
  options: string[];
  selected: string | undefined;
  onSelect: (option: string, idx: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, options, selected, onSelect }) => {
  return (
    <div className="mb-6 p-6 rounded-xl shadow-xl bg-[#00353A] backdrop-blur-lg border border-white/60 hover:bg-white/90 hover:text-[#00353A] transition-all duration-300 group">
      <p className="font-semibold text-white mb-4 group-hover:text-[#00353A]">{question}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            className={`w-full cursor-pointer p-3 rounded-lg border-2 transition-all hover:scale-105 text-xs font-medium ${
              selected === String(idx)
                ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md text-[#00353A]'
                : 'border-gray-200 bg-white/60 hover:border-orange-300 hover:bg-orange-50/50 text-gray-700'
            }`}
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

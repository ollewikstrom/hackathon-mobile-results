import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TeamAnswer } from "../types";
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';

interface TeamAnswerCardProps {
  teamAnswer: TeamAnswer;
}

export function TeamAnswerCard({ teamAnswer }: TeamAnswerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate a consistent robot avatar using Dicebear with teamName as the seed
  const avatar = createAvatar(bottts, {
    size: 128,
    seed: teamAnswer.teamName,
  }).toDataUri();

  const cleanContent = (content: string): string => {
    return content
      .replace(/HoHoHo!?/g, "")
      .replace(/Merry Christmas!?/g, "")
      .trim();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 8) return "bg-green-100";
    if (score >= 5) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className={`rounded-xl shadow-sm overflow-hidden ${isExpanded ? 'bg-blue-50' : 'bg-white'} transition-colors duration-200`}>
      <button
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-blue-50 transition-colors duration-200 gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <img 
            src={avatar} 
            alt={`${teamAnswer.teamName} avatar`} 
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-[#004a73] break-all line-clamp-2">
              {teamAnswer.teamName}
            </div>
            <div className={`text-sm ${getScoreColor(teamAnswer.score)} font-medium`}>
              {teamAnswer.score} points
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={`px-3 py-1 rounded-full ${getScoreBackground(teamAnswer.score)} ${getScoreColor(teamAnswer.score)} text-sm font-medium whitespace-nowrap`}>
            +{teamAnswer.score}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-[#0070AD] flex-shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#0070AD] flex-shrink-0" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-blue-100">
          <div className="pt-4">
            <h4 className="text-sm font-medium text-[#0070AD] mb-2">
              Answer
            </h4>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="text-[#004a73] whitespace-pre-line break-words">
                {teamAnswer.answer.includes("```")
                  ? teamAnswer.answer
                  : cleanContent(teamAnswer.answer)}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#0070AD] mb-2">
              Judge's Motivation
            </h4>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="text-[#004a73] break-words">
                {teamAnswer.motivation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
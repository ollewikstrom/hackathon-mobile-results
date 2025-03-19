import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TeamAnswer } from "../types";

interface TeamAnswerCardProps {
  teamAnswer: TeamAnswer;
}

export function TeamAnswerCard({ teamAnswer }: TeamAnswerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate a consistent robot avatar URL for each team
  const robotAvatar = `https://robohash.org/${encodeURIComponent(teamAnswer.teamName)}?set=set3&size=100x100`;

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
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-blue-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <img 
            src={robotAvatar} 
            alt={`${teamAnswer.teamName} avatar`} 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div>
            <span className="font-semibold text-[#004a73]">
              {teamAnswer.teamName}
            </span>
            <div className={`text-sm ${getScoreColor(teamAnswer.score)} font-medium`}>
              {teamAnswer.score} points
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full ${getScoreBackground(teamAnswer.score)} ${getScoreColor(teamAnswer.score)} text-sm font-medium`}>
            +{teamAnswer.score}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-[#0070AD]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#0070AD]" />
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
              <p className="text-[#004a73] whitespace-pre-line">
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
              <p className="text-[#004a73]">
                {teamAnswer.motivation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
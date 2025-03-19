import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TeamPromptCardProps {
  teamName: string;
  prompt: string;
  color?: string;
}

export function TeamPromptCard({ teamName, prompt, color = "bg-gray-500" }: TeamPromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate a consistent robot avatar URL for each team
  const robotAvatar = `https://robohash.org/${encodeURIComponent(teamName)}?set=set3&size=100x100`;

  return (
    <div 
      className={`rounded-xl shadow-sm overflow-hidden ${
        isExpanded ? "bg-blue-50" : "bg-white"
      } border border-blue-100 transition-colors duration-200`}
    >
      <button
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <img 
            src={robotAvatar} 
            alt={`${teamName} avatar`} 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-medium text-[#004a73]">
            {teamName}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-[#0070AD]" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[#0070AD]" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-blue-100">
          <div className="pt-4">
            <h4 className="text-sm font-medium text-[#0070AD] mb-2">
              Team Prompt
            </h4>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="text-[#004a73] whitespace-pre-line">
                {prompt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
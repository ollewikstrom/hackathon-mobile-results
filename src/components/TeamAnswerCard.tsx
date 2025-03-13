import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TeamAnswer } from "../types";

interface TeamAnswerCardProps {
	teamAnswer: TeamAnswer;
}

export function TeamAnswerCard({ teamAnswer }: TeamAnswerCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	console.log(teamAnswer);

	// Clean answer content by removing HoHoHo and Merry Christmas
	const cleanContent = (content: string): string => {
		return content
			.replace(/HoHoHo!?/g, "")
			.replace(/Merry Christmas!?/g, "")
			.trim();
	};

	// Get team color class or default to gray
	const teamColorClass = teamAnswer.teamColor || "bg-gray-500";

	return (
		<div className="border rounded-lg shadow-sm bg-white mb-4">
			<button
				className="w-full px-4 py-3 flex items-center justify-between text-left"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center">
					<div
						className={`w-4 h-4 rounded-full ${teamColorClass} mr-3`}
					></div>
					<span className="font-medium text-gray-900">
						{teamAnswer.teamName}
					</span>
				</div>
				{isExpanded ? (
					<ChevronUp className="h-5 w-5 text-gray-500" />
				) : (
					<ChevronDown className="h-5 w-5 text-gray-500" />
				)}
			</button>

			{isExpanded && (
				<div className="px-4 pb-4 space-y-3">
					<div>
						<h4 className="text-sm font-medium text-gray-500">
							Answer
						</h4>
						<p className="mt-1 text-gray-900 whitespace-pre-line">
							{teamAnswer.answer.includes("```")
								? teamAnswer.answer // Keep code blocks intact
								: cleanContent(teamAnswer.answer)}
						</p>
					</div>

					<div>
						<h4 className="text-sm font-medium text-gray-500">
							Judge's Motivation
						</h4>
						<p className="mt-1 text-gray-900">
							{teamAnswer.motivation}
						</p>
					</div>

					<div>
						<h4 className="text-sm font-medium text-gray-500">
							Score
						</h4>
						<p className="mt-1 text-gray-900 font-semibold">
							{teamAnswer.score} points
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

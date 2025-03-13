import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TeamPromptCardProps {
	teamName: string;
	prompt: string;
}

export function TeamPromptCard({ teamName, prompt }: TeamPromptCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="border rounded-lg shadow-sm bg-white mb-4">
			<button
				className="w-full px-4 py-3 flex items-center justify-between text-left"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<span className="font-medium text-gray-900">{teamName}</span>
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
							Prompt
						</h4>
						<p className="mt-1 text-gray-900">{prompt}</p>
					</div>
				</div>
			)}
		</div>
	);
}

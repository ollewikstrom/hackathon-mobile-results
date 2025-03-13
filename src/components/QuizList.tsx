import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TeamPromptCard } from "./TeamPromptCard";
import { ArrowRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function QuizList() {
	const { quizId } = useParams(); // Get quizId at component level
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["teams"],
		queryFn: async () => {
			const response = await fetch(
				`https://hack-genai.azurewebsites.net/api/teams/getByQuiz/${quizId}`
			);
			return response.json();
		},
	});

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-2xl mx-auto px-4 py-8">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">
					Teams in Quiz
				</h1>
				<div className="space-y-4">
					{quizId && (
						<Link
							key={quizId}
							to={`/${quizId}/answers`}
							className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between"
						>
							View answers
							<ArrowRight />
						</Link>
					)}
				</div>
				<ul className="space-y-4 mt-4">
					{query &&
						query.data?.map((team: any) => (
							<TeamPromptCard
								teamName={team.name}
								prompt={team.prompt}
							/>
						))}
				</ul>
			</div>
		</div>
	);
}

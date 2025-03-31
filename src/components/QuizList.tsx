import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TeamPromptCard } from "./TeamPromptCard";
import { ArrowRight } from "lucide-react";
import { useQuery} from "@tanstack/react-query";

export function QuizList() {
	const { quizId } = useParams();
	const [teams, setTeams] = useState<any[]>([]);
	
	

	// Fetch teams data
	const query = useQuery({
		queryKey: ["teams", quizId],
		queryFn: async () => {
		const response = await fetch(
			`https://hack-genai.azurewebsites.net/api/teams/getByQuiz/${quizId}`
		);
		if (!response.ok) throw new Error("Failed to fetch teams");
		return response.json();
		},
		enabled: !!quizId, // Only run when quizId exists
	});
	
	// Fetch quiz data with the correct endpoint
	const quizQuery = useQuery({
		queryKey: ["quiz", quizId],
		queryFn: async () => {
		if (!quizId) throw new Error("Quiz ID is missing");
		const response = await fetch(`https://hack-genai.azurewebsites.net/api/quizzes/getQuizById/${quizId}`);
		if (!response.ok) {
			if (response.status === 404) {
			throw new Error("Quiz not found. Please check the quiz ID.");
			}
			throw new Error("Failed to fetch quiz data");
		}
		const data = await response.json();
		console.log("Quiz data fetched:", data); // Debug log
		return data;
		},
		enabled: !!quizId, // Only run the query if quizId is defined
	});
	
	// Update the useEffect to use the quizQuery data
	useEffect(() => {
		if (query.data) {
		setTeams([...query.data]);
		}
	}, [query.data]);

	
	if (quizQuery.isLoading) {
		return (
		  <div className="min-h-screen bg-[#f0f7fc] flex items-center justify-center p-4">
			<div className="text-xl font-semibold text-[#0070AD]">Loading quiz details...</div>
		  </div>
		);
	  }
	  
	  if (quizQuery.isError) {
		return (
		  <div className="min-h-screen bg-[#f0f7fc] flex items-center justify-center p-4">
			<div className="text-xl font-semibold text-red-600">
			  Error loading quiz: {quizQuery.error instanceof Error ? quizQuery.error.message : 'Unknown error'}
			</div>
		  </div>
		);
	  }


	return (
		<div className="min-h-screen bg-[#f0f7fc]">
			{/* Sogeti & Stampen Media Logo Banner */}
			<div className="fixed top-0 left-0 right-0 z-10 bg-white py-3 px-4 shadow-sm flex justify-center">
				<div className="max-w-6xl w-full flex items-center justify-center gap-4">
					<img src="/images/Sogeti-logo-2018.svg" alt="Sogeti Logo" className="h-12" />
					{/* <span className="text-[#004a73] font-bold text-xl">x</span>
					<img src="/images/stampen-media.png" alt="Stampen Media Logo" className="h-10" /> */}
				</div>
			</div>

			{/* Quiz Header Section */}
			<div className="max-w-2xl mx-auto px-4 pt-20 pb-8 space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<h1 className="text-2xl font-bold text-[#004a73] text-center">
					{quizQuery.data && quizQuery.data.length > 0 ? quizQuery.data[0].name : 'Untitled Quiz'}
					</h1>
					{quizId && (
						<Link
							to={`/${quizId}/answers`}
							className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0070AD] text-white rounded-xl font-medium hover:bg-[#005d8f] transition-colors shadow-sm hover:shadow-md"
						>
							View answers
							<ArrowRight className="w-5 h-5" />
						</Link>
					)}
				</div>

				{/* Teams List Section */}
				<div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100">
					<div className="text-lg font-bold text-[#0070AD] mb-3">
						View team's prompt
						</div>
					<div className="text-sm font-medium text-[#0070AD] mb-3">
						Total Teams: {teams.length || 0}
						</div>
					<ul className="space-y-4">
						{teams.map((team: any) => (
							<TeamPromptCard key={team.id} teamName={team.name} prompt={team.prompt} color={team.color} />
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

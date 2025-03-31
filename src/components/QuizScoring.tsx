import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { TeamAnswerCard } from "./TeamAnswerCard";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Team, TeamAnswer, Question, Judgment } from "../types";
import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";

export function QuizScoring() {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [showLeaderboard, setShowLeaderboard] = useState(false);
	const [teamScores, setTeamScores] = useState<{id: string, name: string, color: string, score: number}[]>([]);
	const [organizedData, setOrganizedData] = useState({
		questions: [] as Question[],
		teamAnswers: {} as Record<string, TeamAnswer[]>,
		totalQuestions: 0,
	});

	const { quizId } = useParams<{ quizId: string }>();

	// Helper function to sort team names naturally (handles numbers correctly)
	const naturalSort = (a: string, b: string) => {
		return a.localeCompare(b, undefined, {
			numeric: true,
			sensitivity: 'base'
		});
	};

	// Function to generate team avatar from Dicebear
	const generateTeamAvatar = (teamName: string) => {
		return createAvatar(bottts, {
			size: 128,
			seed: teamName,
		}).toDataUri();
	};

	// Fetch answers with no pagination or limits
	const answersQuery = useQuery({
		queryKey: ["answers", quizId],
		queryFn: async () => {
			const response = await fetch(
				`https://hack-genai.azurewebsites.net/api/answers/getAll/${quizId}`,
				{
					headers: {
						'Accept': 'application/json',
						'Cache-Control': 'no-cache'
					}
				}
			);

			if (!response.ok) {
				throw new Error("Failed to fetch answers");
			}

			const data = await response.json();
			console.log('Total answers fetched:', data.answers?.length); // Debug log
			return data;
		},
		enabled: !!quizId,
	});

	// Fetch teams
	const teamsQuery = useQuery({
		queryKey: ["teams", quizId],
		queryFn: async () => {
			const response = await fetch(
				`https://hack-genai.azurewebsites.net/api/teams/getByQuiz/${quizId}`,
				{
					headers: {
						'Accept': 'application/json',
						'Cache-Control': 'no-cache'
					}
				}
			);
			if (!response.ok) throw new Error("Failed to fetch teams");
			const data = await response.json();
			console.log('Total teams fetched:', data.length); // Debug log
			return data;
		},
		enabled: !!quizId,
	});

	// Fetch judgments
	const judgmentsQuery = useQuery({
		queryKey: ["judgments", quizId],
		queryFn: async () => {
			const response = await fetch(
				`https://hack-genai.azurewebsites.net/api/judgements/getAll/${quizId}`,
				{
					headers: {
						'Accept': 'application/json',
						'Cache-Control': 'no-cache'
					}
				}
			);
			if (!response.ok) throw new Error("Failed to fetch judgments");
			const data = await response.json();
			console.log('Total judgments fetched:', data.length); // Debug log
			return data;
		},
		enabled: !!quizId,
	});

	useEffect(() => {
		if (
			answersQuery.data?.answers &&
			teamsQuery.data &&
			judgmentsQuery.data
		) {
			console.log('Processing data for organization...'); // Debug log

			const teamMap = new Map<string, Team>();
			teamsQuery.data.forEach((team: Team) => {
				teamMap.set(team.id, team);
			});

			const judgmentMap = new Map<string, Judgment>();
			judgmentsQuery.data.forEach((judgment: Judgment) => {
				const key = `${judgment.questionId}_${judgment.teamId}`;
				judgmentMap.set(key, judgment);
			});

			const questions: Question[] = [];
			const teamAnswers: Record<string, TeamAnswer[]> = {};
			const questionMap = new Map<
				string,
				{ id: string; content: string; index: number }
			>();
            
            // To track team scores
            const scores: Record<string, {id: string, name: string, color: string, score: number}> = {};

			// Process all answers without any filtering
			answersQuery.data.answers.forEach((answer: any) => {
				// Add question if it doesn't exist
				if (!questionMap.has(answer.questionId)) {
					questionMap.set(answer.questionId, {
						id: answer.questionId,
						content: answer.questionContent,
						index: questions.length,
					});
					questions.push({
						id: answer.questionId,
						content: answer.questionContent,
					});
				}

				// Initialize answers array for this question if needed
				if (!teamAnswers[answer.questionId]) {
					teamAnswers[answer.questionId] = [];
				}

				const judgmentKey = `${answer.questionId}_${answer.teamId}`;
				const judgment = judgmentMap.get(judgmentKey);
				const team = teamMap.get(answer.teamId);
                const score = judgment ? judgment.score : 0;
                
                // Update team scores
                if (team) {
                    if (!scores[team.id]) {
                        scores[team.id] = {
                            id: team.id,
                            name: team.name,
                            color: team.color,
                            score: 0
                        };
                    }
                    scores[team.id].score += score;
                }

				// Add answer to the question's answers array
				teamAnswers[answer.questionId].push({
					teamId: answer.teamId,
					teamName: team ? team.name : `Unknown Team`,
					teamColor: team ? team.color : "bg-gray-500",
					answerId: answer.id,
					answer: answer.content,
					score: score,
					motivation: judgment
						? judgment.content
						: "No judgment provided yet.",
				});
			});
            
            // Convert scores object to array and sort by score (descending) and then by name
            const scoreArray = Object.values(scores).sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score; // Sort by score descending
                }
                return naturalSort(a.name, b.name); // If scores are equal, sort by name
            });
            setTeamScores(scoreArray);

			// Sort team answers within each question
			Object.keys(teamAnswers).forEach(questionId => {
				teamAnswers[questionId].sort((a, b) => naturalSort(a.teamName, b.teamName));
			});

			console.log('Data organization complete:'); // Debug logs
			console.log('- Questions:', questions.length);
			console.log('- Teams with scores:', scoreArray.length);
			Object.keys(teamAnswers).forEach(qId => {
				console.log(`- Answers for question ${qId}:`, teamAnswers[qId].length);
			});

			setOrganizedData({
				questions,
				teamAnswers,
				totalQuestions: questions.length,
			});
		}
	}, [answersQuery.data, teamsQuery.data, judgmentsQuery.data]);

	const goToPreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const goToNextQuestion = () => {
		if (currentQuestionIndex < organizedData.totalQuestions - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		}
	};

	const currentQuestion = organizedData.questions[currentQuestionIndex];
	const currentAnswers = currentQuestion
		? organizedData.teamAnswers[currentQuestion.id]
		: [];

	const isLoading =
		answersQuery.isLoading ||
		teamsQuery.isLoading ||
		judgmentsQuery.isLoading;

	const hasError =
		answersQuery.isError || teamsQuery.isError || judgmentsQuery.isError;
	const errorMessage =
		answersQuery.error?.message ||
		teamsQuery.error?.message ||
		judgmentsQuery.error?.message;

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#f0f7fc] flex items-center justify-center">
				<div className="text-xl font-semibold text-[#0070AD]">
					Loading quiz data...
				</div>
			</div>
		);
	}

	if (hasError) {
		return (
			<div className="min-h-screen bg-[#f0f7fc] flex items-center justify-center">
				<div className="text-xl font-semibold text-red-600">
					Error loading quiz data: {errorMessage || "Unknown error"}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f0f7fc] p-6">
			{/* Sogeti Logo Banner */}
			<div className="fixed top-0 left-0 right-0 z-10 bg-white py-3 px-4 shadow-sm flex justify-center">
				<div className="max-w-6xl w-full flex items-center justify-center gap-4">
					<img src="/images/Sogeti-logo-2018.svg" alt="Sogeti Logo" className="h-12" />
					{/* <span className="text-[#004a73] font-bold text-xl">x</span>
					<img src="/images/stampen-media.png" alt="Stampen Media Logo" className="h-10" /> */}
				</div>
			</div>
            
			<div className="max-w-6xl mx-auto pt-14">
				{/* Leaderboard Toggle Button */}
				<div className="flex justify-end mb-4">
					<button
						onClick={() => setShowLeaderboard(!showLeaderboard)}
						className="flex items-center gap-2 px-4 py-2 bg-[#0070AD] text-white rounded-lg hover:bg-[#005d8f] transition-colors"
					>
						<Trophy size={16} />
						{showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
					</button>
				</div>

				{/* Leaderboard */}
				{showLeaderboard && (
					<div className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-blue-100">
						<h2 className="text-xl font-semibold mb-4 text-[#004a73] flex items-center">
							<Trophy className="mr-2 text-[#0070AD]" size={24} />
							Leaderboard
						</h2>
						<div className="overflow-hidden rounded-lg border border-blue-100">
							{teamScores.map((team, index) => (
								<div 
									key={team.id} 
									className={`flex items-center p-3 ${index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}`}
								>
									<div className="flex items-center space-x-3 flex-1 min-w-0">
										<span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${index < 3 ? 'bg-[#0070AD]' : 'bg-gray-300'} text-white font-bold`}>
											{index + 1}
										</span>
										<div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden">
											<img 
												src={generateTeamAvatar(team.name)} 
												alt={`${team.name} avatar`} 
												className="w-8 h-8 rounded-lg object-cover"
											/>
										</div>
										<span className="font-medium text-[#004a73] truncate">
											{team.name}
										</span>
									</div>
									<div className="flex-shrink-0 text-lg font-bold text-[#0070AD] ml-4">
										{team.score} pts
									</div>
								</div>
							))}
							{teamScores.length === 0 && (
								<div className="p-4 text-center text-gray-500">
									No scores available yet
								</div>
							)}
						</div>
					</div>
				)}

				<div className="flex justify-between items-center mb-8">
					<button
						onClick={goToPreviousQuestion}
						disabled={currentQuestionIndex === 0}
						className={`flex items-center p-2 rounded-lg transition-colors ${
							currentQuestionIndex === 0
								? "text-blue-300 cursor-not-allowed"
								: "text-[#0070AD] hover:text-[#005d8f] hover:bg-blue-100"
						}`}
					>
						<ChevronLeft className="w-5 h-5 mr-1" />
						Previous
					</button>

					<div className="text-lg font-medium text-[#004a73]">
						Question {currentQuestionIndex + 1} of{" "}
						{organizedData.totalQuestions}
					</div>

					<button
						onClick={goToNextQuestion}
						disabled={
							currentQuestionIndex ===
							organizedData.totalQuestions - 1
						}
						className={`flex items-center p-2 rounded-lg transition-colors ${
							currentQuestionIndex ===
							organizedData.totalQuestions - 1
								? "text-blue-300 cursor-not-allowed"
								: "text-[#0070AD] hover:text-[#005d8f] hover:bg-blue-100"
						}`}
					>
						Next
						<ChevronRight className="w-5 h-5 ml-1" />
					</button>
				</div>

				{currentQuestion && (
					<div className="bg-white rounded-xl shadow-md p-6 mb-8 border-2 border-blue-100">
						<h2 className="text-xl font-semibold mb-2 text-[#004a73]">
							Question:
						</h2>
						<p className="text-lg text-[#0070AD]">
							{currentQuestion.content}
						</p>
					</div>
				)}

				<div className="space-y-6">
					<h2 className="text-xl font-semibold mb-4 text-[#004a73]">
						Team Answers ({currentAnswers.length})
					</h2>
					{currentAnswers.length > 0 ? (
						<div className="grid gap-6">
							{currentAnswers.map((teamAnswer) => (
								<TeamAnswerCard
									key={teamAnswer.answerId}
									teamAnswer={teamAnswer}
								/>
							))}
						</div>
					) : (
						<div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100">
							<p className="text-[#0070AD]">
								No answers available for this question.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
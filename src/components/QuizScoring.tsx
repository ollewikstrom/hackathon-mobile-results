import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TeamAnswerCard } from "./TeamAnswerCard";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Team, TeamAnswer, Question, Judgment } from "../types";

export function QuizScoring() {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [organizedData, setOrganizedData] = useState({
		questions: [] as Question[],
		teamAnswers: {} as Record<string, TeamAnswer[]>,
		totalQuestions: 0,
	});

	const { quizId } = useParams<{ quizId: string }>();

	// Fetch answers
	const answersQuery = useQuery({
		queryKey: ["answers", quizId],
		queryFn: async () => {
			const response = await fetch(
				`https://hack-genai.azurewebsites.net/api/answers/getAll/${quizId}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch answers");
			}

			return response.json();
		},
		enabled: !!quizId,
	});

	// Fetch teams
	const teamsQuery = useQuery({
		queryKey: ["teams", quizId],
		queryFn: async () => {
			const response = await fetch(
				`https://hack-genai.azurewebsites.net/api/teams/getByQuiz/${quizId}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch teams");
			}

			return response.json();
		},
		enabled: !!quizId,
	});

	// Fetch judgments
	const judgmentsQuery = useQuery({
		queryKey: ["judgments", quizId],
		queryFn: async () => {
			const response = await fetch(
				`https://hack-genai.azurewebsites.net/api/judgements/getAll/${quizId}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch judgments");
			}

			return response.json();
		},
		enabled: !!quizId,
	});

	useEffect(() => {
		// Wait until all data is loaded
		if (
			answersQuery.data?.answers &&
			teamsQuery.data &&
			judgmentsQuery.data
		) {
			// Create a team name lookup map
			const teamMap = new Map<string, Team>();
			teamsQuery.data.forEach((team: Team) => {
				teamMap.set(team.id, team);
			});

			// Create a judgment lookup map (by questionId and teamId)
			const judgmentMap = new Map<string, Judgment>();
			judgmentsQuery.data.forEach((judgment: Judgment) => {
				const key = `${judgment.questionId}_${judgment.teamId}`;
				judgmentMap.set(key, judgment);
			});

			// Organize data by question
			const questions: Question[] = [];
			const teamAnswers: Record<string, TeamAnswer[]> = {};
			const questionMap = new Map<
				string,
				{ id: string; content: string; index: number }
			>();

			// First, collect all unique questions and organize by question ID
			answersQuery.data.answers.forEach((answer: any) => {
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

				// Organize team answers by question ID
				if (!teamAnswers[answer.questionId]) {
					teamAnswers[answer.questionId] = [];
				}

				// Get judgment for this answer if it exists
				const judgmentKey = `${answer.questionId}_${answer.teamId}`;
				const judgment = judgmentMap.get(judgmentKey);

				// Get team data
				const team = teamMap.get(answer.teamId);

				// Convert to format expected by TeamAnswerCard
				teamAnswers[answer.questionId].push({
					teamId: answer.teamId,
					teamName: team ? team.name : `Unknown Team`,
					teamColor: team ? team.color : "bg-gray-500",
					answerId: answer.id,
					answer: answer.content,
					score: judgment ? judgment.score : 0,
					motivation: judgment
						? judgment.content
						: "No judgment provided yet.",
				});
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

	// Get the current question and its answers
	const currentQuestion = organizedData.questions[currentQuestionIndex];
	const currentAnswers = currentQuestion
		? organizedData.teamAnswers[currentQuestion.id] || []
		: [];

	// Check if any queries are loading
	const isLoading =
		answersQuery.isLoading ||
		teamsQuery.isLoading ||
		judgmentsQuery.isLoading;

	// Check if any queries have errors
	const hasError =
		answersQuery.isError || teamsQuery.isError || judgmentsQuery.isError;
	const errorMessage =
		answersQuery.error?.message ||
		teamsQuery.error?.message ||
		judgmentsQuery.error?.message;

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-xl font-semibold">
					Loading quiz data...
				</div>
			</div>
		);
	}

	if (hasError) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-xl font-semibold text-red-600">
					Error loading quiz data: {errorMessage || "Unknown error"}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-6xl mx-auto">
				{/* Navigation and question counter */}
				<div className="flex justify-between items-center mb-8">
					<button
						onClick={goToPreviousQuestion}
						disabled={currentQuestionIndex === 0}
						className={`flex items-center p-2 ${
							currentQuestionIndex === 0
								? "text-gray-400"
								: "text-blue-600 hover:text-blue-800"
						}`}
					>
						<ChevronLeft className="w-5 h-5 mr-1" />
						Previous
					</button>

					<div className="text-lg font-medium">
						Question {currentQuestionIndex + 1} of{" "}
						{organizedData.totalQuestions}
					</div>

					<button
						onClick={goToNextQuestion}
						disabled={
							currentQuestionIndex ===
							organizedData.totalQuestions - 1
						}
						className={`flex items-center p-2 ${
							currentQuestionIndex ===
							organizedData.totalQuestions - 1
								? "text-gray-400"
								: "text-blue-600 hover:text-blue-800"
						}`}
					>
						Next
						<ChevronRight className="w-5 h-5 ml-1" />
					</button>
				</div>

				{/* Question content */}
				{currentQuestion && (
					<div className="bg-white rounded-lg shadow-md p-6 mb-8">
						<h2 className="text-xl font-semibold mb-2">
							Question:
						</h2>
						<p className="text-lg">{currentQuestion.content}</p>
					</div>
				)}

				{/* Team answers */}
				<div className="space-y-6">
					<h2 className="text-xl font-semibold mb-4">
						Team Answers:
					</h2>
					{currentAnswers.length > 0 ? (
						currentAnswers.map((teamAnswer) => (
							<TeamAnswerCard
								key={teamAnswer.answerId}
								teamAnswer={teamAnswer}
							/>
						))
					) : (
						<div className="bg-white rounded-lg shadow-md p-6">
							<p className="text-gray-500">
								No answers available for this question.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

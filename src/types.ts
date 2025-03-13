// types.ts
export interface Question {
	id: string;
	content: string;
}

export interface Team {
	id: string;
	quizId: string;
	name: string;
	score: number;
	prompt: string;
	color: string;
}

export interface Judgment {
	id: string;
	teamId: string;
	content: string;
	questionId: string;
	score: number;
	quizId: string;
}

export interface TeamAnswer {
	teamId: string;
	teamName: string;
	teamColor?: string;
	answerId: string;
	answer: string;
	score: number;
	motivation: string;
}

export interface OrganizedQuizData {
	questions: Question[];
	teamAnswers: Record<string, TeamAnswer[]>;
	totalQuestions: number;
}

export interface Quiz {
	id: string;
	name: string;
	questions: Question[];
}

export interface RawAnswer {
	id: string;
	teamId: string;
	questionId: string;
	questionContent: string;
	quizId: string;
	content: string;
}

export interface ApiResponse {
	answers: RawAnswer[];
}

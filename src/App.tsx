import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuizList } from "./components/QuizList";
import { QuizScoring } from "./components/QuizScoring";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Routes>
					<Route path="/:quizId" element={<QuizList />} />
					<Route path="/:quizId/answers" element={<QuizScoring />} />
				</Routes>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

export default App;

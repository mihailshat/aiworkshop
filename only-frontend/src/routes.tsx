import { createBrowserRouter } from "react-router-dom"
import App from "./App"
import LoginPage from "./pages/Auth/LoginPage"
import RegisterPage from "./pages/Auth/RegisterPage"
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage"
import Profile from "./pages/Profile/Profile"
import ProtectedRoute from "./components/Auth/ProtectedRoute"
import ChatGPT from "./pages/Articles/ChatGPT/ChatGPT";
import DeeplArticle from "./pages/Articles/Deepl/DeeplArticle";
import GigaChat from "./pages/Articles/GigaChat/GigaChat";
import PaletteArticle from "./pages/Articles/Palette/PaletteArticle";
import Perceptron from "./pages/Articles/Perceptron/Perceptron";
import YandexGPT from "./pages/Articles/YandexGPT/YandexGPT";
import FeedPage from "./pages/FeedPage/FeedPage";
import MainPage from "./pages/MainPage/MainPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <MainPage />,
    },
    {
                path: "login",
                element: <LoginPage />,
    },
    {
                path: "register",
                element: <RegisterPage />,
            },
            {
                path: "forgot-password",
                element: <ForgotPasswordPage />,
    },
    {
                path: "reset-password",
                element: <ResetPasswordPage />,
            },
    {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                ),
    },
    {
                path: "feed",
                element: <FeedPage />,
            },
            {
                path: "chatgpt",
                element: <ChatGPT />,
    },
    {
                path: "deepl",
                element: <DeeplArticle />,
    },
    {
                path: "palette",
                element: <PaletteArticle />,
    },
    {
                path: "yandex-gpt",
                element: <YandexGPT />,
    },
    {
                path: "perceptron",
                element: <Perceptron />,
    },
    {
                path: "gigachat",
                element: <GigaChat />,
            },
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
])
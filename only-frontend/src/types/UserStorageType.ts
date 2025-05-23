export interface User {
    id: number;
    email: string;
    username: string;
    avatar?: string;
}

export interface UserStorageType {
    checkAuth: () => Promise<boolean>;
    getUser: () => User | null;
    login: (email: string, password: string) => Promise<User>;
    register: (email: string, username: string, password: string) => Promise<User>;
    logout: () => void;
    updateAvatar: (formData: FormData) => Promise<{ avatar: string }>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    getFavoriteArticles: () => Promise<Article[]>;
    addToFavorites: (articleId: number) => Promise<void>;
    removeFromFavorites: (articleId: number) => Promise<void>;
    isArticleFavorite: (articleId: number) => Promise<boolean>;
}

export interface Article {
    id: number;
    title: string;
    description: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: string;
    tags: string[];
} 
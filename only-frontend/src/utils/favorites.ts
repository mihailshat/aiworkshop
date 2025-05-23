// Класс для работы с избранными статьями через localStorage
export class FavoritesLocalStorage {
    private userId: number | null;
    private storageKey: string;

    constructor(userId: number | null) {
        this.userId = userId;
        this.storageKey = userId ? `favorites_${userId}` : 'favorites_guest';
    }

    // Получить все избранные статьи из localStorage
    getFavorites(): number[] {
        try {
            const favorites = localStorage.getItem(this.storageKey);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Ошибка при получении избранных статей из localStorage:', error);
            return [];
        }
    }

    // Проверить, находится ли статья в избранном
    isFavorite(articleId: number): boolean {
        const favorites = this.getFavorites();
        return favorites.includes(articleId);
    }

    // Добавить статью в избранное
    addToFavorites(articleId: number): void {
        try {
            const favorites = this.getFavorites();
            if (!favorites.includes(articleId)) {
                favorites.push(articleId);
                localStorage.setItem(this.storageKey, JSON.stringify(favorites));
            }
        } catch (error) {
            console.error(`Ошибка при добавлении статьи #${articleId} в избранное (localStorage):`, error);
        }
    }

    // Удалить статью из избранного
    removeFromFavorites(articleId: number): void {
        try {
            const favorites = this.getFavorites();
            const newFavorites = favorites.filter((id: number) => id !== articleId);
            localStorage.setItem(this.storageKey, JSON.stringify(newFavorites));
        } catch (error) {
            console.error(`Ошибка при удалении статьи #${articleId} из избранного (localStorage):`, error);
        }
    }

    // Переключить статус избранного (добавить если нет, удалить если есть)
    toggleFavorite(articleId: number): boolean {
        const isFav = this.isFavorite(articleId);
        if (isFav) {
            this.removeFromFavorites(articleId);
            return false;
        } else {
            this.addToFavorites(articleId);
            return true;
        }
    }
}

// Создать экземпляр по умолчанию
export const createFavoritesStore = (userId: number | null) => {
    return new FavoritesLocalStorage(userId);
};

export default { FavoritesLocalStorage, createFavoritesStore }; 
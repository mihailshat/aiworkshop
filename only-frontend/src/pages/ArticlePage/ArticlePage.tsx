import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import classes from './ArticlePage.module.scss';
import { favoritesApi } from '../../utils/api';

interface Comment {
    id: number;
    text: string;
    author: {
        username: string;
        avatar?: string;
    };
    created_at: string;
}

interface Article {
    id: number;
    title: string;
    content: string;
    author: {
        username: string;
        avatar?: string;
    };
    created_at: string;
    is_favorite: boolean;
}

const ArticlePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [article, setArticle] = useState<Article | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await fetch(`/api/articles/${id}/`);
                if (!response.ok) throw new Error('Статья не найдена');
                const data = await response.json();
                setArticle(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Произошла ошибка');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/articles/${id}/comments/`);
                if (!response.ok) throw new Error('Не удалось загрузить комментарии');
                const data = await response.json();
                setComments(data);
            } catch (err) {
                console.error('Ошибка при загрузке комментариев:', err);
            }
        };

        fetchArticle();
        fetchComments();
    }, [id]);

    const handleFavoriteClick = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!article) return;

        try {
            if (article.is_favorite) {
                await favoritesApi.removeFromFavorites(parseInt(id as string));
            } else {
                await favoritesApi.addToFavorites(parseInt(id as string));
            }

            setArticle(prev => prev ? {
                ...prev,
                is_favorite: !prev.is_favorite
            } : null);

            try {
                if (user) {
                    const favorites = await favoritesApi.getFavorites();
                    const favoriteIds = favorites.map((fav: any) => fav.article.id);
                    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favoriteIds));
                }
            } catch (err) {
                console.error('Ошибка при обновлении localStorage:', err);
            }
        } catch (err) {
            console.error('Ошибка при обновлении избранного:', err);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!newComment.trim()) return;

        try {
            const response = await fetch(`/api/articles/${id}/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newComment }),
            });

            if (!response.ok) throw new Error('Не удалось добавить комментарий');

            const comment = await response.json();
            setComments(prev => [...prev, comment]);
            setNewComment('');
        } catch (err) {
            console.error('Ошибка при добавлении комментария:', err);
        }
    };

    if (isLoading) {
        return (
            <div className={classes.loadingContainer}>
                <div className={classes.loading}>Загрузка...</div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className={classes.errorContainer}>
                <div className={classes.error}>{error || 'Статья не найдена'}</div>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <article className={classes.article}>
                <div className={classes.articleHeader}>
                <h1 className={classes.title}>{article.title}</h1>
                    <button
                        className={`${classes.favoriteButton} ${article.is_favorite ? classes.favorited : ''}`}
                        onClick={handleFavoriteClick}
                        title={article.is_favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                        <i className={`fas fa-heart ${article.is_favorite ? 'fas' : 'far'}`}></i>
                    </button>
                </div>
                <div className={classes.articleMeta}>
                    <div className={classes.author}>
                        <img
                            src={article.author.avatar || '/img/default-avatar.png'}
                            alt={article.author.username}
                            className={classes.authorAvatar}
                        />
                        <span>{article.author.username}</span>
                    </div>
                    <time dateTime={article.created_at}>
                        {new Date(article.created_at).toLocaleDateString()}
                    </time>
                </div>
                <div className={classes.content}>{article.content}</div>
            </article>

            <section className={classes.commentsSection}>
                <h2>Комментарии</h2>
                {isAuthenticated ? (
                    <form className={classes.commentForm} onSubmit={handleCommentSubmit}>
                        <textarea
                            className={classes.commentInput}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Написать комментарий..."
                            rows={3}
                        />
                        <button type="submit" className={classes.submitComment}>
                            Отправить
                        </button>
                    </form>
                ) : (
                    <div className={classes.loginPrompt}>
                        <p>Чтобы оставить комментарий, пожалуйста, <button onClick={() => navigate('/login')}>войдите</button></p>
                    </div>
                )}

                <div className={classes.commentsList}>
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className={classes.comment}>
                                <div className={classes.commentHeader}>
                                    <div className={classes.commentAuthor}>
                                        <img
                                            src={comment.author.avatar || '/img/default-avatar.png'}
                                            alt={comment.author.username}
                                            className={classes.commentAvatar}
                                        />
                                        <span>{comment.author.username}</span>
                                    </div>
                                    <time dateTime={comment.created_at}>
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </time>
                                </div>
                                <p className={classes.commentText}>{comment.text}</p>
                            </div>
                        ))
                    ) : (
                        <div className={classes.noComments}>
                            Пока нет комментариев. Будьте первым!
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ArticlePage; 
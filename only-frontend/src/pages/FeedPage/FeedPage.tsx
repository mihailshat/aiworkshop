import { useContext, useState, useEffect } from "react"
import { Context } from "../../App"
import { ArticleStorageType } from "../../types/ArticleStorageType"
import { Link } from "react-router-dom"
import OnTrendArticlesItem from "../../components/OnTrendArticleItem/OnTrendArticleItem"
import classes from './FeedPage.module.scss'
import useScrollToTop from "../../hooks/useScrollToTop"

const articleRoutes: { [key: number]: string } = {
    1: '/deepl',
    2: '/palette',
    3: '/yandex-gpt',
    4: '/perceptron',
    5: '/chatgpt',
    6: '/gigachat'
};

const FeedPage = () => {
    const { articleStorage } = useContext(Context) as ArticleStorageType;
    const [articles, setArticles] = useState(articleStorage.getArticles());
    const [isLoading, setIsLoading] = useState(true);
    useScrollToTop();

    useEffect(() => {
        // Имитация загрузки данных
        const timer = setTimeout(() => {
            setArticles(articleStorage.getArticles());
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [articleStorage]);

    if (isLoading) {
        return (
            <div className={classes.loadingContainer}>
                <p>Загрузка статей...</p>
            </div>
        );
    }

    if (articles.length === 0) {
        return (
            <div className={classes.emptyContainer}>
                <p>Статьи не найдены</p>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            {articles.map(article => (
                <Link 
                    to={articleRoutes[article.id] || '/'} 
                    key={article.id}
                    className={classes.articleLink}
                >
                    <OnTrendArticlesItem 
                        article={article}
                        className={classes.articleCard}
                    />
                    </Link>
            ))}
        </div>
    );
};

export default FeedPage;
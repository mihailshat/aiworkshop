import { useCallback, useContext, useMemo, useState } from "react";
import { Context } from "../../App";
import { ArticleType } from "../../types/ArticleType";
import classes from "./SearchBar.module.scss";
import SearchButton from "../SearchButton/SearchButton";
import SearchBarArticle from "../SearchBarArticle/SearchBarArticle";
import { useNavigate } from "react-router-dom";
import { ArticleStorageType } from "../../types/ArticleStorageType";
import { SearchBarProps } from "../../types/props/SearchBarProps";

const SearchBar = ({ active, setActive }: SearchBarProps): JSX.Element => {
    const [value, setValue] = useState("");
    const { articleStorage } = useContext(Context) as ArticleStorageType;
    const navigate = useNavigate();
    const articles = useMemo(() => articleStorage.getArticles(), [articleStorage])
    const className = `${classes.modal} ${active ? classes.active : ''}`
    const activate = (): void => setActive(true)
    const deactivate = (): void => setActive(false)
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => setValue(e.target.value), [])
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => e.preventDefault()
    const stopPropagation = useCallback((e: React.MouseEvent): void => e.stopPropagation(), [])

    const getArticlePath = (id: number) => {
        switch(id) {
            case 1: return '/deepl';
            case 2: return '/palette';
            case 3: return '/yandex-gpt';
            case 4: return '/perceptron';
            case 5: return '/chatgpt';
            case 6: return '/gigachat';
            default: return '/';
        }
    }

    const filteredArticles = useMemo(() => 
        articles.filter(article => 
            article.title.toLowerCase().includes(value.toLowerCase())
        ), [articles, value]
    )

    const handleArticleClick = (article: ArticleType) => {
        const path = getArticlePath(article.id);
        navigate(path);
        setActive(false);
    };

    return (
        <div
            className={className}
            onClick={deactivate}
        >
            <div
                className={classes.searchArea}
                onClick={activate}
                onMouseEnter={activate}
                onMouseLeave={deactivate}
            >
                <div
                    className={classes.searchBar}
                    onClick={stopPropagation}
                    onMouseEnter={activate}
                >
                    <form className={classes.searchForm} onSubmit={onSubmit}>
                        <input
                            onChange={handleInputChange}
                            type="text"
                            placeholder="Найти статью..."
                        />
                        <SearchButton />
                    </form>
                </div>
                <div
                    className={classes.foundArticles}
                    onMouseEnter={activate}
                >
                    {filteredArticles.map((article: ArticleType) => (
                        <div
                            key={article.id}
                            onClick={() => handleArticleClick(article)}
                            style={{ cursor: 'pointer' }}
                        >
                            <SearchBarArticle article={article} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SearchBar
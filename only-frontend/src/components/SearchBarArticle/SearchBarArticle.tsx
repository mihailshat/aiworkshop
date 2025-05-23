import { SearchBarArticleProps } from "../../types/props/SearchBarArticleProps"
import classes from './SearchBarArticle.module.scss'

const SearchBarArticle = ({article}: SearchBarArticleProps): JSX.Element => {
    return (
        <div className={classes.articleItem}>
            <figure>
                <img src={article.mainImage} alt='article' />
            </figure>
            <div className={classes.contentArea}>
                <p>{article.title}</p>
                <div className={classes.textArea}>
                </div>
            </div>
        </div>
    )
}

export default SearchBarArticle
import { FC } from 'react'
import { Link } from 'react-router-dom'
import FavoriteButton from '../FavoriteButton/FavoriteButton'
import './Article.scss'

interface ArticleProps {
    id: number
    title: string
    description: string
    image: string
    author: string
    date: string
    readTime: string
}

const Article: FC<ArticleProps> = ({ id, title, description, image, author, date, readTime }) => {
    return (
        <div className="article">
            <Link to={`/article/${id}`} className="articleLink">
                <div className="imageContainer">
                    <img src={image} alt={title} />
                </div>
                <div className="content">
                    <div className="authorInfo">
                        <img className="avatar" src="/avatar.jpg" alt="#" />
                        <div className="textInfo">
                            <p>{author}</p>
                            <p className="meta">
                                <span>{date}</span>
                                <span className="separator">•</span>
                                <span>{readTime}</span>
                            </p>
                        </div>
                    </div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            </Link>
            <FavoriteButton articleId={id} />
        </div>
    )
}

export default Article 
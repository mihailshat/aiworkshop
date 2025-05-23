import { useState } from 'react';
import { OnTrendArticleItemProps } from '../../types/props/OnTrendArticleItemProps'
import Tag from '../Tag/Tag'
import classes from './OnTrendArticleItem.module.scss'
import FavoriteButton from '../FavoriteButton/FavoriteButton'

const OnTrendArticlesItem = ({ className, article }: OnTrendArticleItemProps): JSX.Element => {
    const [imageError, setImageError] = useState(false);

    return (
        <div className={`${classes.onTrendArticlesItem} ${className}`}>
            <figure className={classes.itemImg}>
                {imageError ? (
                    <div className={classes.imageError}>
                        <p>Изображение не найдено</p>
                    </div>
                ) : (
                    <img 
                        src={article.mainImage} 
                        alt={article.title} 
                        onError={() => setImageError(true)}
                    />
                )}
            </figure>
            <div className={classes.contentArea}>
                <p>{article.title}</p>
                <div className={classes.tagArea}>
                    {article.tags?.map((tag, index) => (
                        <Tag key={index} name={tag} />
                    )) || (
                        <>
                            <Tag name='Нейросеть' />
                            <Tag name='Guide' />
                        </>
                    )}
                </div>
            </div>
            <div className={classes.infoArea}>
                <div><p>{article.category || 'Советы'}</p></div>
            </div>
            <FavoriteButton articleId={article.id} />
        </div>
    )
}

export default OnTrendArticlesItem
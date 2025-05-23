import { useEffect, useState } from 'react';
import classes from './ArticleImage.module.scss'

const ArticleImage = ({ articleId, imageNumber }: { articleId: number, imageNumber: number }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const getImageUrl = async (articleId: number, imageNumber: number) => {
            try {
                const extensions = ['png', 'jpg', 'jpeg', 'webp'];
                for (const ext of extensions) {
                    const url = `/img/article${articleId}/image${imageNumber}.${ext}`;
                    const exists = await checkImageExists(url);
                    if (exists) {
                        setImageUrl(url);
                        setError(false);
                        return;
                    }
                }
                // Если ни одно изображение не найдено
                setError(true);
            } catch (err) {
                console.error('Error loading image:', err);
                setError(true);
            }
        };

        getImageUrl(articleId, imageNumber);
    }, [articleId, imageNumber]);

    const checkImageExists = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };

    if (error) {
        return (
            <div className={classes.errorContainer}>
                <p>Изображение не найдено</p>
            </div>
        );
    }

    if (!imageUrl) {
        return (
            <div className={classes.loadingContainer}>
                <p>Загрузка изображения...</p>
            </div>
        );
    }

    return (
        <div className={classes.imageContainer}>
            <img
                src={imageUrl}
                alt={`Article ${articleId} - Image ${imageNumber}`}
                className={classes.image}
                onError={() => setError(true)}
            />
        </div>
    );
};

export default ArticleImage;
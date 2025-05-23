import { makeAutoObservable } from "mobx";
import { ArticleType } from "../types/ArticleType";

export class ArticleStorage {
    private articles: Array<ArticleType> = [
        {
            id: 1,
            title: 'Инструкция по использованию DeepL',
            mainImage: '/img/article1/image0.png'
        },
        {
            id: 2,
            title: 'Нейросеть по окрашиванию изображений Palette',
            mainImage: '/img/article2/image0.png'
        },
        {
            id: 3,
            title: 'Как пользоваться Yandex GPT 2?',
            mainImage: '/img/article3/image0.png'
        },
        {
            id: 4,
            title: 'Обучение многослойного перцептрона на примере XOR',
            mainImage: '/img/article4/image0.png'
        },
        {
            id: 5,
            title: 'Как настроить ChatGPT?',
            mainImage: '/img/article5/image0.png'
        },
        {
            id: 6,
            title: 'Как настроить GigaChat?',
            mainImage: '/img/article6/image0.png'
        }
    ];

    public constructor() {
        makeAutoObservable(this);
    }

    public setArticles(articles: Array<ArticleType>): void {
        this.articles = articles;
    }

    public getArticles(): Array<ArticleType> {
        return this.articles;
    }

    public getNeuralNetworkArticles(): Array<ArticleType> {
        return this.articles
            .slice()
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
    }

    public getOnTrendArticles(): Array<ArticleType> {
        return this.articles
            .slice()
            .slice(0, 3);
    }

    public getLastArticles(): Array<ArticleType> {
        return this.articles
            .slice()
            .reverse()
            .slice(0, 3);
    }
}
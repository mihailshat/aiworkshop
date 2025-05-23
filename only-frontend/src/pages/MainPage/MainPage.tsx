import { Link } from 'react-router-dom'
import OnTrendArticlesItem from '../../components/OnTrendArticleItem/OnTrendArticleItem'
import classes from './MainPage.module.scss'
import { useContext } from 'react'
import { ArticleStorageType } from '../../types/ArticleStorageType'
import { Context } from '../../App'
import useScrollToTop from '../../hooks/useScrollToTop'
import { observer } from 'mobx-react-lite'

const MainPage = observer(() => {
  const context = useContext(Context) as ArticleStorageType
  const { articleStorage } = context
  
  const neuralNetworkArticles = articleStorage.getNeuralNetworkArticles()
  const onTrendArticles = articleStorage.getOnTrendArticles()
  const lastArticles = articleStorage.getLastArticles()
  
  useScrollToTop()

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

  return (
    <main className={classes.main}>
      <div className={classes.onTrend}>
        <h2>В тренде</h2>
        <div className={classes.onTrendArticlesContainer}>
          {onTrendArticles.map(article => (
            <Link 
              to={getArticlePath(article.id)} 
              key={article.id}
              className={classes.articleLink}
            >
              <OnTrendArticlesItem 
                className={classes.narrowVersion} 
                article={article} 
              />
            </Link>
          ))}
        </div>
      </div>

      <div className={classes.neuralNetworks}>
        <h2>Нейросети</h2>
        <div className={classes.onWideTrendArticlesContainer}>
          {neuralNetworkArticles.map(article => (
            <Link 
              to={getArticlePath(article.id)} 
              key={article.id}
              className={classes.articleLink}
            >
              <OnTrendArticlesItem 
                className={classes.wideVersion} 
                article={article} 
              />
            </Link>
          ))}
        </div>
      </div>

      <div className={classes.recentArticles}>
        <h2>Последние статьи</h2>
        <div className={classes.onHorizontalTrendArticlesContainer}>
          {lastArticles.map(article => (
            <Link 
              to={getArticlePath(article.id)} 
              key={article.id}
              className={classes.articleLink}
            >
              <OnTrendArticlesItem 
                className={classes.horizontalVersion} 
                article={article} 
              />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
})

export default MainPage
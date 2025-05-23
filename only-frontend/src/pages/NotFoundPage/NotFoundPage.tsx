import styles from './NotFoundPage.module.scss'

const NotFoundPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.notFound}>404</h1>
      <p className={styles.text}>Page not found</p>
    </div>
  )
}

export default NotFoundPage
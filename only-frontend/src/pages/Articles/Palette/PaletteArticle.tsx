import ArticleImage from "../../../components/ArticleImage/ArticleImage"
import classes from '../../../components/ArticleImage/ArticleImage.module.scss'
import useScrollToTop from "../../../hooks/useScrollToTop"

const PaletteArticle = () => {
    useScrollToTop()

    return (
        <div className='articleContainer'>
            <img src='/img/article2/image0.png' alt="#" />

            <div className='articleBody'>

                <div className='authorInfo'>
                    <img className='avatar' src='/avatar.jpg' alt="#" />

                    <div className='textInfo'>
                        <p>Алексей Цой</p>
                        <p className='meta'>
                            <span>19 февраля</span>
                            <span className='separator'>•</span>
                            <span>3 мин. читать</span>
                        </p>
                    </div>
                </div>

                <div>
                    <h1>Нейросеть по окрашиванию изображений Palette</h1>
                    <p>Palette – это нейросеть, которая позволяет легко раскрашивать монохромные изображения. Нейросеть определяет, что изображено на фото, а потом предлагает несколько фильтров на ваш вкус, которые можно применить к фотографии. Бесплатно можно обрабатывать неограниченное количество изображений, но тогда их разрешение не будет превышать 500x500 пикселей. Скачать фото в более высоком разрешении можно по подписке.</p>
                    <p>Как начать пользоваться? <br /> Шаг 1. Перейдите на сайт нейросети по <a href="https://palette.fm">ссылке</a>.</p>
                    <ArticleImage articleId={2} imageNumber={1} />
                    <p>Шаг 2. Зарегистрируйтесь. Для этого нажмите на кнопку «Sign Up», расположенную в правой верхней части страницы.</p>
                    <ArticleImage articleId={2} imageNumber={2} />
                    <p>Шаг 3.  В открывшемся окошке в поле для ввода электронной почты введите свой адрес электронной почты, после чего нажмите на кнопку «Get a sign-in link by email».</p>
                    <ArticleImage articleId={2} imageNumber={3} />
                    <ArticleImage articleId={2} imageNumber={4} />
                    <p>Шаг 4. Откройте свою электронную почту. На нее вам должно было прийти письмо для подтверждения регистрации на сайте. Откройте это письмо и перейдите по ссылке в письме.</p>
                    <ArticleImage articleId={2} imageNumber={5} />
                    <p>Шаг 5. Вас перенаправят на главную страницу сайта, где вы уже будете авторизованы. Нажмите на кнопку «Start for Free»</p>
                    <ArticleImage articleId={2} imageNumber={6} />
                    <p>Шаг 6. Загрузка фотографий. Нажмите на кнопку «Upload new Image» и выберите на вашем компьютере фото, которое вы хотите раскрасить.</p>
                    <ArticleImage articleId={2} imageNumber={7} />
                    <p>
                        Шаг 7. После загрузки вашего фото начнется обработка фото. Занимает это около 30 секунд. По окончании обработки вы увидите свое окрашенное фото. <br />
                        Загружаемое в примере фото:
                    </p>
                    <img className={classes.image} src="/img/article2/image8.jpg" alt="cat" />

                    <ArticleImage articleId={2} imageNumber={9} />
                    <p>Результат:</p>
                    <ArticleImage articleId={2} imageNumber={10} />
                    <p>Вы также можете выбрать другой фильтр обработки фото. Они расположены сверху:</p>
                    <ArticleImage articleId={2} imageNumber={11} />
                    <p>Выбрав подходящий вам фильтр, вы можете загрузить фото нажав кнопку «DOWNLOAD»</p>
                    <ArticleImage articleId={2} imageNumber={12} />
                </div>
            </div>
        </div>
    )
}

export default PaletteArticle
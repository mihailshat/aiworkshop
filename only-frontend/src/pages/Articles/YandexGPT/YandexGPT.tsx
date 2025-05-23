import ArticleImage from "../../../components/ArticleImage/ArticleImage"
import useScrollToTop from "../../../hooks/useScrollToTop"

const YandexGPT = () => {
    useScrollToTop()

    return (
        <div className='articleContainer'>
            <img src='/img/article3/image0.png' alt="#" />

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
                    <h1>Как пользоваться Yandex GPT 2?</h1>
                    <p>YandexGPT 2 — это искусственная языковая модель, которая генерирует тексты. Например, она способна создавать электронные письма или статьи, объяснять трудные термины или концепции из учебников, формулировать новые идеи, давать рекомендации и помогать с разнообразными задачами.</p>
                    <p>Как начать пользоваться? <br />Шаг 1. Перейдите на сайт нейросети по <a href="https://ya.ru/ai/gpt-2">ссылке</a>.</p>
                    <ArticleImage articleId={3} imageNumber={1} />
                    <p>Шаг 2. Пролистайте страницу в самый низ.</p>
                    <ArticleImage articleId={3} imageNumber={2} />
                    <p>Шаг 3. Нажмите на кнопку «Попробовать YandexGPT 2».</p>
                    <ArticleImage articleId={3} imageNumber={3} />
                    <p>Шаг 4. Вас перенаправит на страницу поисковика Яндекс.</p>
                    <ArticleImage articleId={3} imageNumber={4} />
                    <p>Здесь нажмите на иконку Яндекс Алисы, расположенную в правом нижнем углу страницы браузера.</p>
                    <ArticleImage articleId={3} imageNumber={5} />
                    <p>Шаг 5. У вас может появиться всплывающее окно в левом верхнем углу экрана, запрашивающее использование вашего микрофона. Если вы будете создавать запросы используя голос, нажмите «разрешить», если нет – «блокировать».</p>
                    <ArticleImage articleId={3} imageNumber={6} />
                    <p>Шаг 6. В открывшемся всплывающем окне справа нажмите на кнопку   «YaGPT 2».</p>
                    <ArticleImage articleId={3} imageNumber={7} />
                    <p>Шаг 7. Вас перенаправит на страницу, где вы уже сможете создавать текстовые запросы.</p>
                    <ArticleImage articleId={3} imageNumber={8} />
                    <p>Шаг 8. Для ввода запроса сначала наведите курсор мыши на строку ввода, расположенную внизу страницы, и кликните.</p>
                    <ArticleImage articleId={3} imageNumber={9} />
                    <p>Шаг 9. Начинайте вводить свой запрос (например: «Создай список из 5 идей для блога о нейросетях»), затем нажмите клавишу «Enter».</p>
                    <ArticleImage articleId={3} imageNumber={10} />
                    <p>Шаг 10. В течение небольшого промежутка времени нейросеть даст ответ на ваш запрос.</p>
                    <ArticleImage articleId={3} imageNumber={11} />
                </div>
            </div>
        </div>
    )
}

export default YandexGPT
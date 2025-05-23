import ArticleImage from "../../../components/ArticleImage/ArticleImage"
import useScrollToTop from "../../../hooks/useScrollToTop"

const ChatGPT = () => {
    useScrollToTop()

    return (
        <div className="articleContainer">
            <img src='/img/article5/image0.png' alt="#" />

            <div className="articleBody">

                <div className='authorInfo'>
                    <img className='avatar' src='/avatar.jpg' alt="#" />

                    <div className='textInfo'>
                        <p>Алексей Цой</p>
                        <p className='meta'>
                            <span>23 марта</span>
                            <span className='separator'>•</span>
                            <span>3 мин. читать</span>
                        </p>
                    </div>
                </div>

                <div>
                    <p>
                        ChatGPT — чат-бот с искусственным интеллектом,
                        разработанный компанией OpenAI и способный работать в диалоговом режиме,
                        поддерживающий запросы на естественных языках. Система способна отвечать на
                        вопросы, генерировать тексты на разных языках,
                        включая русский, относящиеся к различным предметным областям.
                    </p>
                    <br />
                    <p>Как начать пользоваться ChatGPT?</p>
                    <br />
                    <p>Шаг 1. Перейдите на сайт <a target="_blank" href="https://chat.openai.com">chat.openai.com.</a></p>
                    <ArticleImage articleId={5} imageNumber={1} />
                    <p>Шаг 2. Необходимо зарегистрироваться на сайте. Для этого нажмите на кнопку “Sign up”</p>
                    <ArticleImage articleId={5} imageNumber={2} />
                    <p>Шаг 3. Далее в поле “Адрес электронной почты” введите свой адрес электронной почты и нажмите на кнопку “Продолжить”.</p>
                    <ArticleImage articleId={5} imageNumber={3} />
                    <p>Шаг 4. Придумайте пароль для вашей учетной записи. Введите его в поле “Пароль” и нажмите кнопку “Продолжить”.</p>
                    <ArticleImage articleId={5} imageNumber={4} />
                    <p>Шаг 5. На экране выведется сообщение о том, что вам нужно подтвердить свой адрес электронной почты. Для этого зайдите на почту через любое устройство, откройте письмо, которое вам пришло, в нем будет находиться ссылка, перейдя по которой вы подтвердите свою почту.</p>
                    <ArticleImage articleId={5} imageNumber={5} />
                    <p>Шаг 6. Для того чтобы написать запрос кликните левой кнопкой мыши по полю вводы в нижней части страницы сайта</p>
                    <ArticleImage articleId={5} imageNumber={6} />
                    <p>Шаг 7. Введите свой запрос (Например: “Назови 5 преимуществ использования нейросетей”), после чего нажмите на клавишу “Enter”. После этого ИИ начнет работу и по прошествии короткого промежутка времени вы получите ответ на ваш запрос.</p>
                    <ArticleImage articleId={5} imageNumber={7} />
                </div>
            </div>
        </div>
    )
}

export default ChatGPT
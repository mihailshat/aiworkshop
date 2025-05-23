import ArticleImage from "../../../components/ArticleImage/ArticleImage"
import useScrollToTop from "../../../hooks/useScrollToTop"

const GigaChat = () => {
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
                    <h1>GigaChat — нейросеть для общения</h1>
                    <p>GigaChat — это нейросеть, которая может общаться с пользователями на естественном языке. Она может отвечать на вопросы, помогать с задачами и даже поддерживать разговор на различные темы.</p>
                    <p>Как начать пользоваться GigaChat?</p>
                    <p>Шаг 1. Перейдите на сайт <a href="https://developers.sber.ru/portal/products/gigachat">GigaChat</a></p>
                    <ArticleImage articleId={3} imageNumber={1} />
                    <p>Шаг 2. Нажмите на кнопку "Начать использовать"</p>
                    <ArticleImage articleId={3} imageNumber={2} />
                    <p>Шаг 3. Введите свой адрес электронной почты и придумайте пароль для вашей учетной записи. После этого нажмите на кнопку "Зарегистрироваться".</p>
                    <ArticleImage articleId={3} imageNumber={3} />
                    <p>Шаг 4. На экране выведется сообщение о том, что вам нужно подтвердить свой адрес электронной почты. Для этого зайдите на почту через любое устройство, откройте письмо, которое вам пришло, в нем будет находиться ссылка, перейдя по которой вы подтвердите свою почту.</p>
                    <ArticleImage articleId={3} imageNumber={4} />
                    <p>Шаг 5. После подтверждения почты вы сможете войти в свой аккаунт, используя свой адрес электронной почты и пароль.</p>
                    <ArticleImage articleId={3} imageNumber={5} />
                    <p>Шаг 6. Для того чтобы начать общение с нейросетью, введите свой вопрос или сообщение в поле ввода в нижней части страницы.</p>
                    <ArticleImage articleId={3} imageNumber={6} />
                    <p>Шаг 7. Нажмите на кнопку "Отправить" или клавишу Enter. После этого нейросеть начнет работу и по прошествии короткого промежутка времени вы получите ответ на ваш вопрос.</p>
                    <ArticleImage articleId={3} imageNumber={7} />
                </div>  
            </div>
        </div>
    )
}

export default GigaChat
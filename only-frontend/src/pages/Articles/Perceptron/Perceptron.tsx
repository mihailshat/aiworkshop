import ArticleImage from "../../../components/ArticleImage/ArticleImage"
import CodeBlock from "../../../components/CodeBlock/CodeBlock";
import useScrollToTop from "../../../hooks/useScrollToTop";

const Perceptron = () => {
    useScrollToTop()

    return (
        <div className='articleContainer'>
            <img src='/img/article4/image0.png' alt="#" />

            <div className='articleBody'>

                <div className='authorInfo'>
                    <img className='avatar' src='/avatar.jpg' alt="#" />

                    <div className='textInfo'>
                        <p>Алексей Цой</p>
                        <p className='meta'>
                            <span>19 февраля</span>
                            <span className='separator'>•</span>
                            <span>10 мин. читать</span>
                        </p>
                    </div>
                </div>

                <div>
                    <h1>Обучение многослойного перцептрона на примере XOR</h1>
                    <p><a href="https://ru.wikipedia.org/wiki/Перцептрон">Перцептрон</a> — это простейший тип нейросети, способный решать линейно разделимые задачи. Однако операция XOR является нелинейной, и <b>однослойный перцептрон не может её решить.</b></p>
                    <ArticleImage articleId={4} imageNumber={1} />
                    <p>Для этого нам нужен многослойный перцептрон. В этой статье покажем, как работает обучение перцептрона на примере логической операции XOR и сделаем этот процесс нагляднее с помощью мемов.</p>
                    <ArticleImage articleId={4} imageNumber={2} />
                    <h2>Теория</h2>
                    <p>Перцептрон — это модель нейрона, которая принимает входные данные, умножает их на веса, суммирует и передает через активационную функцию. В случае однослойного перцептрона для решения задач, таких как <a href="https://ru.wikipedia.org/wiki/Конъюнкция">AND</a> или <a href="https://ru.wikipedia.org/wiki/Дизъюнкция">OR</a>, всё работает, но для <a href="https://ru.wikipedia.org/wiki/Исключающее_«или»">XOR</a> требуется усложненная структура — <b>многослойный перцептрон.</b></p>
                    <p>В MLP (от англ. multilayer perceptron – многослойный перцептрон) используется несколько слоев нейронов, а обучение происходит методом обратного распространения ошибки.</p>
                    <ArticleImage articleId={4} imageNumber={3} />
                    <h2>Обучение на примере XOR</h2>
                    <p>Логическая операция XOR выглядит так:</p>
                    <table>
                        <tr>
                            <th>Вход 1</th>
                            <th>Вход 2</th>
                            <th>Выход</th>
                        </tr>
                        <tr>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>0</td>
                            <td>1</td>
                            <td>1</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>0</td>
                            <td>1</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>1</td>
                            <td>0</td>
                        </tr>
                    </table>
                    <p>Однослойный перцептрон не выполнит эту задачу, так как данные не являются линейно разделимыми. Поэтому для решения необходимо использовать минимум два слоя нейронов.</p>
                    <ArticleImage articleId={4} imageNumber={4} />
                    <p>Перцептрон должен научиться правильно предсказывать эти значения на основании входных данных.</p>
                    <ArticleImage articleId={4} imageNumber={5} />
                    <p>Приведем пример кода на Python с использованием библиотеки tensorflow, который демонстрирует обучение многослойного перцептрона для решения задачи XOR:</p>
                    <CodeBlock>
                        <div>
                            <span className="ͼ4">import </span>
                            tensorflow
                            <span className="ͼ4"> as </span>
                            <span className="ͼ5">tf</span>
                            <br />
                            <span className="ͼ4">import </span>
                            numpy
                            <span className="ͼ4"> as </span>
                            <span className="ͼ5">np</span>
                            <br />
                            <br />
                            <span className="ͼ8"># Данные для логической операции XOR</span>
                            <br />
                            <span className="ͼ5">X</span> = <span className="ͼ5">np</span>.array([[<span className="ͼ9">0</span>, <span className="ͼ9">0</span>], [<span className="ͼ9">0</span>, <span className="ͼ9">1</span>], [<span className="ͼ9">1</span>, <span className="ͼ9">0</span>], [<span className="ͼ9">1</span>, <span className="ͼ9">1</span>]]) <br />
                            <span className="ͼ5">y</span> = <span className="ͼ5">np</span>.array([[<span className="ͼ9">0</span>], [<span className="ͼ9">1</span>], [<span className="ͼ9">1</span>], [<span className="ͼ9">0</span>]]) <br />
                            <br />
                            <span className="ͼ8"># Создание модели многослойного перцептрона</span>
                            <br />
                            <span className="ͼ5">model</span> = <span className="ͼ5">tf</span>.keras.Sequential([ <br />
                            <span className="ͼ5">tf</span>.keras.layers.Dense(<span className="ͼ9">4</span>, input_dim=<span className="ͼ9">2</span>, activation=<span className="ͼ7">'sigmoid'</span>), <span className="ͼ8"># Скрытый слой с 4 нейронами</span><br />
                            <span className="ͼ5">tf</span>.keras.layers.Dense(<span className="ͼ9">1</span>, activation=<span className="ͼ7">'sigmoid'</span>)        <span className="ͼ8"># Выходной слой с 1 нейроном</span><br />
                            ])
                            <br />
                            <br />
                            <span className="ͼ8"># Компиляция модели</span>
                            <br />
                            <span className="ͼ5">model</span>.compile(optimizer=<span className="ͼ7">'adam'</span>, loss=<span className="ͼ7">'binary_crossentropy'</span>, metrics=[<span className="ͼ7">'accuracy'</span>]) <br />
                            <br />
                            <span className="ͼ8"># Обучение модели и сохранение истории</span><br />
                            <span className="ͼ5">history</span> = <span className="ͼ5">model</span>.fit(<span className="ͼ5">X</span>, <span className="ͼ5">y</span>, epochs=<span className="ͼ9">1000</span>, verbose=<span className="ͼ9">1</span>) <br />
                            <br />
                            <span className="ͼ8"># Тестирование модели на обучающих данных</span><br />
                            <span className="ͼ5">predictions</span> = <span className="ͼ5">model</span>.predict(<span className="ͼ5">X</span>) <br />
                            <span className="ͼ5">print</span>(<span className="ͼ7">"Результаты предсказаний:"</span>) <br />
                            <span className="ͼ5">print</span>(<span className="ͼ5">np</span>.round(<span className="ͼ5">predictions</span>)) <br />
                        </div>
                    </CodeBlock>
                    <ol>
                        <li><b>Данные:</b> Создаются входные данные X и целевые метки Y для логической операции XOR.</li>
                        <li><b>Модель:</b> Применяется многослойный перцептрон с одним скрытым слоем из 4 нейронов и одним выходным нейроном.</li>
                        <li><b>Активация:</b> Используется функция активации sigmoid для обоих слоев.</li>
                        <li><b>Обучение:</b> Используется оптимизатор adam и функция потерь binary_crossentropy. Модель обучается на 10,000 эпох для точных результатов.</li>
                        <li><b>Результат:</b> После обучения модель тестируется, и выводятся предсказанные значения.</li>
                    </ol>
                    <p>Во время обучения строится функция потерь, которая показывает уровень ошибок сети на каждом шаге (эпохе).</p>
                    <CodeBlock>
                        <div>
                            <span className="ͼ4">import </span> matplotlib.pyplot 
                            <span className="ͼ4"> as </span>
                            <span className="ͼ5">plt</span>
                            <br />
                            <br />
                            <span className="ͼ8"># Построение графика функции потерь</span> <br />
                            <span className="ͼ5">plt</span>.plot(<span className="ͼ5">history</span>.history[<span className="ͼ7">'loss'</span>]) <br />
                            <span className="ͼ5">plt</span>.title(<span className="ͼ7">'Функция потерь на каждом шаге обучения'</span>) <br />
                            <span className="ͼ5">plt</span>.xlabel(<span className="ͼ7">'Эпоха'</span>) <br />
                            <span className="ͼ5">plt</span>.ylabel(<span className="ͼ7">'Потери'</span>) <br />
                            <span className="ͼ5">plt</span>.show() 
                        </div>
                    </CodeBlock>
                    <ArticleImage articleId={4} imageNumber={6} />
                    <h2>Процесс обучения</h2>
                    <p>Процесс обучения многослойного перцептрона заключается в минимизации ошибки предсказания с использованием <a href="https://ru.wikipedia.org/wiki/Градиентный_спуск">градиентного спуска</a> и <a href="https://ru.wikipedia.org/wiki/Метод_обратного_распространения_ошибки">метода обратного распространения ошибки</a>. На каждом шаге сеть корректирует свои веса, чтобы приблизиться к правильному результату.</p>
                    <ArticleImage articleId={4} imageNumber={7} />
                    <p>Многослойный перцептрон является мощным инструментом для решения нелинейных задач, таких как операция XOR.</p>
                    <ArticleImage articleId={4} imageNumber={8} />
                    <h2>Выводы</h2>
                    <p>Теперь вы понимаете, почему обычный перцептрон не справляется с XOR, но многослойный перцептрон его легко побеждает. А мемы — это то, что делает обучение искусственным нейронным сетям не таким уж искусственным!</p>
                    <ArticleImage articleId={4} imageNumber={9} />
                </div>
            </div>
        </div>
    )
}

export default Perceptron
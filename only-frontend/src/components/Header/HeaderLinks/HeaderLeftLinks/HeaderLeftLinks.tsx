import NavLink from "../../../NavLink/NavLink"
import classes from "./HeaderLeftLinks.module.scss"

const HeaderLeftLinks = () => {
    return (
        <div className={classes.headerLinks}>
            <nav>
                <ul>
                    <li><NavLink src="/img/guide.png" to="/">Главная</NavLink></li>
                    <li><NavLink src="/img/feed.png" to="/feed">Лента</NavLink></li>
                    <li><NavLink isTg={true} src="/img/education.png" to="https://t.me/AI_officina">ТГ-канал</NavLink></li>
                </ul>
            </nav>
        </div>
    )
}

export default HeaderLeftLinks
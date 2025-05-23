import { ButtonHTMLAttributes } from "react"
import classes from "./SearchButton.module.scss"

const SearchButton = (props: ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element => {
    return (
        <button {...props} className={classes.button}>
            <img className={classes.image} src="/img/searchIcon.png" alt="searchIcon" />
        </button>
    )
}

export default SearchButton
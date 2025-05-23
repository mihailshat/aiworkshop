import { Link } from "react-router-dom"
import classes from "./NavLink.module.scss"
import { NavLinkProps } from "../../types/props/NavLinkProps"

const NavLink = ({ src, to, children, isTg = false }: NavLinkProps) => {
    return (
        <div className={classes.linkBlock}>
            <figure className={classes.figure}>
                <img alt="icon" src={src} className={classes.icon} />
            </figure>

            {
                isTg 
                ? 
                    <Link target="_blank" to={to}>{children}</Link> 
                : 
                    <Link to={to}>{children}</Link> 
            }

        </div>
    )
}

export default NavLink
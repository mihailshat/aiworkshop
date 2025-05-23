import classes from './Footer.module.scss'

const Footer = (): JSX.Element => {
    return (
        <footer className={classes.footer}>
            <div className={classes.logotype}>
                <figure className={classes.figure}>
                    <a href="/">
                        <img src="/img/logo.png" className={classes.image} alt="logotype" />
                    </a>
                </figure>
            </div>

            <p className={classes.year}>2025</p>
        </footer>
    )
}

export default Footer
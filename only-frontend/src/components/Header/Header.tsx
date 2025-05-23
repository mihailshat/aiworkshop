import { Link, useNavigate } from "react-router-dom"
import HeaderLeftLinks from "./HeaderLinks/HeaderLeftLinks/HeaderLeftLinks"
import { useState, useEffect, useRef } from "react"
import classes from "./Header.module.scss"
import SearchButton from "../SearchButton/SearchButton"
import SearchBar from "../SearchBar/SearchBar"
import { useAuth } from "../../contexts/AuthContext"

const Header = (): JSX.Element => {
    const [modalActive, setModalActive] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        window.addEventListener('resize', handleResize)
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            window.removeEventListener('resize', handleResize)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const onMouseEnter = (): void => setModalActive(true)
    const onClick = (): void => setModalActive(true)
    const toggleMenu = (): void => setIsMenuOpen(!isMenuOpen)

    const handleProfileClick = (e: React.MouseEvent) => {
        e.preventDefault();
        
        // Проверяем наличие токена в localStorage перед переходом
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
            // Если токена нет, перенаправляем на страницу входа
            navigate('/login');
            return;
        }
        
        navigate('/profile');
        setIsMenuOpen(false);
    }

    const handleNavigationClick = () => {
        setIsMenuOpen(false);
    }

    const handleAuthClick = () => {
        setIsMenuOpen(false);
    }

    return (
        <header className={classes.header}>
            <div className={classes.headerLeftPart}>
                <figure>
                    <Link to="/"><img src="/img/logo.png" className={classes.image} alt="logotype" /></Link>
                </figure>
                {!isMobile && <HeaderLeftLinks />}
            </div>

            <div className={classes.headerRightPart}>
                {isMobile ? <SearchButton onClick={onClick} /> : <SearchButton onMouseEnter={onMouseEnter} />}
                <SearchBar active={modalActive} setActive={setModalActive} />

                {isMobile && !isMenuOpen && (
                    <button className={classes.burgerMenu} onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                )}

                {!isMobile && (
                    isAuthenticated ? (
                        <div className={classes.authButtons}>
                            <Link to="/profile" className={classes.profileButton} onClick={handleProfileClick}>
                                <img 
                                    src={
                                        user?.avatar_data_url || // Приоритет отдаем data URL с base64
                                        user?.avatar_url || 
                                        user?.avatar || 
                                        "/img/profile.png"
                                    } 
                                    alt="Профиль" 
                                    className={classes.profileIcon} 
                                />
                            </Link>
                            <button onClick={() => logout()} className={classes.logoutButton}>
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <div className={classes.authButtons}>
                            <Link to="/login" className={classes.loginButton}>
                                Войти
                            </Link>
                            <Link to="/register" className={classes.registerButton}>
                                Регистрация
                            </Link>
                        </div>
                    )
                )}
            </div>

            {isMobile && (
                <div ref={menuRef} className={`${classes.mobileMenu} ${isMenuOpen ? classes.active : ''}`}>
                    <div className={classes.mobileMenuHeader}>
                        <h2>Меню</h2>
                        <button className={classes.closeButton} onClick={toggleMenu}>×</button>
                    </div>
                    <div onClick={handleNavigationClick}>
                        <HeaderLeftLinks />
                    </div>
                    {isAuthenticated ? (
                        <div className={classes.mobileAuthButtons}>
                            <Link to="/profile" className={classes.mobileProfileButton} onClick={handleProfileClick}>
                                <img 
                                    src={
                                        user?.avatar_data_url || // Приоритет отдаем data URL с base64
                                        user?.avatar_url || 
                                        user?.avatar || 
                                        "/img/profile.png"
                                    } 
                                    alt="Профиль" 
                                    className={classes.profileIcon} 
                                />
                                <span>Профиль</span>
                            </Link>
                            <button onClick={() => logout()} className={classes.mobileLogoutButton}>
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <div className={classes.mobileAuthButtons}>
                            <Link to="/login" className={classes.mobileLoginButton} onClick={handleAuthClick}>
                                Войти
                            </Link>
                            <Link to="/register" className={classes.mobileRegisterButton} onClick={handleAuthClick}>
                                Регистрация
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}

export default Header
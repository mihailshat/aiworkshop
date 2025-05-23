import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.scss';

export const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            setError('Неверный email или пароль');
        }
    };

    return (
        <div className={styles.authForm}>
            <h2>Вход в систему</h2>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Введите ваш email"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Введите ваш пароль"
                    />
                </div>
                <Link to="/forgot-password" className={styles.forgotPassword}>
                    Забыли пароль?
                </Link>
                <button type="submit" className={styles.submitButton}>
                    Войти
                </button>
            </form>
            <div className={styles.formFooter}>
                Нет аккаунта?{' '}
                <Link to="/register">Зарегистрироваться</Link>
            </div>
        </div>
    );
};

export default LoginForm; 
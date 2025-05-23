import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './PasswordResetForm.module.scss';

const PasswordResetForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { requestPasswordReset, resetPassword } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            if (token) {
                // Если есть токен, значит это форма сброса пароля
                if (password !== password2) {
                    setError('Пароли не совпадают');
                    return;
                }
                await resetPassword(token, password);
                setSuccess('Пароль успешно изменен');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                // Если нет токена, значит это форма запроса сброса пароля
                await requestPasswordReset(email);
                setSuccess('Инструкции по сбросу пароля отправлены на ваш email');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
        }
    };

    return (
        <div className={styles.container}>
            <h2>{token ? 'Сброс пароля' : 'Восстановление пароля'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                {!token ? (
                    <>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Новый пароль</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password2">Подтвердите пароль</label>
                            <input
                                type="password"
                                id="password2"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}
                <button type="submit" className={styles.submitButton}>
                    {token ? 'Сменить пароль' : 'Восстановить пароль'}
                </button>
            </form>
        </div>
    );
};

export default PasswordResetForm; 
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import classes from './AuthForms.module.scss';

const PasswordResetForm: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { requestPasswordReset, resetPassword, error, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (token) {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Пароли не совпадают');
                }
                await resetPassword(token, formData.password, formData.confirmPassword);
                setSuccess('Пароль успешно изменен');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                await requestPasswordReset(formData.email);
                setIsEmailSent(true);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (isEmailSent) {
        return (
            <div className={classes.form}>
                <div className={classes.success}>
                    Инструкции по сбросу пароля отправлены на ваш email.
                </div>
                <div className={classes.formFooter}>
                    <Link to="/login">Вернуться на страницу входа</Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className={classes.form}>
                <div className={classes.success}>
                    {success}
                </div>
                <div className={classes.formFooter}>
                    <Link to="/login">Вернуться на страницу входа</Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={classes.form}>
            {error && <div className={classes.error}>{error}</div>}
            
            {token ? (
                <>
                    <div className={classes.formGroup}>
                        <label htmlFor="password">Новый пароль</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Введите новый пароль"
                        />
                    </div>

                    <div className={classes.formGroup}>
                        <label htmlFor="confirmPassword">Подтвердите пароль</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Подтвердите новый пароль"
                        />
                    </div>
                </>
            ) : (
                <div className={classes.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Введите ваш email"
                    />
                </div>
            )}

            <button
                type="submit"
                className={classes.submitButton}
                disabled={isLoading}
            >
                {isLoading
                    ? token
                        ? 'Изменение пароля...'
                        : 'Отправка инструкций...'
                    : token
                        ? 'Изменить пароль'
                        : 'Отправить инструкции'}
            </button>

            <div className={classes.formFooter}>
                <Link to="/login">Вернуться на страницу входа</Link>
            </div>
        </form>
    );
};

export default PasswordResetForm; 
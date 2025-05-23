import React from 'react';
import styles from './Auth.module.scss';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
    return (
        <div className={styles.authLayout}>
            {title && <div className={styles.title}>{title}</div>}
            {children}
        </div>
    );
};

export default AuthLayout; 
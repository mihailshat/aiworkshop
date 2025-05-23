import React from 'react';
import styles from './Auth.module.scss';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className={styles.authLayout}>
            {children}
        </div>
    );
};

export default AuthLayout; 
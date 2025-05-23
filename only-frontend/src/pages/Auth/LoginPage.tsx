import React from 'react';
import AuthLayout from '../../components/Auth/AuthLayout';
import LoginForm from '../../components/Auth/LoginForm';

const LoginPage: React.FC = () => {
    return (
        <AuthLayout title="Sign in to your account">
            <LoginForm />
        </AuthLayout>
    );
};

export default LoginPage; 
import React from 'react';
import AuthLayout from '../../components/Auth/AuthLayout';
import RegisterForm from '../../components/Auth/RegisterForm';

const RegisterPage: React.FC = () => {
    return (
        <AuthLayout title="Create your account">
            <RegisterForm />
        </AuthLayout>
    );
};

export default RegisterPage; 
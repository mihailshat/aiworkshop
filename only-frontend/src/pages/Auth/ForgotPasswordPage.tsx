import React from 'react';
import AuthLayout from '../../components/Auth/AuthLayout';
import PasswordResetForm from '../../components/Auth/PasswordResetForm';

const ForgotPasswordPage: React.FC = () => {
    return (
        <AuthLayout>
            <PasswordResetForm />
        </AuthLayout>
    );
};

export default ForgotPasswordPage; 
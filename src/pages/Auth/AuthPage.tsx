import React from 'react'
import LoginForm from '../../components/AuthForms/LoginForm'
import RegisterForm from '../../components/AuthForms/RegisterForm'

const AuthPage: React.FC = () => {
	return (
		<div>
			<h1>Аутентификация</h1>
			<LoginForm />
			<RegisterForm />
		</div>
	)
}

export default AuthPage

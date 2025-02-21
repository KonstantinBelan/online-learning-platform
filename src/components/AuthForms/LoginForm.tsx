import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/features/userSlice'
import { API_BASE_URL } from '../../config'
import { useNavigate } from 'react-router-dom'
import decodeJwt from '../../utils/jwtUtils'

const LoginForm: React.FC = () => {
	const [loginEmail, setLoginEmail] = useState('')
	const [loginPassword, setLoginPassword] = useState('')
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		try {
			console.log('Logging in with:', {
				email: loginEmail,
				password: loginPassword,
			})

			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: loginEmail, password: loginPassword }),
			})

			const data = await response.json()

			console.log('Login response:', data)

			if (response.ok) {
				localStorage.setItem('token', data.token)
				console.log('Token saved:', localStorage.getItem('token'))

				const decodedToken = decodeJwt(data.token)

				console.log('Decoded token:', decodedToken)

				if (decodedToken && decodedToken.user) {
					const { id, role } = decodedToken.user

					const userData = {
						userId: id,
						username: data.username, // Now you have username here!
						email: loginEmail,
						role: role,
					}
					console.log('Dispatching login action', userData)
					dispatch(login(userData))
					navigate('/profile')
				} else {
					console.error('Could not decode token or user information not found')
					alert(
						'Не удалось декодировать токен или получить информацию о пользователе.'
					)
				}
			} else {
				alert(data.message)
			}
		} catch (error) {
			console.error('Error logging in:', error)
			alert('Произошла ошибка при входе в систему.')
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<h2>Вход</h2>
			<div>
				<label htmlFor='loginEmail'>Email:</label>
				<input
					type='email'
					id='loginEmail'
					value={loginEmail}
					onChange={e => setLoginEmail(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor='loginPassword'>Пароль:</label>
				<input
					type='password'
					id='loginPassword'
					value={loginPassword}
					onChange={e => setLoginPassword(e.target.value)}
					required
				/>
			</div>
			<button type='submit'>Войти</button>
		</form>
	)
}

export default LoginForm

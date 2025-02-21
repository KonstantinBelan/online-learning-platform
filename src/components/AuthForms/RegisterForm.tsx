import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/features/userSlice'
import { API_BASE_URL } from '../../config'
import { useNavigate } from 'react-router-dom'
import decodeJwt from '../../utils/jwtUtils' // Import decodeJwt

const RegisterForm: React.FC = () => {
	const [registerUsername, setRegisterUsername] = useState('')
	const [registerEmail, setRegisterEmail] = useState('')
	const [registerPassword, setRegisterPassword] = useState('')
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		try {
			console.log('Registering with:', {
				username: registerUsername,
				email: registerEmail,
				password: registerPassword,
			}) // Логирование

			const response = await fetch(`${API_BASE_URL}/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: registerUsername,
					email: registerEmail,
					password: registerPassword,
				}),
			})

			const data = await response.json()

			console.log('Register response:', data) // Логирование

			if (response.ok) {
				localStorage.setItem('token', data.token)

				// Decode the token to get user information
				const decodedToken = decodeJwt(data.token)

				if (decodedToken && decodedToken.user) {
					const { id, role } = decodedToken.user // Get role from decoded token

					dispatch(
						login({
							userId: id,
							username: registerUsername,
							email: registerEmail,
							role: role, // Pass the role to the login action
						})
					)
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
			console.error('Error registering:', error)
			alert('Произошла ошибка при регистрации.')
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<h2>Регистрация</h2>
			<div>
				<label htmlFor='registerUsername'>Имя пользователя:</label>
				<input
					type='text'
					id='registerUsername'
					value={registerUsername}
					onChange={e => setRegisterUsername(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor='registerEmail'>Email:</label>
				<input
					type='email'
					id='registerEmail'
					value={registerEmail}
					onChange={e => setRegisterEmail(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor='registerPassword'>Пароль:</label>
				<input
					type='password'
					id='registerPassword'
					value={registerPassword}
					onChange={e => setRegisterPassword(e.target.value)}
					required
				/>
			</div>
			<button type='submit'>Зарегистрироваться</button>
		</form>
	)
}

export default RegisterForm

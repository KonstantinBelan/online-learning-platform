// src/redux/userReducer.js
const initialState = {
	userId: null,
	username: null,
	email: null,
	role: null,
	// ... другие поля, которые ты хочешь хранить о пользователе
}

function userReducer(state = initialState, action) {
	switch (action.type) {
		case 'LOGIN_SUCCESS':
			console.log('LOGIN_SUCCESS payload:', action.payload) // Для отладки
			return {
				...state,
				userId: action.payload.userId,
				username: action.payload.username,
				email: action.payload.email,
				role: action.payload.role,
			}
		case 'LOGOUT': // Добавь обработку выхода из аккаунта
			return initialState // Возвращаем начальное состояние
		default:
			return state
	}
}

export default userReducer

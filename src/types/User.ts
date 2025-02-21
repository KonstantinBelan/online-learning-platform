export interface User {
	_id: string
	username: string
	email: string
	password?: string
	role: 'student' | 'admin'
	registrationDate?: string
	createdAt?: string
	updatedAt?: string
	__v?: number
}

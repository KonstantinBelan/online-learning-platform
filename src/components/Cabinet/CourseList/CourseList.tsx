import React, { useState, useEffect } from 'react'
import CourseCard from '../CourseCard/CourseCard' // Убедись, что путь правильный
import { API_BASE_URL } from '../../../config' // Путь к файлу конфигурации
import { Course } from '../../../types/Course' // Импортируем тип Course

const CourseList: React.FC = () => {
	const [courses, setCourses] = useState<Course[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/users/me/courses`, {
					// Используем API_BASE_URL
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`, // Если требуется авторизация
					},
				})
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}
				const data = await response.json() // Явно указываем тип данных
				setCourses(data)
			} catch (error) {
				console.error('Ошибка при получении списка курсов:', error)
				// Обработка ошибки (например, отображение сообщения об ошибке)
			} finally {
				setLoading(false)
			}
		}

		fetchCourses()
	}, [])

	if (loading) {
		return <p>Загрузка...</p>
	}

	if (courses.length === 0) {
		return <p>Вы еще не подписаны ни на один курс.</p>
	}

	return (
		<div>
			<h2>Мои курсы</h2>
			{courses.map(course => (
				<CourseCard key={course._id} course={course} />
			))}
		</div>
	)
}

export default CourseList

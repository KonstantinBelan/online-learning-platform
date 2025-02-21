import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux' // Если используете Redux для хранения информации о пользователе
import { RootState } from '../../redux/store' // Если используете Redux
import { API_BASE_URL } from '../../../config' // Если используете API_BASE_URL
import { Course } from '../../../types/Course' // Импортируем тип Course
import { User } from '../../../types/User'
import CourseList from '../CourseList/CourseList' // Убедись, что путь правильный
// import StudentDashboard from '../StudentDashboard/StudentDashboard'

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null) // Исправлен тип useState
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const User = await response.json() // Явно указываем тип данных
        setUser(User)
      } catch (error) {
        console.error('Ошибка при получении данных о пользователе:', error)
        // Обработка ошибки (например, отображение сообщения об ошибке)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return <p>Загрузка...</p>
  }

  if (!user) {
    return <p>Не удалось получить данные о пользователе.</p>
  }

  return (
    <div>
      <div className='profile'>
        <h2>Профиль</h2>
        <p>Имя: {user.username}</p>
        <p>Email: {user.email}</p>
        {/* Другая информация о пользователе */}
      </div>
      <CourseList />
    </div>
  )
}

export default Profile

// StudentDashboard.js
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { API_BASE_URL } from '../../../config'

const StudentDashboard = () => {
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const userId = localStorage.getItem('userId') // Получаем ID пользователя из localStorage
  const user = useSelector((state: RootState) => state.user)
  const courseId = useParams<Params>()
  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        console.log('user:' + user._id)
        const response = await fetch(`${API_BASE_URL}/admin/enrollments/${userId}/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch enrollment')
        }

        const data = await response.json()
        setEnrollment(data)
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    fetchEnrollment()
  }, [userId, courseId])

  if (loading) {
    return <p>Loading...</p>
  }

  if (!enrollment) {
    return <p>Enrollment not found</p>
  }

  return (
    <div>
      <h2>Welcome to the Course!</h2>
      <p>Lives: {enrollment.lives} / 3</p> {/* Отображаем количество жизней */}
      {/* Добавляем визуальное отображение жизней (звездочки) */}
      <div>
        {Array.from({ length: enrollment.lives }).map((_, index) => (
          <span key={index}>⭐</span> // Отображаем звездочку для каждой жизни
        ))}
        {Array.from({ length: 3 - enrollment.lives }).map((_, index) => (
          <span key={index}>☆</span> // Отображаем пустую звездочку для каждой потерянной жизни
        ))}
      </div>
      {/* Отображаем информацию о том, когда сгорят жизни */}
      {enrollment.lastLessonCompleted && <p>Your homework deadline is: {new Date(enrollment.lastLessonCompleted.getTime() + 24 * 60 * 60 * 1000).toLocaleString()}</p>}
      {/* ... остальной контент личного кабинета */}
    </div>
  )
}

export default StudentDashboard

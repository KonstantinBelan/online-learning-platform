import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../config'

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [livesInput, setLivesInput] = useState({}) // Добавляем состояние для хранения введенных значений

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/enrollments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch enrollments')
        }

        const data = await response.json()
        setEnrollments(data)
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  const handleInputChange = (userId, courseId, value) => {
    // Обновляем состояние livesInput при изменении значения в input
    setLivesInput(prev => ({
      ...prev,
      [`${userId}-${courseId}`]: value,
    }))
  }

  const handleResetLives = async (userId, courseId) => {
    try {
      // Получаем значение lives из input или используем значение по умолчанию (3)
      const lives = livesInput[`${userId}-${courseId}`] || 3

      const response = await fetch(`${API_BASE_URL}/admin/enrollments/${userId}/${courseId}/reset-lives`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json', // Добавляем Content-Type
        },
        body: JSON.stringify({ lives }), // Отправляем lives в теле запроса
      })

      if (!response.ok) {
        throw new Error('Failed to reset lives')
      }

      const data = await response.json() // Получаем данные с backend
      const updatedEnrollment = data.enrollment // Получаем обновленную запись о зачислении

      // Обновляем список зачислений после успешного сброса жизней
      const updatedEnrollments = enrollments.map(enrollment => {
        if (enrollment.user._id === userId && enrollment.course._id === courseId) {
          return { ...enrollment, lives: updatedEnrollment.lives } // Используем lives из ответа backend
        }
        return enrollment
      })
      setEnrollments(updatedEnrollments)
    } catch (error) {
      console.error(error)
    }
  }

  const handleRestoreAccess = async (userId, courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/enrollments/${userId}/${courseId}/restore-access`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to restore access')
      }

      const data = await response.json() // Получаем данные с backend
      const updatedEnrollment = data.enrollment // Получаем обновленную запись о зачислении

      // Обновляем список зачислений после успешного восстановления доступа
      const updatedEnrollments = enrollments.map(enrollment => {
        if (enrollment.user._id === userId && enrollment.course._id === courseId) {
          return { ...enrollment, isLocked: updatedEnrollment.isLocked } // Используем isLocked из ответа backend
        }
        return enrollment
      })
      setEnrollments(updatedEnrollments)
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <h2>Enrollment Management</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Course</th>
            <th>Lives</th>
            <th>Locked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map(enrollment => (
            <tr key={enrollment._id}>
              <td>{enrollment.user.name}</td>
              <td>{enrollment.course.title}</td>
              <td>{enrollment.lives}</td>
              <td>{enrollment.isLocked ? 'Yes' : 'No'}</td>
              <td>
                <input type='number' value={livesInput[`${enrollment.user._id}-${enrollment.course._id}`] !== undefined ? livesInput[`${enrollment.user._id}-${enrollment.course._id}`] : String(enrollment.lives)} onChange={e => handleInputChange(enrollment.user._id, enrollment.course._id, e.target.value)} />
                <button onClick={() => handleResetLives(enrollment.user._id, enrollment.course._id)}>Reset Lives</button>
                <button onClick={() => handleRestoreAccess(enrollment.user._id, enrollment.course._id)}>Restore Access</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EnrollmentManagement

import React, { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { API_BASE_URL } from '../../config'

const LessonCompletionsTable: React.FC = () => {
  const [lessonCompletions, setLessonCompletions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLessonCompletions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/lesson-completions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch lesson completions')
        }

        const data = await response.json()
        console.log(data)
        setLessonCompletions(data)
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    fetchLessonCompletions()
  }, [])

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'user', headerName: 'User', width: 200, field: 'user' },
    { field: 'email', headerName: 'Email', width: 250, field: 'email' },
    { field: 'lesson', headerName: 'Lesson', width: 200, field: 'lesson' },
    { field: 'course', headerName: 'Course', width: 200, field: 'course' },
    { field: 'completionDate', headerName: 'Completion Date', width: 200, field: 'completionDate' },
  ]

  const rows = lessonCompletions.map(completion => ({
    id: completion._id,
    user: completion.user ? completion.user.name : 'Unknown User', // Получаем имя пользователя
    email: completion.user ? completion.user.email : 'N/A', // Получаем email пользователя
    lesson: completion.lesson ? completion.lesson.title : 'N/A', // Получаем название урока
    course: completion.course ? completion.course.title : 'N/A', // Получаем название курса
    completionDate: completion.completionDate ? new Date(completion.completionDate).toLocaleDateString() : 'N/A', // Форматируем дату
    // ...completion, // Удаляем эту строку, так как она не нужна
  }))

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5, 10, 20]} />
    </div>
  )
}

export default LessonCompletionsTable

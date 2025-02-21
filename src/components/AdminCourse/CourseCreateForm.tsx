import React, { useState } from 'react'
import { API_BASE_URL } from '../../config'
import { Course } from '../../types/Course'

interface CourseCreateFormProps {
  onCourseCreated: (newCourse: Course) => void
  onClose: () => void
}

const CourseCreateForm: React.FC<CourseCreateFormProps> = ({ onCourseCreated, onClose }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [defaultLives, setDefaultLives] = useState(3) // Добавляем состояние для defaultLives, значение по умолчанию 3
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title, description, imageUrl, defaultLives }), // Добавляем defaultLives в тело запроса
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newCourse: Course = await response.json()
      onCourseCreated(newCourse)
      onClose()
    } catch (error: any) {
      console.error('Error creating course:', error)
      setError('Failed to create course. Please try again later.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Course</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label htmlFor='title'>Title:</label>
        <input type='text' id='title' value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label htmlFor='description'>Description:</label>
        <textarea id='description' value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label htmlFor='imageUrl'>Image URL:</label>
        <input type='text' id='imageUrl' value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      </div>
      <div>
        <label htmlFor='defaultLives'>Default Lives:</label>
        <input
          type='number'
          id='defaultLives'
          value={defaultLives}
          onChange={e => setDefaultLives(parseInt(e.target.value))} // Преобразуем значение в число
        />
      </div>
      <button type='submit'>Create</button>
      <button type='button' onClick={onClose}>
        Cancel
      </button>
    </form>
  )
}

export default CourseCreateForm

import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config'
import { Course } from '../../types/Course'
import { Lesson } from '../../types/Lesson'
import LessonCreateForm from './LessonCreateForm'
import LessonEditForm from './LessonEditForm'

interface CourseEditFormProps {
  course: Course
  onCourseUpdated: (updatedCourse: Course) => void
  onClose: () => void
}

const CourseEditForm: React.FC<CourseEditFormProps> = ({ course, onCourseUpdated, onClose }) => {
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description)
  const [imageUrl, setImageUrl] = useState(course.imageUrl)
  const [status, setStatus] = useState<string>(course.status || 'draft') // Добавляем состояние для статуса
  const [defaultLives, setDefaultLives] = useState(course.defaultLives || 3) // Добавляем состояние для defaultLives
  const [error, setError] = useState<string | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    setTitle(course.title)
    setDescription(course.description)
    setImageUrl(course.imageUrl)
    setStatus(course.status || 'draft') // Устанавливаем начальный статус
    setDefaultLives(course.defaultLives || 3) // Устанавливаем начальное значение для defaultLives
  }, [course])

  useEffect(() => {
    // Fetch lessons for the course
    const fetchLessons = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/courses/${course._id}/lessons`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const lessonsData = await response.json()
        setLessons(lessonsData)
      } catch (error: any) {
        console.error('Error fetching lessons:', error)
        setError('Failed to load lessons. Please try again later.')
      }
    }

    fetchLessons()
  }, [course._id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses/${course._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          status, // Добавляем status в тело запроса
          defaultLives, // Добавляем defaultLives в тело запроса
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedCourse: Course = await response.json()
      onCourseUpdated(updatedCourse)
      onClose()
    } catch (error: any) {
      console.error('Error updating course:', error)
      setError('Failed to update course. Please try again later.')
    }
  }

  const handleShowCreateForm = () => {
    setShowCreateForm(true)
  }

  const handleLessonCreated = (newLesson: Lesson) => {
    setLessons([...lessons, newLesson])
    setShowCreateForm(false)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
  }

  const handleLessonUpdated = (updatedLesson: Lesson) => {
    setLessons(lessons.map(lesson => (lesson._id === updatedLesson._id ? updatedLesson : lesson)))
    setEditingLesson(null)
  }

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setLessons(lessons.filter(lesson => lesson._id !== lessonId))
    } catch (error: any) {
      console.error('Error deleting lesson:', error)
      setError('Failed to delete lesson. Please try again later.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Course</h2>
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
        {/* Добавляем поле для выбора статуса */}
        <label htmlFor='status'>Status:</label>
        <select id='status' value={status} onChange={e => setStatus(e.target.value)}>
          <option value='draft'>Draft</option>
          <option value='published'>Published</option>
          <option value='archived'>Archived</option>
        </select>
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
      <button type='submit'>Update</button>
      <button type='button' onClick={onClose}>
        Cancel
      </button>

      <h3>Lessons</h3>
      <ul>
        {lessons.map(lesson => (
          <li key={lesson._id}>
            {lesson.title}
            <button type='button' onClick={() => handleEditLesson(lesson)}>
              Edit
            </button>
            <button type='button' onClick={() => handleDeleteLesson(lesson._id)}>
              Delete
            </button>{' '}
            {/* Delete button */}
          </li>
        ))}
      </ul>

      <button type='button' onClick={handleShowCreateForm}>
        Add Lesson
      </button>

      {showCreateForm && <LessonCreateForm courseId={course._id} onLessonCreated={handleLessonCreated} onClose={() => setShowCreateForm(false)} />}

      {editingLesson && <LessonEditForm lesson={editingLesson} onLessonUpdated={handleLessonUpdated} onClose={() => setEditingLesson(null)} />}
    </form>
  )
}

export default CourseEditForm

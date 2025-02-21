// LessonEditForm.tsx
import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config'
import { Lesson } from '../../types/Lesson'
import { Homework } from '../../types/Homework'
import HomeworkForm from './HomeworkForm'
import ExternalLink from '../ExternalLink'

interface LessonEditFormProps {
  lesson: Lesson
  onLessonUpdated: (updatedLesson: Lesson) => void
  onClose: () => void
}

const LessonEditForm: React.FC<LessonEditFormProps> = ({ lesson, onLessonUpdated, onClose }) => {
  const [title, setTitle] = useState(lesson.title)
  const [description, setDescription] = useState(lesson.description)
  const [content, setContent] = useState(lesson.content)
  const [nextLessonUnlockConditionType, setNextLessonUnlockConditionType] = useState(lesson.nextLessonUnlockCondition?.type || 'immediately')
  const [homeworkMinGrade, setHomeworkMinGrade] = useState(lesson.nextLessonUnlockCondition?.homework_min_grade || 3)
  const [unlockTime, setUnlockTime] = useState(lesson.nextLessonUnlockCondition?.unlock_time || '')
  const [unlockAfterDays, setUnlockAfterDays] = useState(lesson.nextLessonUnlockCondition?.unlockAfterDays || 0)
  const [homeworkDeadline, setHomeworkDeadline] = useState(lesson.homeworkDeadline || 24) // Добавляем состояние для homeworkDeadline
  const [error, setError] = useState<string | null>(null)
  const [homework, setHomework] = useState<Homework | null>(null)
  const [showHomeworkForm, setShowHomeworkForm] = useState(false)

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/lessons/${lesson._id}/homework`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (response.ok) {
          if (response.status === 204) {
            setHomework(null)
          } else {
            const homeworkData: Homework = await response.json()
            setHomework(homeworkData)
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (error: any) {
        console.error('Error fetching homework:', error)
        setError('Failed to load homework. Please try again later.')
      }
    }

    fetchHomework()
  }, [lesson._id])

  useEffect(() => {
    setTitle(lesson.title)
    setDescription(lesson.description)
    setContent(lesson.content)
    setNextLessonUnlockConditionType(lesson.nextLessonUnlockCondition?.type || 'immediately')
    setHomeworkMinGrade(lesson.nextLessonUnlockCondition?.homework_min_grade || 3)
    setUnlockTime(lesson.nextLessonUnlockCondition?.unlock_time || '')
    setUnlockAfterDays(lesson.nextLessonUnlockCondition?.unlockAfterDays || 0)
    setHomeworkDeadline(lesson.homeworkDeadline || 24) // Устанавливаем начальное значение для homeworkDeadline
  }, [lesson])

  const handleSubmit = async () => {
    setError(null)

    try {
      const payload: any = {
        title,
        description,
        content,
        homeworkDeadline, // Добавляем homeworkDeadline в payload
        lessonOrder: lesson.lessonOrder, // Add lessonOrder to the payload
        nextLessonUnlockCondition: {
          type: nextLessonUnlockConditionType,
        },
      }

      if (nextLessonUnlockConditionType === 'homework_approved') {
        payload.nextLessonUnlockCondition.homework_min_grade = homeworkMinGrade
      }

      if (nextLessonUnlockConditionType === 'after_time') {
        payload.nextLessonUnlockCondition.unlock_time = unlockTime
      }

      if (nextLessonUnlockConditionType === 'after_registration_days') {
        payload.nextLessonUnlockCondition.unlockAfterDays = unlockAfterDays
      }

      const response = await fetch(`${API_BASE_URL}/admin/lessons/${lesson._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedLesson: Lesson = await response.json()
      onLessonUpdated(updatedLesson)
      onClose()
    } catch (error: any) {
      console.error('Error updating lesson:', error)
      setError('Failed to update lesson. Please try again later.')
    }
  }

  const handleCreateHomework = () => {
    setShowHomeworkForm(true)
  }

  const handleHomeworkCreated = (newHomework: Homework) => {
    setHomework(newHomework)
    setShowHomeworkForm(false)
  }

  const handleEditHomework = () => {
    setShowHomeworkForm(true)
  }

  const handleHomeworkUpdated = (updatedHomework: Homework) => {
    setHomework(updatedHomework)
    setShowHomeworkForm(false)
  }

  const handleDeleteHomework = async () => {
    // Implement the logic for deleting the homework here
    console.log('Deleting homework')
  }

  return (
    <div>
      <h2>Edit Lesson</h2>
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
        <label htmlFor='content'>Content:</label>
        <textarea id='content' value={content} onChange={e => setContent(e.target.value)} />
      </div>
      <div>
        <label htmlFor='homeworkDeadline'>Homework Deadline (hours):</label>
        <input type='number' id='homeworkDeadline' value={homeworkDeadline} onChange={e => setHomeworkDeadline(parseInt(e.target.value))} />
      </div>
      <div>
        <label htmlFor='nextLessonUnlockConditionType'>Unlock Condition (Next Lesson):</label>
        <select id='nextLessonUnlockConditionType' value={nextLessonUnlockConditionType} onChange={e => setNextLessonUnlockConditionType(e.target.value)}>
          <option value='immediately'>Immediately</option>
          <option value='homework_approved'>After Homework Approved</option>
          <option value='after_time'>After Specific Time</option>
          <option value='after_previous_lesson_completed'>After Previous Lesson Completed</option>
          <option value='after_registration_days'>After Registration Days</option>
          {/* Add options for Telegram and Instagram */}
        </select>
      </div>

      {nextLessonUnlockConditionType === 'homework_approved' && (
        <div>
          <label htmlFor='homeworkMinGrade'>Minimum Grade:</label>
          <input type='number' id='homeworkMinGrade' value={homeworkMinGrade} onChange={e => setHomeworkMinGrade(Number(e.target.value))} min='3' />
        </div>
      )}

      {nextLessonUnlockConditionType === 'after_time' && (
        <div>
          <label htmlFor='unlockTime'>Unlock Time:</label>
          <input type='datetime-local' id='unlockTime' value={unlockTime} onChange={e => setUnlockTime(e.target.value)} />
        </div>
      )}

      {nextLessonUnlockConditionType === 'after_registration_days' && ( // Отображаем поле только для after_registration_days
        <div>
          <label htmlFor='unlockAfterDays'>Unlock After Days:</label>
          <input type='number' id='unlockAfterDays' value={unlockAfterDays} onChange={e => setUnlockAfterDays(Number(e.target.value))} />
        </div>
      )}

      <button type='button' onClick={handleSubmit}>
        Update
      </button>
      <button type='button' onClick={onClose}>
        Cancel
      </button>

      <h3>Homework</h3>
      {homework ? (
        <div>
          <p>Title: {homework.title}</p>
          <p>Description: {homework.description}</p>
          <p>Deadline: {new Date(homework.deadline).toLocaleDateString()}</p>
          {homework.files && homework.files.length > 0 && (
            <ul>
              {homework.files.map((file, index) => (
                <li key={index}>
                  <ExternalLink href={`/uploads/${file}`}>File {index + 1}</ExternalLink>
                </li>
              ))}
            </ul>
          )}
          <button type='button' onClick={handleEditHomework}>
            Edit Homework
          </button>
          <button type='button' onClick={handleDeleteHomework}>
            Delete Homework
          </button>
        </div>
      ) : (
        <div>
          <p>No homework for this lesson.</p>
          <button type='button' onClick={handleCreateHomework}>
            Create Homework
          </button>
        </div>
      )}

      {showHomeworkForm && <HomeworkForm lessonId={lesson._id} homework={homework} onHomeworkCreated={handleHomeworkCreated} onHomeworkUpdated={handleHomeworkUpdated} onClose={() => setShowHomeworkForm(false)} />}
    </div>
  )
}

export default LessonEditForm

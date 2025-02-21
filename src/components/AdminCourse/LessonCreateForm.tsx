// LessonCreateForm.tsx
import React, { useState } from 'react'
import { API_BASE_URL } from '../../config'
import { Lesson } from '../../types/Lesson'

interface LessonCreateFormProps {
  courseId: string
  onLessonCreated: (newLesson: Lesson) => void
  onClose: () => void
}

const LessonCreateForm: React.FC<LessonCreateFormProps> = ({ courseId, onLessonCreated, onClose }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [nextLessonUnlockConditionType, setNextLessonUnlockConditionType] = useState('immediately')
  const [homeworkMinGrade, setHomeworkMinGrade] = useState(3)
  const [unlockTime, setUnlockTime] = useState('')
  const [unlockAfterDays, setUnlockAfterDays] = useState('')
  const [homeworkDeadline, setHomeworkDeadline] = useState(24) // Добавляем состояние для homeworkDeadline
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)

    try {
      const payload = {
        title,
        description,
        content,
        homeworkDeadline, // Добавляем homeworkDeadline в payload
        nextLessonUnlockCondition: {
          type: nextLessonUnlockConditionType,
          homework_min_grade: nextLessonUnlockConditionType === 'homework_approved' ? homeworkMinGrade : undefined,
          unlock_time: nextLessonUnlockConditionType === 'after_time' ? unlockTime : undefined,
          unlockAfterDays: nextLessonUnlockConditionType === 'after_registration_days' ? unlockAfterDays : undefined,
        },
      }

      const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newLesson: Lesson = await response.json()
      onLessonCreated(newLesson)
      onClose()
    } catch (error: any) {
      console.error('Error creating lesson:', error)
      setError('Failed to create lesson. Please try again later.')
    }
  }

  return (
    <div>
      <h2>Create New Lesson</h2>
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
        Create
      </button>
      <button type='button' onClick={onClose}>
        Cancel
      </button>
    </div>
  )
}

export default LessonCreateForm

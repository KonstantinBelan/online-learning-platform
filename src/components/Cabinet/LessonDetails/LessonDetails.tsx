import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { API_BASE_URL } from '../../../config'
import { Lesson } from '../../../types/Lesson'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'
import HomeworkListWrapper from '../../HomeworkListWrapper/HomeworkListWrapper'
import { Homework } from '../../../types/Homework'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Params {
  id: string // Renamed 'id' to 'courseId' for clarity
  lessonId: string
}

interface HomeworkSubmission {
  _id: string
  status: string
  grade: number | null
  answer: string
  submissionDate: string
  comment: string | null
}

const LessonDetails: React.FC = () => {
  const { id: courseId, lessonId } = useParams<Params>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [homeworks, setHomeworks] = useState<Homework[]>([])
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null)
  const user = useSelector((state: RootState) => state.user)
  const navigate = useNavigate()
  const [isLessonAvailable, setIsLessonAvailable] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false) // State to track lesson completion
  const [nextLessonAvailable, setNextLessonAvailable] = useState<boolean>(false)
  const [lives, setLives] = useState<number>(3)
  const [errorMessage, setErrorMessage] = useState('') // ADDED
  const [showModal, setShowModal] = useState(false) // ADDED
  const [open, setOpen] = useState(true)

  const fetchHomeworkSubmission = useCallback(async () => {
    try {
      if (homeworks.length > 0 && homeworks[0]?._id) {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}/homework/${homeworks[0]._id}/submission`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setSubmission(data)
        } else {
          console.error('Error fetching homework submission:', response.status, response.statusText)
          setSubmission(null)
        }
      } else {
        console.warn('Homeworks array is empty or does not contain _id property')
        setSubmission(null)
      }
    } catch (error) {
      console.error('Error fetching homework submission:', error)
      setSubmission(null)
    }
  }, [courseId, lessonId, homeworks])

  const fetchLessons = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Sort lessons by lessonOrder
        const sortedLessons = data.sort((a, b) => a.lessonOrder - b.lessonOrder)
        setLessons(sortedLessons)
      } else {
        console.error('Error fetching lessons:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    }
  }, [courseId])

  const checkLessonCompletion = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/complete`, {
        // TODO: Change method to GET
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        setIsCompleted(true)
      } else if (response.status === 404) {
        setIsCompleted(false)
      } else {
        console.error('Error checking lesson completion:', response.status, response.statusText)
        setIsCompleted(false)
      }
    } catch (error) {
      console.error('Error checking lesson completion:', error)
      setIsCompleted(false)
    }
  }, [lessonId])

  const handleCompleteLesson = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/complete/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        setIsCompleted(true)
      } else {
        console.error('Failed to complete lesson')
      }
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  }

  useEffect(() => {
    const fetchLessonAndCheckAvailability = async () => {
      try {
        // Fetch lesson details (including lives)
        const lessonResponse = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!lessonResponse.ok) {
          const errorData = await lessonResponse.json()
          if (lessonResponse.status === 403) {
            // Доступ запрещен (блокировка курса)
            setErrorMessage('Доступ к уроку заблокирован. Пожалуйста, пополните жизни.')
            setShowModal(true)
          } else {
            // Другая ошибка
            setErrorMessage(`Ошибка при получении данных об уроке: ${errorData.message || lessonResponse.statusText}`)
          }
          return // Прерываем выполнение
        }

        const lessonData = await lessonResponse.json()
        setLesson(lessonData.lesson) // Данные урока теперь в lessonData.lesson
        setLives(lessonData.lives) // Получаем количество жизней из ответа
        if (lessonData.lesson.homework) {
          setHomeworks([lessonData.lesson.homework])
        }
        setIsLessonAvailable(true)
      } catch (error) {
        console.error('Ошибка при получении данных об уроке или проверке доступности:', error)
        setErrorMessage(`Ошибка при получении данных об уроке или проверке доступности: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonAndCheckAvailability()
    fetchLessons()
    checkLessonCompletion()
  }, [lessonId, courseId, user, navigate, fetchLessons, checkLessonCompletion])

  useEffect(() => {
    // Call fetchHomeworkSubmission only when lesson and homeworks are available
    if (lesson?.homework) {
      fetchHomeworkSubmission()
    }
  }, [lesson?.homework, fetchHomeworkSubmission])

  // Find the index of the current lesson
  const currentLessonIndex = lessons.findIndex(l => lesson && l._id === lesson._id)

  // Determine the previous and next lessons
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null

  const isNextLessonAvailable = useCallback(
    async (nextLessonUnlockCondition: any) => {
      if (!nextLesson) {
        return false // Если nextLesson равен null, то урок недоступен
      }
      try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${nextLesson._id}/availability`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!response.ok) {
          console.error('Error fetching availability:', response.status, response.statusText)
          return false
        }

        const availabilityData = await response.json()
        return availabilityData.isAvailable
      } catch (error) {
        console.error('Error fetching availability:', error)
        return false
      }
    },
    [courseId, nextLesson]
  )

  useEffect(() => {
    const checkNextLessonAvailability = async () => {
      if (lesson && lesson.nextLessonUnlockCondition) {
        const available = await isNextLessonAvailable(lesson.nextLessonUnlockCondition)
        setNextLessonAvailable(available)
      } else {
        setNextLessonAvailable(true) // Если нет условий разблокировки, урок доступен
      }
    }

    checkNextLessonAvailability()
  }, [nextLesson, isNextLessonAvailable, lesson])

  if (errorMessage) {
    return (
      <div>
        {errorMessage && <p>{errorMessage}</p>}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Сообщение об ошибке</DialogTitle>
              <DialogDescription>{errorMessage || 'Нет ошибок.'}</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // If the lesson is not available, redirect to the course details page
  if (!loading && !isLessonAvailable) {
    return (
      <p>
        <Link to={`/cabinet/courses/${courseId}`}>Вернуться к курсу</Link>
      </p>
    )
  }

  if (loading) {
    return <p>Загрузка...</p>
  }

  if (!lesson) {
    return <p>Урок не найден.</p>
  }

  return (
    <div>
      <h2>{lesson?.title}</h2>
      <p>{lesson?.description}</p>
      <p>Lives: {lives}</p> {/* Отображаем количество жизней */}
      <div dangerouslySetInnerHTML={{ __html: lesson?.content || '' }} />
      <h3>Домашние задания:</h3>
      <HomeworkListWrapper lessonId={lessonId} courseId={courseId} homeworks={homeworks} />
      {submission ? (
        <div>
          <h4>Your Submission Details:</h4>
          <p>Status: {submission.status}</p>
          {submission.grade !== null && <p>Grade: {submission.grade}</p>}
          {submission.comment && <p>Comment: {submission.comment}</p>}
          <p>Submitted On: {new Date(submission.submissionDate).toLocaleDateString()}</p>
        </div>
      ) : (
        <p>You have not submitted this homework yet.</p>
      )}
      {!isCompleted && <button onClick={handleCompleteLesson}>Завершить урок</button>}
      {isCompleted && <p>Урок завершен!</p>}
      <div>
        {previousLesson && <Link to={`/cabinet/courses/${courseId}/lessons/${previousLesson._id}`}>Предыдущий урок</Link>}
        {nextLesson && (nextLessonAvailable ? <Link to={`/cabinet/courses/${courseId}/lessons/${nextLesson._id}`}>Следующий урок</Link> : <span>Следующий урок (недоступно)</span>)}
      </div>
      <div>
        <p>
          <Link to={`/cabinet/courses/${courseId}`}>Вернуться к курсу</Link>
        </p>
      </div>
    </div>
  )
}

export default LessonDetails

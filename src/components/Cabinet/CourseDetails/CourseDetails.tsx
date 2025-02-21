import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../../config'
import { Course } from '../../../types/Course'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import StudentDashboard from '../StudentDashboard/StudentDashboard'

interface Params {
  id: string
}

interface Lesson {
  _id: string
  title: string
  description: string
  lessonOrder: number
  nextLessonUnlockCondition?: {
    type: string
    homework_min_grade?: number
    unlock_time?: string
  }
}

const CourseDetails: React.FC = () => {
  const { id: courseId } = useParams<Params>()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('') // ADDED
  const [showModal, setShowModal] = useState(false) // ADDED
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!response.ok) {
          if (response.status === 403) {
            // Доступ запрещен (блокировка курса)
            setErrorMessage('Доступ к курсу заблокирован. Пожалуйста, пополните жизни.')
            setShowModal(true)
          } else {
            // Другая ошибка
            setErrorMessage('Ошибка при получении данных о курсе.')
          }
          return // Прерываем выполнение
        }

        const data = await response.json()
        setCourse(data)
      } catch (error) {
        console.error('Ошибка при получении данных о курсе:', error)
        setErrorMessage('Ошибка при получении данных о курсе.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, navigate])

  const getLessonAvailability = useCallback(
    async (lessonId: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}/availability`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log(data)
          return data // { lesson, isAvailable, unlockCondition, nextLessonUnlockCondition }
        } else {
          console.error('Error fetching lesson availability:', response.status, response.statusText)
          return {
            lesson: null,
            isAvailable: false,
            unlockCondition: null,
            nextLessonUnlockCondition: null,
          }
        }
      } catch (error) {
        console.error('Error fetching lesson availability:', error)
        return {
          lesson: null,
          isAvailable: false,
          unlockCondition: null,
          nextLessonUnlockCondition: null,
        }
      }
    },
    [courseId]
  )

  if (loading) {
    return <p>Загрузка...</p>
  }

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

  if (!course) {
    return <p>Курс не найден.</p>
  }

  return (
    <div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>

      <h3>Уроки:</h3>
      {course.lessons && course.lessons.length > 0 ? (
        <ul>
          {course.lessons
            .sort((a, b) => a.lessonOrder - b.lessonOrder)
            .map((lesson: Lesson, index: number) => {
              const nextLesson = course.lessons[index - 1]
              const nextLessonUnlockCondition = nextLesson ? nextLesson.nextLessonUnlockCondition - 1 : null

              return (
                <LessonItem
                  key={lesson._id}
                  lesson={lesson}
                  courseId={courseId}
                  getLessonAvailability={getLessonAvailability}
                  nextLessonUnlockCondition={nextLessonUnlockCondition} // Pass to LessonItem
                />
              )
            })}
        </ul>
      ) : (
        <p>В этом курсе пока нет уроков.</p>
      )}
    </div>
  )
}

interface LessonItemProps {
  lesson: Lesson
  courseId: string
  getLessonAvailability: (lessonId: string) => Promise<{
    lesson: Lesson | null
    isAvailable: boolean
    unlockCondition: any
    nextLessonUnlockCondition: any
  }>
  nextLessonUnlockCondition: any // Add nextLessonUnlockCondition prop
}

const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  courseId,
  getLessonAvailability,
  nextLessonUnlockCondition, // Receive as a prop
}) => {
  const [isAvailable, setIsAvailable] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(true)

  useEffect(() => {
    const checkAvailability = async () => {
      setLoadingAvailability(true)
      try {
        const availabilityData = await getLessonAvailability(lesson._id)
        setIsAvailable(availabilityData?.isAvailable || false)
      } catch (error) {
        console.error('Error fetching lesson availability:', error)
        setIsAvailable(false)
      } finally {
        setLoadingAvailability(false)
      }
    }

    checkAvailability()
  }, [lesson._id, courseId, getLessonAvailability])

  if (loadingAvailability) {
    return <li>Загрузка...</li>
  }

  return (
    <li>
      {isAvailable ? (
        <Link to={`lessons/${lesson._id}`}>{lesson.title}</Link>
      ) : (
        <>
          {lesson.title} (Недоступно) {nextLessonUnlockCondition?.type}
          {/* Display the next lesson's unlock condition */}
          {nextLessonUnlockCondition?.type === 'homework_approved' && <p>Следующий урок станет доступен после подтверждения домашней работы.</p>}
          {nextLessonUnlockCondition?.type === 'after_time' && <p>Следующий урок станет доступен {new Date(nextLessonUnlockCondition.unlock_time).toLocaleDateString()}.</p>}
          {nextLessonUnlockCondition?.type === 'after_previous_lesson_completed' && <p>Следующий урок станет доступен после завершения предыдущего урока.</p>}
          {nextLessonUnlockCondition?.type === 'after_registration_days' && <p>Следующий урок станет доступен через несколько дней после регистрации на курс.</p>}
        </>
      )}
    </li>
  )
}

export default CourseDetails

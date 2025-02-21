// src/pages/Course/CoursePage.tsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { RootState } from '../../redux/store'
import { setCourseInfo } from '../../redux/features/userSlice'
import CourseInfo from '../../components/CourseInfo/CourseInfo'
import { API_BASE_URL } from '../../config'
import HomeworkListWrapper from '../../components/HomeworkListWrapper/HomeworkListWrapper' // Import HomeworkListWrapper
import { Homework } from '../../types/Homework'

interface Lesson {
	_id: string
	title: string
	description: string
	hasHomework: boolean
}

const CoursePage: React.FC = () => {
	const { courseId } = useParams<{ courseId: string }>()
	const dispatch = useDispatch()
	const user = useSelector((state: RootState) => state.user)
	const [lessons, setLessons] = useState<Lesson[]>([])
	const [homeworks, setHomeworks] = useState<{
		[lessonId: string]: Homework[]
	}>({})

	useEffect(() => {
		const fetchCourseInfo = async () => {
			try {
				const response = await fetch(
					`${API_BASE_URL}/enrollments/${courseId}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					}
				)
				const data = await response.json()

				dispatch(
					setCourseInfo({
						courseId: courseId!,
						lives: data.lives,
						progress: data.progress,
						completedLessons: [],
					})
				)
			} catch (error) {
				console.error('Error fetching course info:', error)
			}
		}

		const fetchLessons = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/lessons/${courseId}`)
				const data = await response.json()
				setLessons(data.lessons)

				const homeworkData: { [lessonId: string]: Homework[] } = {}
				for (const lesson of data.lessons) {
					try {
						const lessonResponse = await fetch(
							`${API_BASE_URL}/lessons/${lesson._id}/with-homework`,
							{
								headers: {
									Authorization: `Bearer ${localStorage.getItem('token')}`,
								},
							}
						)
						const lessonData = await lessonResponse.json()
						console.log(`Lesson ${lesson._id} data:`, lessonData)

						if (lessonData.lesson && lessonData.lesson.hasHomework) {
							const homeworksForLesson: Homework[] = [
								{
									lessonId: lesson._id,
									title: `Homework for ${lessonData.lesson.title}`,
									description: lessonData.lesson.description,
									deadline: new Date(),
									isCompleted: lessonData.isCompleted,
								},
							]
							homeworkData[lesson._id] = homeworksForLesson
						} else {
							homeworkData[lesson._id] = []
						}
					} catch (error) {
						console.error(
							`Error fetching homework status for lesson ${lesson._id}:`,
							error
						)
						homeworkData[lesson._id] = []
					}
				}
				setHomeworks(homeworkData)
			} catch (error) {
				console.error('Error fetching lessons:', error)
			}
		}

		if (courseId && localStorage.getItem('token')) {
			fetchCourseInfo()
			fetchLessons()
		}
	}, [courseId, dispatch])

	return (
		<div>
			<h1>Страница курса</h1>
			{user.userId ? (
				<>
					<CourseInfo courseId={courseId!} />
					<h2>Уроки</h2>
					<ul>
						{lessons.map(lesson => (
							<li key={lesson._id}>
								{lesson.title}
								{/* Use HomeworkListWrapper instead of HomeworkList */}
								<HomeworkListWrapper
									lessonId={lesson._id}
									homeworks={homeworks[lesson._id] || []}
								/>
							</li>
						))}
					</ul>
				</>
			) : (
				<p>
					Пожалуйста, войдите в систему, чтобы просмотреть информацию о курсе.
				</p>
			)}
		</div>
	)
}

export default CoursePage

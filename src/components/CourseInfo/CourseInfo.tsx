import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'

interface CourseInfoProps {
	courseId: string
}

const CourseInfo: React.FC<CourseInfoProps> = ({ courseId }) => {
	const user = useSelector((state: RootState) => state.user)
	const courseInfo = user.enrolledCourses[courseId]

	if (!courseInfo) {
		return <p>Информация о курсе не найдена.</p>
	}

	return (
		<div>
			<h2>Ваш прогресс на курсе</h2>
			<p>Жизни: {courseInfo.lives}</p>
			<p>Прогресс: {courseInfo.progress}%</p>
			<p>Пройденные уроки: {courseInfo.completedLessons.length}</p>
		</div>
	)
}

export default CourseInfo

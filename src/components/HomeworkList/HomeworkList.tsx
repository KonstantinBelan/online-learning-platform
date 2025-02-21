import React from 'react'
import HomeworkItem from '../HomeworkItem/HomeworkItem'
import { Homework } from '../../types/Homework'

interface HomeworkListProps {
	courseId: string // Добавляем courseId в props
	lessonId: string
	homeworks: Homework[]
}

const HomeworkList: React.FC<HomeworkListProps> = ({
	courseId,
	lessonId,
	homeworks,
}) => {
	return (
		<div>
			{homeworks.map(homework => (
				<HomeworkItem
					key={homework._id} // Use homework._id as the key
					courseId={courseId}
					lessonId={lessonId}
					homework={homework}
				/> // Передаем courseId и lessonId в HomeworkItem
			))}
		</div>
	)
}
export default HomeworkList

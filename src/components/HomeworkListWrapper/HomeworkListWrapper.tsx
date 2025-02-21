import React from 'react'
import HomeworkList from '../HomeworkList/HomeworkList'

interface HomeworkListWrapperProps {
	lessonId: string
	homeworks: any[] // TODO: Указать правильный тип для homeworks
	courseId: string
}

const HomeworkListWrapper: React.FC<HomeworkListWrapperProps> = ({
	lessonId,
	homeworks,
	courseId,
}) => {
	return (
		<HomeworkList
			courseId={courseId}
			lessonId={lessonId}
			homeworks={homeworks}
		/>
	)
}

export default HomeworkListWrapper

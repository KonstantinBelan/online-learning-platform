import React, { useState } from 'react'
import { Homework } from '../../types/Homework'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { API_BASE_URL } from '../../config'

interface HomeworkItemProps {
	courseId: string
	homework: Homework
	lessonId: string
}

const HomeworkItem: React.FC<HomeworkItemProps> = ({
	courseId,
	homework,
	lessonId,
}) => {
	const [answer, setAnswer] = useState('')
	const [isSubmitted, setIsSubmitted] = useState(false)
	const user = useSelector((state: RootState) => state.user)

	const handleSubmit = async () => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}/homework`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify({ answer, userId: user._id }),
				}
			)

			if (response.ok) {
				setIsSubmitted(true)
				alert('Домашнее задание успешно отправлено!')
			} else {
				console.error('Error submitting homework:', response.statusText)
				alert('Произошла ошибка при отправке домашнего задания.')
			}
		} catch (error) {
			console.error('Error submitting homework:', error)
			alert('Произошла ошибка при отправке домашнего задания.')
		}
	}

	return (
		<div>
			<h4>{homework.title}</h4>
			<p>{homework.description}</p>
			<p>Срок сдачи: {new Date(homework.deadline).toLocaleDateString()}</p>

			{/* Display attached files */}
			{homework.files && homework.files.length > 0 && (
				<div>
					<h5>Attached Files:</h5>
					<ul>
						{homework.files.map((file, index) => (
							<li key={index}>
								<a
									href={`/uploads/${file}`}
									target='_blank'
									rel='noopener noreferrer'
								>
									{file}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}

			<label>
				Ваш ответ:
				<textarea
					value={answer}
					onChange={e => setAnswer(e.target.value)}
					rows={4}
					cols={50}
					disabled={isSubmitted}
				/>
			</label>
			{!isSubmitted && (
				<button onClick={handleSubmit} disabled={isSubmitted}>
					Отправить на проверку
				</button>
			)}
			{isSubmitted && <p>Ожидает проверки</p>}
		</div>
	)
}

export default HomeworkItem

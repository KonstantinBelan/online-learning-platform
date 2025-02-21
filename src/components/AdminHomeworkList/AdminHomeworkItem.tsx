import React, { useState } from 'react'
import { API_BASE_URL } from '../../config'
import { HomeworkSubmission } from '../../types/HomeworkSubmission'

interface AdminHomeworkItemProps {
	submission: HomeworkSubmission
	courseId: string
	lessonId: string
	onDelete: (submissionId: string) => void // Add onDelete prop
}

const AdminHomeworkItem: React.FC<AdminHomeworkItemProps> = ({
	submission,
	courseId,
	lessonId,
	onDelete,
}) => {
	const [grade, setGrade] = useState<number | undefined>(submission.grade)
	const [status, setStatus] = useState<string>(submission.status)
	const [comment, setComment] = useState<string>(submission.comment || '')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleGradeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(event.target.value)
		setGrade(isNaN(value) ? undefined : value)
	}

	const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setStatus(event.target.value)
	}

	const handleCommentChange = (
		event: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setComment(event.target.value)
	}

	const handleSubmit = async () => {
		setIsLoading(true)
		setError(null)
		try {
			if (grade !== undefined && (isNaN(grade) || grade < 1 || grade > 5)) {
				setError('Please enter a valid grade between 1 and 5.')
				return
			}

			const response = await fetch(
				`${API_BASE_URL}/courses/${courseId}/lessons/${lessonId}/homework/${submission._id}/status`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify({
						status: status,
						grade: grade,
						comment: comment,
					}),
				}
			)

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`)
			}

			alert('Homework submission updated successfully!')
		} catch (error: any) {
			console.error('Error updating homework submission:', error)
			setError('Failed to update homework submission. Please try again later.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleDelete = async () => {
		setIsLoading(true)
		setError(null)
		try {
			const response = await fetch(
				`${API_BASE_URL}/admin/submissions/${submission._id}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			)

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`)
			}

			alert('Homework submission deleted successfully!')
			onDelete(submission._id) // Call onDelete to remove from the list
		} catch (error: any) {
			console.error('Error deleting homework submission:', error)
			setError('Failed to delete homework submission. Please try again later.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div>
			<p>
				<strong>Студент:</strong> {submission.user.username} (
				{submission.user.email})
			</p>
			{submission.homework ? (
				<>
					<p>
						<strong>Урок:</strong> {submission.homework.title} -{' '}
						{submission.homework.description}
					</p>
				</>
			) : submission.lesson ? (
				<>
					<p>
						<strong>Урок:</strong> {submission.lesson} -
					</p>
				</>
			) : (
				<p>
					<strong>Урок:</strong> Информация об уроке отсутствует
				</p>
			)}
			<p>
				<strong>Ответ:</strong> {submission.answer}
			</p>
			<p>
				<strong>Дата отправки:</strong>{' '}
				{new Date(submission.submissionDate).toLocaleDateString()}
			</p>
			<label>
				Оценка (1-5):
				<input
					type='number'
					min='1'
					max='5'
					value={grade !== undefined ? grade : ''}
					onChange={handleGradeChange}
					disabled={isLoading}
				/>
			</label>
			<label>
				Статус:
				<select
					value={status}
					onChange={handleStatusChange}
					disabled={isLoading}
				>
					<option value='pending'>Ожидает проверки</option>
					<option value='approved'>Одобрено</option>
					<option value='rejected'>Отклонено</option>
				</select>
			</label>
			<label>
				Комментарий:
				<textarea
					value={comment}
					onChange={handleCommentChange}
					rows={3}
					disabled={isLoading}
				/>
			</label>
			<button onClick={handleSubmit} disabled={isLoading}>
				{isLoading ? 'Сохранение...' : 'Сохранить изменения'}
			</button>
			<button onClick={handleDelete} disabled={isLoading}>
				{isLoading ? 'Удаление...' : 'Удалить'}
			</button>{' '}
			{/* Add Delete button */}
			{error && <p style={{ color: 'red' }}>{error}</p>}
		</div>
	)
}

export default AdminHomeworkItem

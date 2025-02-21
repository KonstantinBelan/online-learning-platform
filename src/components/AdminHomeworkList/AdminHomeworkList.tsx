import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config'
import { HomeworkSubmission } from '../../types/HomeworkSubmission'
import AdminHomeworkItem from './AdminHomeworkItem'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'

const AdminHomeworkList: React.FC = () => {
	const user = useSelector((state: RootState) => state.user)
	const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		console.log('User state:', user)
		const fetchSubmissions = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const response = await fetch(`${API_BASE_URL}/admin/submissions`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				})

				if (response.ok) {
					const data = await response.json() // Extract JSON data
					console.log('Data:', data) // Log the extracted data
					setSubmissions(data)
				} else {
					console.error(
						'Error fetching submissions:',
						response.status,
						response.statusText
					)
				}
			} catch (error: any) {
				console.error('Error fetching submissions:', error)
				setError('Failed to load submissions. Please try again later.')
			} finally {
				setIsLoading(false)
			}
		}

		fetchSubmissions()
	}, [])

	const handleDeleteSubmission = (submissionId: string) => {
		setSubmissions(prevSubmissions =>
			prevSubmissions.filter(submission => submission._id !== submissionId)
		)
	}

	if (isLoading) {
		return <div>Loading submissions...</div>
	}

	if (error) {
		return <div>Error: {error}</div>
	}

	return (
		<div>
			<h2>Список сданных домашних заданий</h2>
			{submissions.length === 0 ? (
				<p>No submissions found.</p>
			) : (
				submissions.map(submission => (
					<AdminHomeworkItem
						key={submission._id}
						submission={submission}
						onDelete={handleDeleteSubmission}
					/>
				))
			)}
		</div>
	)
}

export default AdminHomeworkList

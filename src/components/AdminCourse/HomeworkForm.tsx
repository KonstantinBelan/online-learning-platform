import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config'
import { Homework } from '../../types/Homework'

interface HomeworkFormProps {
	lessonId: string
	homework: Homework | null
	onHomeworkCreated: (newHomework: Homework) => void
	onHomeworkUpdated: (updatedHomework: Homework) => void
	onClose: () => void
}

const HomeworkForm: React.FC<HomeworkFormProps> = ({
	lessonId,
	homework,
	onHomeworkCreated,
	onHomeworkUpdated,
	onClose,
}) => {
	const [title, setTitle] = useState(homework?.title || '')
	const [description, setDescription] = useState(homework?.description || '')
	const [deadline, setDeadline] = useState(
		homework?.deadline
			? new Date(homework.deadline).toISOString().slice(0, 10)
			: ''
	)
	const [error, setError] = useState<string | null>(null)
	const [files, setFiles] = useState<File[]>([])
	const [filesToDelete, setFilesToDelete] = useState<string[]>([])
	const [displayedFiles, setDisplayedFiles] = useState<string[]>(
		homework?.files || []
	) // New state

	useEffect(() => {
		setDisplayedFiles(homework?.files || [])
	}, [homework?.files])

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			setFiles(Array.from(event.target.files))
		}
	}

	const handleFileToDelete = (fileToDelete: string) => {
		setFilesToDelete(prevFilesToDelete => {
			if (prevFilesToDelete.includes(fileToDelete)) {
				return prevFilesToDelete.filter(file => file !== fileToDelete)
			} else {
				return [...prevFilesToDelete, fileToDelete]
			}
		})

		// Update displayedFiles immediately
		setDisplayedFiles(prevDisplayedFiles =>
			prevDisplayedFiles.filter(file => file !== fileToDelete)
		)
	}

	const handleSubmit = async () => {
		setError(null)

		try {
			const formData = new FormData()
			formData.append('title', title)
			formData.append('description', description)
			formData.append('deadline', deadline)

			files.forEach(file => {
				formData.append('files', file)
			})

			filesToDelete.forEach(fileToDelete => {
				formData.append('filesToDelete', fileToDelete)
			})

			const method = homework ? 'PUT' : 'POST'
			const url = homework
				? `${API_BASE_URL}/admin/homework/${homework._id}`
				: `${API_BASE_URL}/admin/lessons/${lessonId}/homework`

			const response = await fetch(url, {
				method: method,
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: formData,
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const newHomework: Homework = await response.json()
			if (homework) {
				onHomeworkUpdated(newHomework)
			} else {
				onHomeworkCreated(newHomework)
			}
			onClose()
		} catch (error: any) {
			console.error('Error creating/updating homework:', error)
			setError('Failed to create/update homework. Please try again later.')
		}
	}

	return (
		<div>
			<h2>{homework ? 'Edit Homework' : 'Create Homework'}</h2>
			{error && <div style={{ color: 'red' }}>{error}</div>}
			<div>
				<label htmlFor='title'>Title:</label>
				<input
					type='text'
					id='title'
					value={title}
					onChange={e => setTitle(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor='description'>Description:</label>
				<textarea
					id='description'
					value={description}
					onChange={e => setDescription(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor='deadline'>Deadline:</label>
				<input
					type='date'
					id='deadline'
					value={deadline}
					onChange={e => setDeadline(e.target.value)}
					required
				/>
			</div>
			<div>
				<label htmlFor='files'>Files:</label>
				<input type='file' id='files' multiple onChange={handleFileChange} />
			</div>
			<div>
				<label>Existing Files:</label>
				<ul>
					{displayedFiles.map((file, index) => (
						<li key={index}>
							{file}
							<button type='button' onClick={() => handleFileToDelete(file)}>
								Delete
							</button>
						</li>
					))}
				</ul>
			</div>
			<button type='button' onClick={handleSubmit}>
				Save
			</button>
			<button type='button' onClick={onClose}>
				Cancel
			</button>
		</div>
	)
}

export default HomeworkForm

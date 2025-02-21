import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config'
import { Course } from '../../types/Course'
import CourseCreateForm from '../../components/AdminCourse/CourseCreateForm'
import CourseEditForm from '../../components/AdminCourse/CourseEditForm' // Import CourseEditForm
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'

const AdminCourseList: React.FC = () => {
	const [courses, setCourses] = useState<Course[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [editingCourse, setEditingCourse] = useState<Course | null>(null) // Track which course is being edited
	const user = useSelector((state: RootState) => state.user)

	useEffect(() => {
		const fetchCourses = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const response = await fetch(`${API_BASE_URL}/admin/courses`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				})

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}

				const data = await response.json()
				setCourses(data)
			} catch (error: any) {
				console.error('Error fetching courses:', error)
				setError('Failed to load courses. Please try again later.')
			} finally {
				setIsLoading(false)
			}
		}

		fetchCourses()
	}, [])

	const handleCreateCourse = () => {
		setShowCreateForm(true)
	}

	const handleCourseCreated = (newCourse: Course) => {
		setCourses([...courses, newCourse])
		setShowCreateForm(false)
	}

	const handleEditCourse = (course: Course) => {
		setEditingCourse(course)
	}

	const handleCourseUpdated = (updatedCourse: Course) => {
		setCourses(
			courses.map(course =>
				course._id === updatedCourse._id ? updatedCourse : course
			)
		)
		setEditingCourse(null)
	}

	const handleDeleteCourse = async (courseId: string) => {
		try {
			const response = await fetch(
				`${API_BASE_URL}/admin/courses/${courseId}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			setCourses(courses.filter(course => course._id !== courseId))
		} catch (error: any) {
			console.error('Error deleting course:', error)
			setError('Failed to delete course. Please try again later.')
		}
	}

	if (isLoading) {
		return <div>Loading courses...</div>
	}

	if (error) {
		return <div>Error: {error}</div>
	}

	return (
		<div>
			<h2>Admin Course List</h2>
			{user.role === 'admin' ? (
				<button onClick={handleCreateCourse}>Create New Course</button>
			) : (
				<p>You do not have permission to create courses.</p>
			)}

			{showCreateForm && (
				<CourseCreateForm
					onCourseCreated={handleCourseCreated}
					onClose={() => setShowCreateForm(false)}
				/>
			)}

			{editingCourse && (
				<CourseEditForm
					course={editingCourse}
					onCourseUpdated={handleCourseUpdated}
					onClose={() => setEditingCourse(null)}
				/>
			)}

			<ul>
				{courses.map(course => (
					<li key={course._id}>
						{course.title}
						{user.role === 'admin' && (
							<>
								<button onClick={() => handleEditCourse(course)}>Edit</button>
								<button onClick={() => handleDeleteCourse(course._id)}>
									Delete
								</button>
							</>
						)}
					</li>
				))}
			</ul>
		</div>
	)
}

export default AdminCourseList

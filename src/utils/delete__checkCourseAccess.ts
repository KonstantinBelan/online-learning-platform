import { API_BASE_URL } from '../config'

export const checkCourseAccess = async (
	courseId: string,
	token: string | null
): Promise<boolean> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/users/me/courses/${courseId}/access`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		if (response.status === 204) {
			return false
		}
		return response.ok // Returns true if access is allowed, false otherwise
	} catch (error) {
		console.error('Error checking course access:', error)
		return false // Assume no access in case of error
	}
}

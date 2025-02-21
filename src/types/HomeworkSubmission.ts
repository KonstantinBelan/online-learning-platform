export interface HomeworkSubmission {
	_id: string
	user: {
		_id: string
		username: string
		email: string
	}
	lesson: {
		//  lesson теперь объект
		_id: string
		title: string
		description: string
	}
	submissionDate: string
	grade?: number
	answer: string
	status: 'pending' | 'approved' | 'rejected'
}

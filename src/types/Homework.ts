// export interface Homework {
// 	lessonId: string
// 	title: string
// 	description: string
// 	deadline: Date
// 	isCompleted: boolean
// }

// types/Homework.ts

// export interface Homework {
// 	_id: string
// 	lesson: string // ObjectId of the Lesson
// 	question: string
// 	files: string[]
// }

// types/Homework.ts

export interface Homework {
	_id: string
	lesson: string // ObjectId of the Lesson
	title: string
	description: string
	deadline: Date
	files: string[]
}

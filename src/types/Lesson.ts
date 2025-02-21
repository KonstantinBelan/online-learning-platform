// // types/Lesson.ts

// export interface Lesson {
// 	_id: string
// 	title: string
// 	description: string
// 	content: string
// 	course: string // ObjectId of the Course
// 	order: number
// 	createdAt: Date
// 	updatedAt: Date
// 	duration: number
// 	type: string
// 	hasHomework: boolean
// 	homeworkDeadline: Date
// 	homework: string | null // Add homework property (ObjectId of the Homework)
// }

export interface Lesson {
  _id: string
  title: string
  description: string
  content: string
  course: string // ObjectId of the Course
  order?: number
  createdAt?: Date
  updatedAt?: Date
  duration?: number
  type?: string
  hasHomework?: boolean
  homeworkDeadline?: number // Изменяем тип на number (количество часов)
  homework: string | null
  __v?: number
  lessonOrder: number // Добавляем поле lessonOrder
  nextLessonUnlockCondition?: {
    // Добавляем поле nextLessonUnlockCondition
    type: string
    homework_min_grade?: number
    unlock_time?: string
  }
}

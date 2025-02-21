// // types/Course.ts

// export interface Course {
// 	_id: string
// 	title: string
// 	description: string
// 	imageUrl: string
// 	lessons: string[]
// 	slug: string // Add slug property
// }

export interface Course {
  _id: string
  title: string
  description: string
  imageUrl?: string // Может отсутствовать
  lessons?: string[] // Массив ID уроков, может отсутствовать
  author?: string // ID автора курса, может отсутствовать
  category?: string // Категория курса, может отсутствовать
  price?: number // Цена курса, может отсутствовать
  status?: 'draft' | 'published' | 'archived' // Статус курса, может отсутствовать
  slug?: string // Slug, может отсутствовать
  createdAt?: string // Дата создания, может отсутствовать
  updatedAt?: string // Дата обновления, может отсутствовать
  __v?: number // Версия, может отсутствовать
  defaultLives?: number // Количество жизней по умолчанию, может отсутствовать
}

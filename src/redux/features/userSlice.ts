// userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { produce } from 'immer'

interface UserState {
	userId: string | null
	username: string | null
	email: string | null
	role: string | null
	lives: number
	progress: number
	enrolledCourses: {
		[courseId: string]: {
			lives: number
			progress: number
			completedLessons: string[]
			homeworkStatus: {
				[lessonId: string]: boolean
			}
		}
	}
}

const initialState: UserState = {
	userId: null,
	username: null,
	email: null,
	role: null,
	lives: 0,
	progress: 0,
	enrolledCourses: {},
}

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		login: (
			state,
			action: PayloadAction<{
				userId: string
				username: string
				email: string
				role: string
			}>
		) => {
			console.log('Login reducer called', state, action.payload)
			return produce(state, draft => {
				draft.userId = action.payload.userId
				draft.username = action.payload.username
				draft.email = action.payload.email
				draft.role = action.payload.role
			})
		},
		setUser: (
			state,
			action: PayloadAction<{ userId: string; username: string; email: string }>
		) => {
			return produce(state, draft => {
				draft.userId = action.payload.userId
				draft.username = action.payload.username
				draft.email = action.payload.email
			})
		},
		setCourseInfo: (
			state,
			action: PayloadAction<{
				courseId: string
				lives: number
				progress: number
				completedLessons: string[]
			}>
		) => {
			const { courseId, lives, progress, completedLessons } = action.payload
			return produce(state, draft => {
				draft.enrolledCourses[courseId] = {
					lives,
					progress,
					completedLessons,
					homeworkStatus: {},
				}
			})
		},
		updateLives: (
			state,
			action: PayloadAction<{ courseId: string; lives: number }>
		) => {
			const { courseId, lives } = action.payload
			if (state.enrolledCourses[courseId]) {
				return produce(state, draft => {
					draft.enrolledCourses[courseId].lives = lives
				})
			}
			return state
		},
		updateProgress: (
			state,
			action: PayloadAction<{ courseId: string; progress: number }>
		) => {
			const { courseId, progress } = action.payload
			if (state.enrolledCourses[courseId]) {
				return produce(state, draft => {
					draft.enrolledCourses[courseId].progress = progress
				})
			}
			return state
		},
		addCompletedLesson: (
			state,
			action: PayloadAction<{ courseId: string; lessonId: string }>
		) => {
			const { courseId, lessonId } = action.payload
			if (state.enrolledCourses[courseId]) {
				return produce(state, draft => {
					if (
						!draft.enrolledCourses[courseId].completedLessons.includes(lessonId)
					) {
						draft.enrolledCourses[courseId].completedLessons.push(lessonId)
					}
				})
			}
			return state
		},
		setHomeworkStatus: (
			state,
			action: PayloadAction<{
				courseId: string
				lessonId: string
				isCompleted: boolean
			}>
		) => {
			const { courseId, lessonId, isCompleted } = action.payload
			if (state.enrolledCourses[courseId]) {
				return produce(state, draft => {
					draft.enrolledCourses[courseId].homeworkStatus[lessonId] = isCompleted
				})
			}
			return state
		},
		clearUser: state => {
			return produce(state, draft => {
				draft.userId = null
				draft.username = null
				draft.email = null
				draft.role = null
				draft.lives = 0
				draft.progress = 0
				draft.enrolledCourses = {}
			})
		},
		clearToken: state => {
			// New action to clear the token
			localStorage.removeItem('token')
		},
	},
})

export const {
	login,
	setUser,
	setCourseInfo,
	updateLives,
	updateProgress,
	addCompletedLesson,
	setHomeworkStatus,
	clearUser,
	clearToken, // Export the new action
} = userSlice.actions

export default userSlice.reducer

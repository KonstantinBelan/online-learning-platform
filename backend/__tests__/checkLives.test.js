const checkLives = require('../middleware/checkLives')
const UserCourseProgress = require('../models/userCourseProgress')
const Enrollment = require('../models/Enrollment')

describe('checkLives middleware', () => {
  it('should decrement lives in both UserCourseProgress and Enrollment if 24 hours have passed', async () => {
    // Arrange
    const mockRequest = {
      params: { courseId: 'course123' },
      user: { _id: 'user123' },
    }
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    const mockNext = jest.fn()

    const mockUserCourseProgress = {
      userId: 'user123',
      courseId: 'course123',
      lives: 3,
      lastLessonStartTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 часа назад
      save: jest.fn(),
    }
    const mockEnrollment = {
      user: 'user123',
      course: 'course123',
      lives: 3,
      save: jest.fn(),
    }

    UserCourseProgress.findOne = jest.fn().mockResolvedValue(mockUserCourseProgress)
    Enrollment.findOne = jest.fn().mockResolvedValue(mockEnrollment)

    // Act
    await checkLives(mockRequest, mockResponse, mockNext)

    // Assert
    expect(mockUserCourseProgress.lives).toBe(2)
    expect(mockEnrollment.lives).toBe(2)
    expect(mockUserCourseProgress.save).toHaveBeenCalled()
    expect(mockEnrollment.save).toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalled() // Убеждаемся, что вызван next()
  })
})

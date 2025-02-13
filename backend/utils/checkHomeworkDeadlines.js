const Lesson = require('../models/Lesson')
const HomeworkSubmission = require('../models/HomeworkSubmission')
const Enrollment = require('../models/Enrollment')

const checkHomeworkDeadlines = async () => {
	try {
		console.log('Checking homework deadlines...')

		// 1. Получаем все уроки с домашними заданиями
		const lessonsWithHomework = await Lesson.find({ hasHomework: true })

		// 2. Для каждого урока проверяем, есть ли студенты, которые не сдали домашнее задание в срок
		for (const lesson of lessonsWithHomework) {
			// 2.1. Вычисляем дедлайн для урока (дата создания урока + homeworkDeadline)
			const deadline = new Date(
				lesson.createdAt.getTime() + lesson.homeworkDeadline * 60 * 60 * 1000
			) // Добавляем часы

			// 2.2. Получаем всех студентов, записанных на курс, к которому относится урок
			const enrollments = await Enrollment.find({ course: lesson.course })

			// 2.3. Для каждого студента проверяем, сдал ли он домашнее задание
			for (const enrollment of enrollments) {
				// 2.3.1. Проверяем, сдал ли студент домашнее задание
				const submission = await HomeworkSubmission.findOne({
					user: enrollment.user,
					lesson: lesson._id,
				})

				// 2.3.2. Если студент не сдал домашнее задание и дедлайн уже прошел
				if (!submission && new Date() > deadline) {
					console.log(
						`Student ${enrollment.user} did not submit homework for lesson ${lesson._id}`
					)

					// 2.3.3. Списываем жизнь
					enrollment.lives -= 1
					await enrollment.save()

					console.log(
						`Life deducted from student ${enrollment.user}. Remaining lives: ${enrollment.lives}`
					)

					// 2.3.4. Если у студента не осталось жизней, закрываем ему доступ к курсу
					if (enrollment.lives <= 0) {
						console.log(
							`Student ${enrollment.user} has no more lives. Access to the course is closed.`
						)
						// Здесь можно добавить логику для закрытия доступа к курсу
					}
				}
			}
		}

		console.log('Homework deadlines checked.')
	} catch (error) {
		console.error('Error checking homework deadlines:', error)
	}
}

module.exports = checkHomeworkDeadlines

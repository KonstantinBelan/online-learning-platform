import React from 'react'
import { Link } from 'react-router-dom' // Если используешь React Router
import { Course } from '../../../types/Course'
import styles from './CourseCard.module.css' // Если используешь CSS-модули

interface CourseCardProps {
	course: Course
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
	return (
		<Link to={`/cabinet/courses/${course._id}`} className={styles.card}>
			{' '}
			{/* Ссылка на страницу курса */}
			{course.imageUrl && (
				<img
					src={course.imageUrl}
					alt={course.title}
					className={styles.image}
				/>
			)}
			<div className={styles.content}>
				<h3 className={styles.title}>{course.title}</h3>
				<p className={styles.description}>{course.description}</p>
				<p className={styles.category}>Категория: {course.category}</p>{' '}
				{/* Отображение категории */}
				<p className={styles.price}>
					Цена: {course.price ? `${course.price} $` : 'Бесплатно'}
				</p>{' '}
				{/* Отображение цены */}
			</div>
		</Link>
	)
}

export default CourseCard

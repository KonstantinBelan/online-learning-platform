import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../redux/store'
import { clearUser } from '../../redux/features/userSlice'

const Layout: React.FC = () => {
	const user = useSelector((state: RootState) => state.user)
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const handleLogout = () => {
		localStorage.removeItem('token')
		dispatch(clearUser())
		navigate('/') // Redirect to home page after logout
	}

	return (
		<div>
			<header>
				<h1>Online Learning Platform</h1>
				<nav>
					<ul>
						<li>
							<Link to='/'>Главная</Link>
						</li>
						<li>
							<Link to='/courses'>Курсы</Link>
						</li>
						{user.userId ? (
							<li>
								<Link to='/profile'>Профиль</Link>
							</li>
						) : null}
						{user.userId ? (
							<li>
								<Link to='/cabinet'>Кабинет ученика</Link>
							</li>
						) : null}
						{/* Admin Link (Visible only to admins) */}
						{user.role === 'admin' && (
							<li>
								<Link to='/admin'>Админ-панель</Link>
							</li>
						)}
					</ul>
					{/* Login/Logout buttons */}
					<div>
						{user.userId ? (
							<button onClick={handleLogout}>Выйти</button>
						) : (
							<Link to='/auth'>Войти</Link>
						)}
					</div>
				</nav>
			</header>

			<main>
				<Outlet /> {/* Здесь будет отображаться контент текущей страницы */}
			</main>

			<footer>
				<p>&copy; 2023 Online Learning Platform</p>
			</footer>
		</div>
	)
}

export default Layout

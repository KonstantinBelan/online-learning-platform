import './index.css'
import React, { useEffect, useState } from 'react'
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import HomePage from './pages/Home/HomePage'
import CoursesPage from './pages/Courses/CoursesPage'
import CoursePage from './pages/Course/CoursePage'
import ProfilePage from './pages/Profile/ProfilePage'
import AuthPage from './pages/Auth/AuthPage'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './redux/store'
import { login, clearUser } from './redux/features/userSlice'
import { API_BASE_URL } from './config'
import AdminPage from './pages/AdminPage/AdminPage'
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './redux/store'

import Profile from './components/Cabinet/Profile/Profile'
import CourseList from './components/Cabinet/CourseList/CourseList'
import CourseDetails from './components/Cabinet/CourseDetails/CourseDetails'
import LessonDetails from './components/Cabinet/LessonDetails/LessonDetails'

function App() {
  const user = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)

  const clearAuthData = () => {
    console.log('clearAuthData is being called!')
    localStorage.removeItem('token')
    dispatch(clearUser())
  }

  useEffect(() => {
    console.log('App mounted or rehydrated')
    if (user._persist && user._persist.rehydrated) {
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [user._persist?.rehydrated, dispatch])

  const handleLogout = () => {
    clearAuthData()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  console.log('User object:', user)

  return (
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path='courses' element={<CoursesPage />} />
            <Route path='cabinet' element={<Profile />} />
            <Route path='/cabinet/courses' element={<CourseList />} />
            <Route path='/cabinet/courses/:id' element={<CourseDetails />} />
            <Route path='/cabinet/courses/:id/lessons/:lessonId' element={<LessonDetails />} />
            <Route path='course/:courseId' element={user.userId ? <CoursePage /> : <Navigate to='/auth' replace />} />
            <Route path='profile' element={user.userId ? <ProfilePage handleLogout={handleLogout} /> : <Navigate to='/auth' replace />} />
            <Route path='auth' element={<AuthPage />} />
            <Route path='/admin' element={user.role === 'admin' ? <AdminPage /> : <Navigate to='/' replace />} />
            <Route path='/admin/dashboard' element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to='/' replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PersistGate>
  )
}

export default App

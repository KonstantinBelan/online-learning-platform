import React from 'react'
import { useSelector } from 'react-redux'
import AdminHomeworkList from '../../components/AdminHomeworkList/AdminHomeworkList'
import AdminCourseList from '../../components/AdminCourse/AdminCourseList'
import LessonCompletionsTable from '../../components/LessonCompletionsTable/LessonCompletionsTable'

const AdminPage: React.FC = () => {
  const role = useSelector((state: RootState) => state.user.role)

  if (role !== 'admin') {
    return <Navigate to='/' /> // Перенаправляем, если не админ
  }

  return (
    <div>
      <h1>Панель администратора</h1>
      <AdminHomeworkList />
      <AdminCourseList />
      <LessonCompletionsTable />
    </div>
  )
}

export default AdminPage

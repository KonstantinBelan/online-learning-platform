import React from 'react'
import { useSelector } from 'react-redux'
import EnrollmentManagement from '../../../components/Admin/EnrollmentManagement/EnrollmentManagement'

const AdminDashboard: React.FC = () => {
  const role = useSelector((state: RootState) => state.user.role)

  if (role !== 'admin') {
    return <Navigate to='/' /> // Перенаправляем, если не админ
  }

  return (
    <div>
      <h1>Привет, Админ</h1>
      <EnrollmentManagement />
    </div>
  )
}

export default AdminDashboard

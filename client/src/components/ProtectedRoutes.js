import { Navigate, Outlet } from "react-router"

const useAuth = () => {
  const user = Boolean(sessionStorage.getItem("stenggUsername"))
  return user
}

const ProtectedRoutes = () => {
  const isAuth = useAuth()
  return isAuth ? <Outlet /> : <Navigate to="/" />
}

export default ProtectedRoutes
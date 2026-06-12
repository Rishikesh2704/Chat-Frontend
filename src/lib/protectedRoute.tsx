import { Navigate } from "react-router"

export default function ProtectedRoute ({children}:{children:React.ReactNode}){
    const user = JSON.parse(localStorage.getItem('Current_User')as string)
    return user?children:<Navigate to="/authentication/login"></Navigate>
}
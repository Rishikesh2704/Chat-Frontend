import { useLocation } from 'react-router'
import './Navbar.css'
export default function Navbar(){
    const page = useLocation();
    const pagePath = page.pathname
    const icons = [
        {id:23, name:'/',icon:"fa-solid fa-message", path:'/',},
        {id:2, name:'calls',icon:"fa-solid fa-phone",  path:'/calls'},
        {id:13, name:'account',icon:"fa-solid fa-circle-user",  path:'/account'},
    ]
    return(
        <nav >
            {icons.map( (icon) => (
                    <a className={`${pagePath===icon.path ?"selectedPage":''}`} href={`/${icon.name}`} aria-label={icon.name}>
                        <i className={icon.icon}></i>
                    </a>
            ) )}
        </nav>
    )
}
import './Navbar.css'
export default function Navbar(){
    const icons = [
        {id:23, name:'messages',icon:"fa-solid fa-message"},
        {id:13, name:'account',icon:"fa-solid fa-circle-user"},
        {id:2, name:'calls',icon:"fa-solid fa-phone"},
    ]
    return(
        <nav >
            {icons.map( (icon) => (
                    <a  href={`/${icon.name}`} aria-label={icon.name}>
                        <i className={icon.icon}></i>
                    </a>
            ) )}
        </nav>
    )
}
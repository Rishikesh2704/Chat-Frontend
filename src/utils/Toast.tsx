import './toast.css'

type toastProps = {
    type?:string;
    message?:string;
}
export default function Toast(props:toastProps){
    const { type="Alert", message="No Message"} = props;
    return(
        <div className="toastWrapper">
            <h1 className="toastType">{type}</h1>
            <p className="toastMessage">{message}</p>
        </div>
    )
}
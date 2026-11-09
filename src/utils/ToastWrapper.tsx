import { ToastContainer } from "react-toastify";

export default function ToastWrapper() {

  return (
    <ToastContainer
      toastClassName={'Success_Toast'}
      position="bottom-right"
      autoClose={3000}
      hideProgressBar
      newestOnTop={false}
      closeOnClick={false}  
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    //   transition={Bounce}
    />
  );
}

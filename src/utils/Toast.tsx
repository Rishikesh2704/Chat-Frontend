import "./toast.css";
import { useEffect, useState } from "react";
type toastProps = {
  type?: string;
  message?: string;
  time: number;
};
export default function Toast(props: toastProps) {
  const { type = "Alert", message = "No Message", time = 5000 } = props;
  const [showToast, setShowToast] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => {
      setShowToast(false);
    }, time);
  }, []);
  return (
    <>
      {showToast&&
        <div className="toastWrapper">
          <h1 className="toastType">{type}</h1>
          <p className="toastMessage">{message}</p>
        </div>
      }
    </>
  );
}

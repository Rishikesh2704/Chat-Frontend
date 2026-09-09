import { useEffect } from "react";

export const useOutsideElement = (
  element: React.RefObject<any>,
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {

  useEffect(() => {
    if (!element.current) {
      console.log("No Element");
      return;
    }
    const windowListener = (e: PointerEvent) => {
        const ele = element.current;
        if(e.target != ele){
            setIsVisible(false)
        }
    };

    document.addEventListener("click",windowListener);

    return () => {
      document.removeEventListener("click", windowListener);
    };
  }, [element.current]);
};

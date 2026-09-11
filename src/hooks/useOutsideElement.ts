import { useEffect } from "react";

export const useOutsideElement = (
  element: React.RefObject<any>,
  closeElement:() => void
) => {

  useEffect(() => {
    if (!element.current) {
      return;
    }

    const windowListener = (e: PointerEvent) => {
        const ele = element.current;
        if(e.target != ele){
           closeElement();
        }
    };

    document.addEventListener("click",windowListener);

    return () => {
      document.removeEventListener("click", windowListener);
    };
  }, [element.current]);
};

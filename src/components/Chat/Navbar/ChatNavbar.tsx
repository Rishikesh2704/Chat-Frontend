import { useRef } from "react";
import "./ChatNavbar.css";
export const ChatNavbar = ({
  setSection,
}: {
  setSection: React.Dispatch<React.SetStateAction<null | string>>;
}) => {
  const handleOnClick = (section: string) => {
    const markedEle = document.getElementsByClassName(
      "Marked",
    )[0] as HTMLDivElement;

    const pos = section == "messages" ? "0" : "50%";
    markedEle?.style.setProperty("--markedPos", pos);

    setSection(section);
  };
  return (
    <div className="Header">
      <button className="Section" onClick={() => handleOnClick("messages")}>
        <h1 className="Heading">Messages</h1>
      </button>
      <button className="Section" onClick={() => handleOnClick('calls')}>
        <h1 className="Heading">Calls</h1>
      </button>
      <div className="Marked"></div>
    </div>
  );
};

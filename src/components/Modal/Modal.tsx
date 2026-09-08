import "./Modal.css";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setViewModal } from "../../redux/Slicers/ModalSlice";

import { AddMembersModal } from "./AddMembersModal";
import { RemoveMemberModal } from "./RemoveMemberModal";
import { CreateGroupModal } from "./CreateGroupModal";

export const Modal = () => {
  const { modalType } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();

  const modalTypes: any = {
    addMember: <AddMembersModal />,
    removeMember: <RemoveMemberModal />,
    createGroup: <CreateGroupModal />,
  };

  const handleCloseModal = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const element = e.target as HTMLDivElement;
    if (element.classList.contains("Modal_Background")) {
      dispatch(setViewModal(false));
      document.getElementsByTagName("main")[0].style.alignItems = "center";
    }
  };

  return (
    <div className="Modal_Background" onClick={handleCloseModal}>
      <div className="Modal_Box">{modalTypes[modalType]}</div>
    </div>
  );
};

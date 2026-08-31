export default function withModal(WrappedComponent: any) {
  return function ModalComponent(props: any) {
    const handleCloseModal = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
      const element = e.target as HTMLDivElement;
      if (element.classList.contains("Modal_Background")) {
        // setViewModal(false);
        document.getElementsByTagName("main")[0].style.alignItems = "center";
      }
    };
    return (
      <div className="Modal_Background" onClick={handleCloseModal}>
        <div className="Modal_Box">
          <WrappedComponent {...props} />
        </div>
      </div>
    );
  };
}

const Modal = ({ code, show, onClose }) => {
  if (!show) {
    return null;
  }
  return (
    <>
      <div
        className="modal fixed left-0 top-0 right-0 bottom-0 bg-black/50 flex justify-center"
        onClick={onClose}
      >
        <div
          className="modal-content w-96 bg-white h-min"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header p-10">
            {/* <h4 className="modal-title m-0">Modal title</h4> */}
          </div>
          <div className="modal-body p-10 border">
            <pre>{code}</pre>
          </div>
          <div className="modal-footer p-10">
            <button className="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Modal;

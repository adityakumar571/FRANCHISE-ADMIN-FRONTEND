import { X } from "lucide-react";

const Modal = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[95%] max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">{title}</h2>

        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

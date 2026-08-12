const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300
        ${checked ? "bg-green-500" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300
          ${checked ? "translate-x-5" : "translate-x-1"}`}
      />
    </button>
  );
};

export default ToggleSwitch;

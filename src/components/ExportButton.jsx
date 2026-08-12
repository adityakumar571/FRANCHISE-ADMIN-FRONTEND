// ExportButton.jsx
const ExportButton = ({ onClick, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-[#0c3b73] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Exporting..." : "Export Excel"}
    </button>
  )
}

export default ExportButton

type ViewModeSwitcherProps = {
  viewMode: "table" | "kanban";
  setViewMode: (mode: "table" | "kanban") => void;
};

export default function ViewModeSwitcher({ viewMode, setViewMode }: ViewModeSwitcherProps) {
  return (
    <>
      <button
        onClick={() => setViewMode("table")}
        className={`px-6 py-2 rounded-md font-bold transition duration-300 shadow-md ${
          viewMode === "table"
            ? "bg-orange-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Tabela
      </button>
      <button
        onClick={() => setViewMode("kanban")}
        className={`px-6 py-2 rounded-md font-bold transition duration-300 shadow-md ${
          viewMode === "kanban"
            ? "bg-orange-500 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Kanban
      </button>
    </>
  );
}

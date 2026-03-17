export default function EmptyState({ message = 'No results found', sub = '', onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-12 h-12 rounded-lg border-2 border-dashed border-[#2a2a3e] flex items-center justify-center mb-4" aria-hidden="true">
        <span className="text-[#6a6a7a] text-xl">☐</span>
      </div>
      <p className="text-[#8a8a9a] text-sm font-medium mb-1">{message}</p>
      {sub && <p className="text-[#6a6a7a] text-xs mb-4">{sub}</p>}
      {onClear && (
        <button onClick={onClear} className="text-xs text-[#D94819] hover:underline mt-1">
          Clear filters
        </button>
      )}
    </div>
  );
}

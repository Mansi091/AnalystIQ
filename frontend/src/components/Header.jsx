function Header({ handleClearSession, hasActiveDataset }) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Autonomous Data Agent
      </h1>
      {hasActiveDataset && (
        <button
          onClick={handleClearSession}
          className="text-xs px-2.5 py-1.5 rounded-none border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors font-semibold"
        >
          Clear Session
        </button>
      )}
    </header>
  );
}

export default Header;

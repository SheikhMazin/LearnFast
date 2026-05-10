function CardFrame({ children, isLoading }) {
  return (
    <div className="bg-[#1c1f2e] border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden min-h-72">
      {isLoading ? (
        <div className="flex items-center justify-center h-72">
          <div className="w-8 h-8 rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default CardFrame;

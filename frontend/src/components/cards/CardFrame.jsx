function CardFrame({ children, isLoading }) {
  return (
    <div className="notebook-card min-h-80">
      {isLoading ? (
        <div className="flex items-center justify-center h-72">
          <div
            className="w-8 h-8 rounded-full border-4 border-transparent animate-spin"
            style={{ borderTopColor: "var(--green)" }}
          />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default CardFrame;

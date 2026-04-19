const SearchBar = ({ value, onChange, onSubmit, onClear }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center" }}>
      <div style={{ position: "relative", width: "320px", maxWidth: "42vw" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Search this conversation..."
          style={{
            width: "100%",
            padding: "10px 40px 10px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "#fff",
          }}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#e2e8f0",
              color: "#0f172a",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        ) : null}
      </div>
      <button
        type="submit"
        style={{
          marginLeft: "1px",
          padding: "10px 20px",
          backgroundColor: "#f8fbff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        <img className="qt-icon qt-icon--sm" src="/QT%20icons/search.png" alt="" 
          style={{  width: "20px", height: "20px"}}
        />
      </button>
    </form>
  );
};

export default SearchBar;
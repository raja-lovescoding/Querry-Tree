const SearchBar = ({ value, onChange, onSubmit, onClear }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-field-wrap">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Search this conversation..."
          className="search-input"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            className="search-clear"
          >
            ×
          </button>
        ) : null}
      </div>
      <button
        type="submit"
        className="search-submit"
      >
        <img className="qt-icon qt-icon--sm" src="/QT%20icons/search.png" alt="" 
          className="search-submit-icon"
        />
      </button>
    </form>
  );
};

export default SearchBar;
import React from "react";

interface SearchBarProps {
  searchQuery: string;
  setSearch: (t: string) => void;
  disabled: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearch,
  disabled,
}) => {
  return (
    <div className="flex px-3 py-1 items-center border border-solid border-light-gray bg-white rounded-lg">
      <img src="./assets/search.svg" alt="search icon" className="mr-2.5"></img>
      <input
        type="text"
        className="w-72 outline-none"
        placeholder="Search..."
        autoComplete="off"
        value={searchQuery}
        maxLength={50}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

export default SearchBar;

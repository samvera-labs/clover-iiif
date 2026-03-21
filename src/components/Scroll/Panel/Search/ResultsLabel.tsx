import React from "react";
import { searchResultsLabel } from "./Search.css";

interface SearchAnnotationsResultsLabelProps {
  activeIndex: number;
  searchString: string;
  total: number;
}

const SearchAnnotationsResultsLabel: React.FC<
  SearchAnnotationsResultsLabelProps
> = ({ activeIndex, searchString, total }) => {
  const message =
    total === 0 ? (
      <>
        No results for <strong>{searchString}</strong>
      </>
    ) : (
      <>
        {activeIndex + 1} of {total} results for <strong>{searchString}</strong>
      </>
    );

  return <div className={searchResultsLabel}>{message}</div>;
};

export default SearchAnnotationsResultsLabel;

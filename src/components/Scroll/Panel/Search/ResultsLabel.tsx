import { StyledSearchAnnotationsResultsLabel } from "./Search.styled";

const SearchAnnotationsResultsLabel = ({
  activeIndex,
  searchString,
  total,
}) => {
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

  return (
    <StyledSearchAnnotationsResultsLabel>
      {message}
    </StyledSearchAnnotationsResultsLabel>
  );
};

export default SearchAnnotationsResultsLabel;

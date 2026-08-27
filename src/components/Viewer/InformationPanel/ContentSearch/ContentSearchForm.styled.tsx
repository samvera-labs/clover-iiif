import { styled } from "src/styles/stitches.config";

/**
 * Layout only.
 *
 * The field and the submit button are the shared `SearchInput` and `ControlStyled` — the same
 * two components the Slider's filter uses. This file used to restyle both from scratch, which
 * is how the placeholder ended up pinned to `#0006` and the button kept an accent fill and a
 * drop shadow after the rest of the library had moved on.
 */
const FormStyled = styled("div", {
  form: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "100%",
    // The one source of spacing between the field and the button.
    gap: "1rem",
    padding: "0 1.618rem 1.618rem",

    ".content-search-input": {
      display: "flex",
      flexGrow: "1",
      // Lets the field shrink inside the panel rather than pushing the button out of it.
      minWidth: "0",
    },
  },
});

export { FormStyled };

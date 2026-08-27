import { styled } from "src/styles/stitches.config";

/**
 * The one search field.
 *
 * Shared by the Slider's filter and the Viewer's content search, which had drifted into two
 * inputs that only looked roughly alike. The content search version pinned its placeholder
 * to `#0006` — a hardcoded translucent black, so on a dark theme it was near-black text on a
 * near-black field and effectively invisible. Both halves are tokens here, so the field flips
 * with the theme.
 *
 * Carries no width ceiling. How wide the field may grow depends on what sits beside it — the
 * Slider's header shares a row with its controls, the content search form has the panel to
 * itself — so that belongs to the host.
 */
const SearchInput = styled("input", {
  flexGrow: "1",
  minWidth: "0",
  width: "100%",
  height: "2rem",
  padding: "0 1rem",
  border: "none",
  borderRadius: "2rem",
  backgroundColor: "$secondaryMuted",
  color: "$primary",
  fontFamily: "inherit",
  fontSize: "1rem",
  lineHeight: "1rem",

  "&::placeholder": {
    color: "$primaryMuted",
  },
});

export { SearchInput };

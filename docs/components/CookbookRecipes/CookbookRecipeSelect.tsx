import React, { useEffect, useId, useMemo, useState } from "react";

import cookbookRecipesJson from "src/fixtures/iiif-cookbook/recipes.json";
import { styled } from "src/styles/stitches.config";
import { useRouter } from "next/router";

export type CookbookRecipeCategory =
  | "Basic"
  | "IIIF Properties"
  | "Structuring Resources"
  | "Image"
  | "Audio/Visual"
  | "Annotation"
  | "Content State";

export interface CookbookRecipe {
  title: string;
  id: string;
  resource: string;
  supported: boolean;
  category: CookbookRecipeCategory[];
}

export const cookbookRecipes = cookbookRecipesJson as CookbookRecipe[];
const showUnsupportedRecipes = process.env.NODE_ENV === "development";

const CookbookRecipeSelect: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const router = useRouter();

  const activeResource =
    typeof router.query["iiif-content"] === "string"
      ? router.query["iiif-content"]
      : undefined;

  const activeRecipe = useMemo(() => {
    const matches = cookbookRecipes.filter(
      (recipe) => recipe.resource === activeResource,
    );

    return matches.length === 1 ? matches[0] : undefined;
  }, [activeResource]);

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visibleRecipes = showUnsupportedRecipes
      ? cookbookRecipes
      : cookbookRecipes.filter((recipe) => recipe.supported);

    if (!normalizedQuery) {
      return visibleRecipes;
    }

    return visibleRecipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  useEffect(() => {
    if (activeRecipe) {
      setQuery(activeRecipe.title);
    }
  }, [activeRecipe]);

  const handleSelect = (recipe: CookbookRecipe) => {
    setQuery(recipe.title);
    setIsOpen(false);
    router.push(
      {
        query: {
          ...router.query,
          "iiif-content": recipe.resource,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (filteredRecipes.length > 0) {
      handleSelect(filteredRecipes[0]);
    }
  };

  return (
    <StyledCookbookRecipeSelect onSubmit={handleSubmit}>
      <label htmlFor={listboxId}>Cookbook recipe</label>
      <div className="input-wrap">
        <input
          aria-autocomplete="list"
          aria-controls={`${listboxId}-listbox`}
          aria-expanded={isOpen}
          autoComplete="off"
          id={listboxId}
          onBlur={() => setIsOpen(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search cookbook recipes"
          role="combobox"
          type="text"
          value={query}
        />
        <span aria-hidden="true" className="caret" />
      </div>
      {isOpen && (
        <ul id={`${listboxId}-listbox`} role="listbox">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <li key={recipe.id} role="option">
                <button
                  data-supported={recipe.supported}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(recipe)}
                  type="button"
                >
                  <span>{recipe.title}</span>
                  <small>{recipe.category.join(", ")}</small>
                </button>
              </li>
            ))
          ) : (
            <li className="empty">No matching recipes</li>
          )}
        </ul>
      )}
    </StyledCookbookRecipeSelect>
  );
};

const StyledCookbookRecipeSelect = styled("form", {
  margin: "1rem auto 0",
  position: "relative",
  width: "100%",

  label: {
    display: "none",
  },

  ".input-wrap": {
    position: "relative",
  },

  input: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    border: "0",
    borderRadius: "0.5rem",
    color: "inherit",
    display: "block",
    fontFamily: "inherit",
    fontSize: "1rem",
    lineHeight: "1.25",
    padding: "0.75rem 3rem 0.75rem 1.25rem",
    transition: "$all",
    width: "100%",

    "&:focus": {
      backgroundColor: "$secondary",
      outline: "2px solid $accent",
      outlineOffset: "2px",
    },
  },

  ".caret": {
    borderLeft: "0.35rem solid transparent",
    borderRight: "0.35rem solid transparent",
    borderTop: "0.42rem solid $accent",
    pointerEvents: "none",
    position: "absolute",
    right: "1.15rem",
    top: "50%",
    transform: "translateY(-50%)",
  },

  "ul[role='listbox']": {
    backgroundColor: "$secondary",
    border: "1px solid $secondaryMuted",
    borderRadius: "0.5rem",
    boxShadow: "3px 3px 8px #0003",
    left: "0",
    listStyle: "none",
    margin: "0.25rem 0 0",
    maxHeight: "20rem",
    overflowY: "auto",
    padding: "0.25rem",
    position: "absolute",
    right: "0",
    zIndex: "20",
  },

  "li[role='option']": {
    margin: "0",
  },

  button: {
    alignItems: "flex-start",
    backgroundColor: "transparent",
    border: "0",
    borderRadius: "0.375rem",
    color: "$primary",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    fontFamily: "inherit",
    gap: "0.2rem",
    padding: "0.55rem 0.65rem",
    textAlign: "left",
    width: "100%",

    "&:hover, &:focus": {
      backgroundColor: "$secondaryMuted",
      color: "$accent",
      outline: "none",
    },
  },

  'button[data-supported="false"]': {
    color: "$primaryMuted",
    opacity: "0.55",

    small: {
      color: "$primaryMuted",
    },

    "&:hover, &:focus": {
      color: "$primaryMuted",
    },
  },

  span: {
    fontSize: "0.95rem",
    lineHeight: "1.25",
  },

  small: {
    color: "$primaryMuted",
    fontSize: "0.75rem",
    lineHeight: "1.2",
  },

  ".empty": {
    color: "$primaryMuted",
    fontSize: "0.9rem",
    margin: "0",
    padding: "0.65rem",
  },

  ".dark & input": {
    backgroundColor: "rgba(249, 250, 251, 0.1)",
  },
});

export default CookbookRecipeSelect;

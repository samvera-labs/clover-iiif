import React, { useEffect, useId, useMemo, useState } from "react";

import cookbookRecipesJson from "src/fixtures/iiif-cookbook/recipes.json";
import styles from "docs/components/CookbookRecipes/CookbookRecipeSelect.module.css";
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
    <form className={styles.select} onSubmit={handleSubmit}>
      <label htmlFor={listboxId}>Cookbook recipe</label>
      <div className={styles.inputWrap}>
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
        <span aria-hidden="true" className={styles.caret} />
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
            <li className={styles.empty}>No matching recipes</li>
          )}
        </ul>
      )}
    </form>
  );
};

export default CookbookRecipeSelect;

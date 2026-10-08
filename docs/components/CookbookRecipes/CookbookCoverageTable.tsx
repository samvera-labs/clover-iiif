import React from "react";

import { cookbookSections } from "docs/components/CookbookRecipes/cookbookSections";
import {
  coverage,
  partialNotes,
  recipeBase,
  resourceFor,
  statusFor,
  type Status,
} from "docs/components/CookbookRecipes/cookbookCatalog";
import styles from "docs/components/CookbookRecipes/CookbookCoverageTable.module.css";

const labels: Record<Status, string> = {
  yes: "Supported",
  partial: "Partial",
  no: "Not yet",
};

const icons: Record<Status, React.ReactNode> = {
  yes: <path d="M4 12.5l5 5L20 6.5" />,
  partial: <path d="M5 12h14" />,
  no: <path d="M6 6l12 12M18 6L6 18" />,
};

const StatusIcon: React.FC<{ status: Status }> = ({ status }) => (
  <svg
    className={styles.status}
    data-status={status}
    viewBox="0 0 24 24"
    role="img"
    aria-label={labels[status]}
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <title>{labels[status]}</title>
    {icons[status]}
  </svg>
);

/** An "i" after the title that shows why a recipe is only partly covered, on hover or focus. */
const InfoTip: React.FC<{ note: string }> = ({ note }) => (
  <button
    type="button"
    className={styles.info}
    aria-label={`Note: ${note}`}
    data-tooltip={note}
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 11v5.5M12 7.5v.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  </button>
);

interface CookbookCoverageTableProps {
  /** Opens a recipe's resource in the viewer. Keep it stable: the table renders once. */
  onView: (resource: string) => void;
  /** Called when a View control is approached, so the viewer can load ahead of the click. */
  onPreload?: () => void;
}

/**
 * Every recipe the IIIF Cookbook advertises, grouped as on iiif.io, with whether Clover
 * covers it.
 *
 * Memoized and handed only stable props: it is by far the heaviest thing on the page, and
 * nothing it shows changes while the page does. A route change, a field's error message or
 * the viewer opening re-render the page but not these 76 rows.
 */
const CookbookCoverageTable: React.FC<CookbookCoverageTableProps> = ({
  onView,
  onPreload,
}) => (
  <div className={styles.coverage}>
    <p className={styles.summary}>
      <strong>{coverage.yes}</strong> of {coverage.total} recipes supported
      {coverage.partial > 0 && <>, {coverage.partial} partially</>}.
    </p>
    {cookbookSections.map((section) => (
      <section key={section.title}>
        <h4 className={styles.sectionTitle}>{section.title}</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">
                <span className={styles.visuallyHidden}>Supported</span>
              </th>
              <th>Recipe</th>
              <th>Demo</th>
            </tr>
          </thead>
          <tbody>
            {section.recipes.map((recipe) => {
              const status = statusFor(recipe.slug);
              const resource = resourceFor(recipe.slug);
              const note = partialNotes[recipe.slug];
              return (
                <tr key={recipe.slug}>
                  <td>
                    <StatusIcon status={status} />
                  </td>
                  <td>
                    <div className={styles.titleRow}>
                      {resource ? (
                        <button
                          type="button"
                          className={styles.title}
                          onClick={() => onView(resource)}
                          onPointerEnter={onPreload}
                          onFocus={onPreload}
                        >
                          {recipe.title}
                        </button>
                      ) : (
                        recipe.title
                      )}
                      {note && <InfoTip note={note} />}
                    </div>
                    <span className={styles.slug}>{recipe.slug}</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.view}
                        aria-label={`View ${recipe.title}`}
                        disabled={!resource}
                        title={
                          resource ? undefined : "No example resource to open"
                        }
                        onClick={() => resource && onView(resource)}
                        onPointerEnter={onPreload}
                        onFocus={onPreload}
                      >
                        View
                      </button>
                      <a
                        className={styles.view}
                        href={`${recipeBase}${recipe.slug}/`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${recipe.title} recipe on iiif.io (opens in a new tab)`}
                      >
                        Recipe
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    ))}
  </div>
);

export default React.memo(CookbookCoverageTable);

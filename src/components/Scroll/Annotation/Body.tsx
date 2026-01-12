import React, { useContext, useEffect } from "react";

import { EmbeddedResource } from "@iiif/presentation-3";
import { ScrollContext } from "src/context/scroll-context";
import { TextualBody } from "src/components/Scroll/Annotation/Body.styled";
import { getSearchResultSnippet } from "src/lib/search-helpers";
import { getLanguageDirection } from "src/lib/annotation-helpers";
import useMarkdown from "@nulib/use-markdown";

const ScrollAnnotationBody = ({
  body,
  stringLength,
  type = "content",
}: {
  body: EmbeddedResource;
  stringLength?: number;
  type?: string;
}) => {
  const { state } = useContext(ScrollContext);
  const { activeLanguages, searchActiveMatch, searchString } = state;

  let value = String(body.value);

  // Extracting the contextual slice around the searchString without breaking words
  if (type == "snippet")
    value = getSearchResultSnippet({
      searchString,
      content: value,
      stringLength,
    });

  let innerHtml: string | undefined;
  const markdownContent = useMarkdown(value);

  // Converting plain text to HTML if needed
  if (body.format === "text/plain") {
    const regex = /\n/g;
    innerHtml = value?.replace(regex, "<br />");
  }

  // Using the processed markdown as HTML
  if (body.format === "text/markdown") {
    innerHtml = markdownContent?.html;
  }

  // If already HTML, use it directly
  if (body.format === "text/html") {
    innerHtml = value;
  }

  // Highlighting the searchString
  if (String(searchString) && innerHtml) {
    let matchCount = 1;
    const regex = new RegExp(`(${searchString})`, "gi");
    innerHtml = innerHtml?.replace(regex, (match) => {
      const matchId = `${body.id}/${matchCount}`;
      const isActive = searchActiveMatch === matchId;
      matchCount += 1;
      return `<span class="clover-scroll-highlight${isActive ? ` active` : ``}" data-index="${matchId}">${match}</span>`;
    });
  }

  const id = [body.id, type].join("-");
  const isRtl = getLanguageDirection(String(body.language)) === "RTL";
  const dir = isRtl ? "rtl" : "ltr";
  const fontSize = isRtl ? "1.3em" : "1em";
  const lang = String(body.language);

  useEffect(() => {
    // Scroll to the active match
    if (searchActiveMatch) {
      const activeElement = document.querySelector(
        `[data-index="${searchActiveMatch}"]`,
      ) as HTMLElement;
      if (activeElement)
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
    }
  }, [searchActiveMatch]);

  if (!innerHtml) return null;

  return (
    <TextualBody
      dangerouslySetInnerHTML={{ __html: innerHtml }}
      data-active-language={
        !activeLanguages?.length || activeLanguages?.includes(lang)
      }
      data-body-id={id}
      data-testid="scroll-item-body"
      id={id}
      dir={dir}
      css={{ fontSize }}
      lang={lang}
    />
  );
};

export default ScrollAnnotationBody;

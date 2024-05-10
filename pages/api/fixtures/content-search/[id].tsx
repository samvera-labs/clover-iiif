import type { NextApiRequest, NextApiResponse } from "next";
import textCoordintes from "./text_coordinates.json";
import { AnnotationPage } from "@iiif/presentation-3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = req.query.id;
  if (id == undefined || typeof id !== "string") {
    return res.status(200).json({ errror: "missing id" });
  }

  const searchTerm = req.query.q;
  if (searchTerm == undefined || typeof searchTerm !== "string") {
    return res.status(200).json({ errror: "missing search term" });
  }

  const contentSearchResponse = createContentSearchResponse(id, searchTerm);

  return res.status(200).json(contentSearchResponse);
}

function createContentSearchResponse(id: string, searchTerm: string) {
  const annotationPage: AnnotationPage = {
    "@context": "http://iiif.io/api/search/2/context.json",
    id: `http://localhost:3000/api/newspaper_search/${id}?q=${searchTerm}`,
    type: "AnnotationPage",
    items: [],
  };

  textCoordintes.forEach((page) => {
    if (page.issue !== Number(id)) {
      return;
    }

    const matches = page.strings[searchTerm];
    if (matches) {
      matches.forEach((match) => {
        const [stringId, x, y, w, h] = match;
        if (annotationPage.items) {
          annotationPage.items.push({
            id: `http://localhost:3000/manifest/content-search/annotation/${stringId}`,
            type: "Annotation",
            motivation: "highlighting",
            body: {
              type: "TextualBody",
              value: searchTerm,
              format: "text/plain",
            },
            label: {
              none: [`p. ${page.page}`],
            },
            target: `http://localhost:3000/manifest/content-search/canvas/i${id}p${page.page}#xywh=${x},${y},${w},${h}`,
          });
        }
      });
    }
  });
  return annotationPage;
}

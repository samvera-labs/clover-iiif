import type { NextApiRequest, NextApiResponse } from "next";
import path from "node:path";
import Database from "better-sqlite3";

const db = new Database(path.join("tmp", "database.db"));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const objectId = req.query.id;
  // const token = req.headers.authorization?.replace("Bearer ", "");
  const token = "123abc";
  const url = "http://localhost:3000" + req.url;

  if (token === undefined) {
    return res.status(400).json({ error: "no token" });
  }

  const annotations = await fetchAnnotations(objectId, token);
  return res.status(200).json(formatAnnotationPage(annotations, url));
}

async function fetchAnnotations(objectId, token) {
  let annotations = [];

  const stmt = db.prepare(
    `SELECT annotation FROM annotations WHERE object_id = ? AND token = ?;`,
  );
  const rows = stmt.all(objectId, token);

  if (rows.length > 0) {
    annotations = rows.map((row) => {
      const annotation = JSON.parse(row.annotation);
      if (Array.isArray(annotation.body)) {
        annotation.body = [
          {
            id: "https://iiif.io/api/image/3.0/example/reference/4ce82cef49fb16798f4c2440307c3d6f-newspaper-p1/full/150,/0/default.jpg",
            type: "Image",
            format: "image/jpeg",
          },
        ].concat(annotation.body);
      } else {
        annotation.body = [
          {
            id: "https://iiif.io/api/image/3.0/example/reference/4ce82cef49fb16798f4c2440307c3d6f-newspaper-p1/full/150,/0/default.jpg",
            type: "Image",
            format: "image/jpeg",
          },
          annotation.body,
        ];
      }
      return annotation;
    });
  }

  return annotations;
}

function formatAnnotationPage(annotations, url) {
  return {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: url,
    type: "AnnotationPage",
    label: { none: ["Clippings"] },
    items: annotations,
  };
}
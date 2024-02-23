import type { NextApiRequest, NextApiResponse } from "next";
import path from "node:path";
import Database from "better-sqlite3";

const db = new Database(path.join("tmp", "database.db"));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const canvas = req.query.canvas;
  const userId = req.query.userId;
  const url = (req.headers?.referer || "") + req.url;

  if (canvas === undefined) {
    return res.status(200).json({ message: "no canvas" });
  }

  if (req.method === "GET") {
    const annotationPage = await fetchAnnotations(canvas, userId, url);
    return res.status(200).json(annotationPage);
  } else if (req.body === undefined) {
    return res.status(400).json({ error: "body is missing" });
  } else if (req.method === "POST") {
    const newAnnotation = req.body;
    const annotationPage = await fetchAnnotations(canvas, userId, url);
    if (annotationPage.items.length > 0) {
      annotationPage.items.push(newAnnotation);
      const stmt = db.prepare(
        "UPDATE annotations set annotations = ? WHERE canvas = ?",
      );
      stmt.run(JSON.stringify(annotationPage), canvas);
    } else {
      annotationPage.items.push(newAnnotation);
      const stmt = db.prepare(
        "INSERT INTO annotations (canvas, annotations, user_id) VALUES (?, ?, ?)",
      );
      stmt.run(canvas, JSON.stringify(annotationPage), userId);
    }

    return res.status(200).json({ message: "create annotation" });
  } else if (req.method === "PUT") {
    const updatedAnnotation = req.body;
    const annotationPage = await fetchAnnotations(canvas, userId, url);
    annotationPage.items = annotationPage.items.filter((annotation) => {
      return annotation.id !== updatedAnnotation.id;
    });
    annotationPage.items.push(updatedAnnotation);
    const stmt = db.prepare(
      "UPDATE annotations set annotations = ? WHERE canvas = ?",
    );
    stmt.run(JSON.stringify(annotationPage), canvas);

    return res.status(200).json({ message: "annotation is updated" });
  } else if (req.method === "DELETE") {
    const updatedAnnotation = req.body;
    const annotationPage = await fetchAnnotations(canvas, userId, url);
    annotationPage.items = annotationPage.items.filter((annotation) => {
      return annotation.id !== updatedAnnotation.id;
    });
    const stmt = db.prepare(
      "UPDATE annotations set annotations = ? WHERE canvas = ?",
    );
    stmt.run(JSON.stringify(annotationPage), canvas);

    return res.status(200).json({ message: "annotation is deleted" });
  }
}

async function fetchAnnotations(canvas, userId, url) {
  let annotationPage;

  const stmt = db.prepare(
    "SELECT annotations FROM annotations WHERE canvas = ?",
  );
  const row = stmt.get(canvas);

  if (row) {
    annotationPage = JSON.parse(row.annotations);
  } else {
    annotationPage = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: url,
      type: "AnnotationPage",
      items: [],
    };
  }

  return annotationPage;
}

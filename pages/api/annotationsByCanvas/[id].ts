import type { NextApiRequest, NextApiResponse } from "next";
import path from "node:path";
import Database from "better-sqlite3";

const db = new Database(path.join("tmp", "database.db"));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const objectId = req.query.id;
  const { canvas, annotation } = req.body;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const url = "http://localhost:3000/" + req.url;

  if (canvas === undefined) {
    return res.status(400).json({ error: "no canvas" });
  }
  if (token === undefined) {
    return res.status(400).json({ error: "no token" });
  }

  // fetch
  if (req.query.action === "GET") {
    const annotations = await fetchAnnotations(canvas, objectId, token);
    return res.status(200).json(formatAnnotationPage(annotations, url));
  } else if (req.body === undefined) {
    return res.status(400).json({ error: "body is missing" });

    // create
  } else if (req.method === "POST") {
    const stmt = db.prepare(
      `INSERT INTO annotations (annotation, canvas, object_id, token, annotation_id)
      VALUES (?, ?, ?, ?, ?)`,
    );
    stmt.run(
      JSON.stringify(annotation),
      canvas,
      objectId,
      token,
      annotation.id,
    );

    return res.status(200).json({ message: "create annotation" });

    // update
  } else if (req.method === "PUT") {
    const stmt = db.prepare(
      "UPDATE annotations set annotation = ? WHERE annotation_id = ?",
    );
    stmt.run(JSON.stringify(annotation), annotation.id);

    return res.status(200).json({ message: "annotation is updated" });

    // delete
  } else if (req.method === "DELETE") {
    const stmt = db.prepare("DELETE from annotations WHERE annotation_id = ?");
    stmt.run(annotation.id);

    return res.status(200).json({ message: "annotation is deleted" });
  }
}

async function fetchAnnotations(canvas, objectId, token) {
  let annotations = [];

  const stmt = db.prepare(
    `SELECT annotation FROM annotations WHERE canvas = ? AND object_id = ? AND token = ?;`,
  );
  const rows = stmt.all(canvas, objectId, token);
  if (rows.length > 0) {
    annotations = rows.map((row) => JSON.parse(row.annotation));
  }

  return annotations;
}

function formatAnnotationPage(annotations, url) {
  return {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: url,
    type: "AnnotationPage",
    items: annotations,
  };
}

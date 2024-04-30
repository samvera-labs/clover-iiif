import type { NextApiRequest, NextApiResponse } from "next";
import path from "node:path";
import Database from "better-sqlite3";

const db = new Database(path.join("tmp", "database.db"));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const objectId = req.query.id as string;
  const token = req.headers.authorization?.replace("Bearer ", "");
  // const token = "123abc";
  const { annotation } = req.body;
  const url = `${req.headers["x-forwarded-proto"]}://${req.headers.host}${req.url}`;

  if (token === undefined) {
    return res.status(400).json({ error: "no token" });
  }

  // fetch
  if (req.method === "GET") {
    const annotations = await fetchAnnotations(objectId, token);
    return res.status(200).json(formatAnnotationPage(annotations, url));

    // create
  } else if (req.method === "POST") {
    const stmt = db.prepare(
      `INSERT INTO annotations (annotation, canvas, object_id, token, annotation_id)
      VALUES (?, ?, ?, ?, ?)`,
    );
    const canvas = annotation.target.source.id;
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
  } else {
    return res.status(200).json({ message: "invalid action" });
  }
}

async function fetchAnnotations(objectId: string, token: string) {
  let annotations = [] as any;

  const stmt = db.prepare(
    `SELECT annotation FROM annotations WHERE object_id = ? AND token = ?;`,
  );
  const rows = await stmt.all(objectId, token);

  if (rows.length > 0) {
    annotations = rows.map((row) => JSON.parse(row.annotation));
  }

  return annotations;
}

function formatAnnotationPage(annotations: any, url: string) {
  return {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: url,
    type: "AnnotationPage",
    items: annotations,
  };
}

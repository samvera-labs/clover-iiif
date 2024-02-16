import type { NextApiRequest, NextApiResponse } from "next";
import fs, { stat } from "fs/promises";
import path from "node:path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const canvas = req.query.canvas;
  if (canvas == undefined || typeof canvas !== "string") {
    return res.status(200).json({ errror: "missing canvas" });
  }

  const filePath = path.join(
    process.env.CACHE_DIRECTORY || "",
    `${canvas}.json`,
  );

  if (req.method === "GET") {
    const annotationPage = await fetchAnnotations(canvas, filePath);
    return res.status(200).json(annotationPage);
  } else if (req.body === undefined) {
    return res.status(400).json({ error: "body is missing" });
  } else if (req.method === "POST") {
    const newAnnotation = req.body;
    const annotationPage = await fetchAnnotations(canvas, filePath);
    annotationPage.items.push(newAnnotation);
    await fs.writeFile(filePath, JSON.stringify(annotationPage));

    return res.status(200).json({ message: "annotation saved" });
  } else if (req.method === "PUT") {
    const updatedAnnotation = req.body;
    const annotationPage = await fetchAnnotations(canvas, filePath);
    annotationPage.items = annotationPage.items.filter((annotation) => {
      return annotation.id !== updatedAnnotation.id;
    });
    annotationPage.items.push(updatedAnnotation);

    await fs.writeFile(filePath, JSON.stringify(annotationPage));

    return res.status(200).json({ message: "annotation is updated" });
  } else if (req.method === "DELETE") {
    const updatedAnnotation = req.body;
    const annotationPage = await fetchAnnotations(canvas, filePath);
    annotationPage.items = annotationPage.items.filter((annotation) => {
      return annotation.id !== updatedAnnotation.id;
    });

    await fs.writeFile(filePath, JSON.stringify(annotationPage));

    return res.status(200).json({ message: "annotation is deleted" });
  }
}

async function fetchAnnotations(id, filePath) {
  let annotationPage;

  const exists = await stat(filePath)
    .then(() => true)
    .catch(() => false);
  if (exists) {
    try {
      const data = await fs.readFile(filePath, { encoding: "utf8" });
      annotationPage = JSON.parse(data);
    } catch (err) {
      console.log(err);
    }
  } else {
    annotationPage = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      id: "https://http://localhost:3000/api/annotations/getAnnotations/" + id,
      type: "AnnotationPage",
      items: [],
    };
  }

  return annotationPage;
}

async function editAnnotations(id, annotationPage) {
  const filePath = path.join(process.env.CACHE_DIRECTORY || "", `${id}.json`);

  try {
    await fs.writeFile(filePath, JSON.stringify(annotationPage));
  } catch (err) {
    console.log(err);
  }

  return annotationPage;
}

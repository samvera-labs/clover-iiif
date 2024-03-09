import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const base_url = `${req.headers["x-forwarded-proto"]}://${req.headers.host}`;
  const url = `${base_url}${req.url}`;

  res.status(200).json(makeManifest(base_url, url));
}

function makeManifest(base_url: string, url: string) {
  return {
    "@context": ["http://iiif.io/api/presentation/3/context.json"],
    id: url,
    type: "Collection",
    label: {
      de: ["Berliner Tageblatt"],
    },
    items: [
      {
        id: `${base_url}/api/newspaper/issue_1`,
        type: "Manifest",
        label: {
          de: ["1. Berliner Tageblatt - 1925-02-16"],
        },
      },
      {
        id: `${base_url}/api/newspaper/issue_2`,
        type: "Manifest",
        label: {
          de: ["2. Berliner Tageblatt - 1925-03-13"],
        },
      },
    ],
  };
}

import { Collection } from "@iiif/presentation-3";
import { Manifest } from "next/dist/lib/metadata/types/manifest-types";
import { getCanvasResource } from "src/lib/iiif";
import { upgrade } from "@iiif/parser/upgrader";

/* Here is the explanation for the code below:
1. The function getResponseStatus gets as input a manifest and the credentials of the user.
2. The function fetches the manifest.
3. The function upgrade transforms the manifest to a version 3 manifest.
4. The function getCanvasResource returns the id of the first canvas in the manifest.
5. The function fetch fetches the canvas.
6. The function getResponseStatus returns the status of the canvas, which should be 200. */
export async function getResponseStatus(
  item: Manifest | Collection,
  credentials: any
): Promise<number> {
  if (!item) return Promise.resolve(200);

  return fetch(item?.id as string)
    .then((response) => response.json())
    .then(upgrade)
    .then((manifest: any) => {
      if (manifest?.type === "Manifest") {
        const id = getCanvasResource(manifest?.items[0]);

        if (id) {
          return fetch(id, {
            method: "GET",
            headers: {
              accept: "image/*",
            },
            credentials: credentials,
          })
            .then((response) => {
              return response.status;
            })
            .catch((error) => {
              console.log("error", error);
              return error.status;
            });
        }
      }
    })
    .catch((error) => {
      console.log("error", error);
      return error.status;
    });
}

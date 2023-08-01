import { IIIFExternalWebResource, ImageService } from "@iiif/presentation-3";

export const useGetImageResource = (
  resource: IIIFExternalWebResource,
  size: string = "200,",
  region: string = "full"
) => {
  /**
   * defenseively ensure resource is not an array
   */
  if (Array.isArray(resource)) resource = resource[0];

  const { id, service } = resource;

  let imageService: ImageService | undefined;

  /**
   * return resource id if service does not exist
   */
  if (!service) return id;

  if (Array.isArray(resource.service) && resource.service.length > 0)
    imageService = service[0] as ImageService;

  if (imageService) {
    if (imageService["@id"])
      return `${imageService["@id"]}/${region}/${size}/0/default.jpg`;

    if (imageService.id)
      return `${imageService.id}/${region}/${size}/0/default.jpg`;
  }
};

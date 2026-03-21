import { NormalizedEntity, Vault } from "@iiif/helpers/vault";

type ExtendedNormalizedEntity = NormalizedEntity & { id: string };

export default function getVaultEntityId(
  vault: Vault,
  id?: string,
): string | undefined {
  try {
    const entity: ExtendedNormalizedEntity | undefined | "" =
      id && vault.get(id);

    if (!entity) throw new Error(`Vault entity ${id} not found.`);

    /**
     * Vault seems to handle storage `id` and `@id` differently based on the entity type.
     * Ex: Manifest level rendering items use `id` while Canvas level rendering items use `@id`.
     * The following logic returns `@id` if it exists, otherwise falls back to `id`.
     */
    return entity?.["@id"] || entity?.id;
  } catch (error) {
    console.error(error);
    return id;
  }
}

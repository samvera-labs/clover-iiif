import Label from "src/components/Primitives/Label/Label";
import ContentResource from "src/components/Primitives/ContentResource/ContentResource";
import Homepage from "src/components/Primitives/Homepage/Homepage";
import Markup from "src/components/Primitives/Markup/Markup";
import Metadata from "src/components/Primitives/Metadata/Metadata";
import MetadataItem from "src/components/Primitives/Metadata/Item";
import PartOf from "src/components/Primitives/PartOf/PartOf";
import Rendering from "src/components/Primitives/Rendering/Rendering";
import RequiredStatement from "src/components/Primitives/RequiredStatement/RequiredStatement";
import SeeAlso from "src/components/Primitives/SeeAlso/SeeAlso";
import Summary from "src/components/Primitives/Summary/Summary";
import Thumbnail from "src/components/Primitives/Thumbnail/Thumbnail";
import Value from "src/components/Primitives/Value/Value";
import {
  PrimitivesContentResource,
  PrimitivesHomepage,
  PrimitivesLabel,
  PrimitivesMarkup,
  PrimitivesMetadata,
  PrimitivesMetadataItem,
  PrimitivesPartOf,
  PrimitivesRendering,
  PrimitivesRequiredStatement,
  PrimitivesSeeAlso,
  PrimitivesSummary,
  PrimitivesThumbnail,
  PrimitivesValue,
} from "src/types/primitives";

export interface CloverPrimitivesComposition {
  ContentResource: React.FC<PrimitivesContentResource>;
  Homepage: React.FC<PrimitivesHomepage>;
  Label: React.FC<PrimitivesLabel>;
  Markup: React.FC<PrimitivesMarkup>;
  Metadata: React.FC<PrimitivesMetadata>;
  MetadataItem: React.FC<PrimitivesMetadataItem>;
  PartOf: React.FC<PrimitivesPartOf>;
  Rendering: React.FC<PrimitivesRendering>;
  RequiredStatement: React.FC<PrimitivesRequiredStatement>;
  SeeAlso: React.FC<PrimitivesSeeAlso>;
  Summary: React.FC<PrimitivesSummary>;
  Thumbnail: React.FC<PrimitivesThumbnail>;
  Value: React.FC<PrimitivesValue>;
}

const Primitives: React.FC & CloverPrimitivesComposition = () => {
  console.log("Use dot notation to access Primitives.*, ex: Primitives.Label");
  return null;
};

Primitives.ContentResource = ContentResource;
Primitives.Homepage = Homepage;
Primitives.Label = Label;
Primitives.Markup = Markup;
Primitives.Metadata = Metadata;
Primitives.MetadataItem = MetadataItem;
Primitives.PartOf = PartOf;
Primitives.Rendering = Rendering;
Primitives.RequiredStatement = RequiredStatement;
Primitives.SeeAlso = SeeAlso;
Primitives.Summary = Summary;
Primitives.Thumbnail = Thumbnail;
Primitives.Value = Value;

export {
  ContentResource,
  Homepage,
  Label,
  Markup,
  Metadata,
  MetadataItem,
  PartOf,
  Rendering,
  RequiredStatement,
  SeeAlso,
  Summary,
  Thumbnail,
  Value,
};

export default Primitives as CloverPrimitivesComposition;

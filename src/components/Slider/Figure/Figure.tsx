import * as AspectRatio from "@radix-ui/react-aspect-ratio";

import { Card, Inset, Link, Text } from "@radix-ui/themes";
import { FigureStyled, Placeholder } from "./Figure.styled";
import { Label, Summary, Thumbnail } from "src/components/Primitives";

import { InternationalString } from "@iiif/presentation-3";
import React from "react";

interface FigureProps {
  href: string;
  label: InternationalString;
  summary?: InternationalString;
  thumbnail: Array<any>;
}

const Figure: React.FC<FigureProps> = ({ href, label, summary, thumbnail }) => {
  return (
    <FigureStyled as="figure">
      <Card size="2" variant="classic">
        <Link href={href}>
          <Inset clip="padding-box" side="top" pb="current">
            <AspectRatio.Root ratio={1 / 1}>
              <Placeholder>
                <Thumbnail
                  altAsLabel={label}
                  thumbnail={thumbnail}
                  data-testid="figure-thumbnail"
                />
              </Placeholder>
            </AspectRatio.Root>
          </Inset>
        </Link>
        <figcaption>
          <Link href={href}>
            <Label as={Text} weight="medium" label={label} />
          </Link>
          {summary && (
            <Summary as={Text} size="2" color="gray" summary={summary} />
          )}
        </figcaption>
      </Card>
    </FigureStyled>
  );
};

export default Figure;

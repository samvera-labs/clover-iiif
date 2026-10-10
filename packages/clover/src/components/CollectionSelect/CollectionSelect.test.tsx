import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React, { useState } from "react";

import bookJson from "../../fixtures/iiif-cookbook/0009-book-1.json";
import { initCloverI18n } from "../../i18n";
import * as Clover from "../../index";

const BOOK = bookJson.id;
const LETTER = "https://example.org/letter";
const letter = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: LETTER,
  type: "Manifest",
  label: { en: ["A letter"] },
  items: [
    {
      id: `${LETTER}/canvas/1`,
      type: "Canvas",
      width: 100,
      height: 100,
      items: [],
    },
  ],
};
const shelf = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "https://example.org/shelf",
  type: "Collection",
  label: { en: ["Shelf"] },
  items: [
    { id: BOOK, type: "Manifest", label: { en: ["The book"] } },
    { id: LETTER, type: "Manifest", label: { en: ["A letter"] } },
  ],
};

function mockFetch() {
  const table: Record<string, unknown> = { [BOOK]: bookJson, [LETTER]: letter };
  return vi.fn(async (url: string) =>
    table[url] === undefined
      ? new Response("missing", { status: 404 })
      : new Response(JSON.stringify(table[url]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
  );
}

beforeEach(() => initCloverI18n({ lng: "en" }));

describe("CollectionSelect", () => {
  it("lists the members, labelled by the Collection, and shows the one chosen", async () => {
    const onManifestChange = vi.fn();
    render(
      <Clover.Root
        iiifContent={shelf}
        request={{ fetch: mockFetch() }}
        onManifestChange={onManifestChange}
      >
        <Clover.Label as="h1" />
        <Clover.CollectionSelect />
      </Clover.Root>,
    );
    const select = await screen.findByRole("combobox", { name: "Shelf" });
    expect(select).toHaveValue(BOOK);
    expect(within(select).getAllByRole("option")).toHaveLength(2);
    await screen.findByRole("heading", { name: "Simple Manifest - Book" });

    fireEvent.change(select, { target: { value: LETTER } });
    expect(
      await screen.findByRole("heading", { name: "A letter" }),
    ).toBeInTheDocument();
    expect(select).toHaveValue(LETTER);
    expect(onManifestChange).toHaveBeenCalledWith(LETTER);
  });

  it("renders nothing for a Manifest", async () => {
    render(
      <Clover.Root iiifContent={bookJson}>
        <Clover.Label as="h1" />
        <Clover.CollectionSelect />
      </Clover.Root>,
    );
    await screen.findByRole("heading");
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});

describe("Items of members", () => {
  it("is a listbox of the Collection's members choosing the Manifest shown", async () => {
    render(
      <Clover.Root iiifContent={shelf} request={{ fetch: mockFetch() }}>
        <Clover.Label as="h1" />
        <Clover.Items of="members" aria-label="Shelf" />
      </Clover.Root>,
    );
    const listbox = await screen.findByRole("listbox", { name: "Shelf" });
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    fireEvent.click(options[1]);
    await screen.findByRole("heading", { name: "A letter" });
    await waitFor(() =>
      expect(within(listbox).getAllByRole("option")[1]).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
  });
});

describe("Root manifestId", () => {
  it("opens the Manifest named, and moves only when the host hands back a choice", async () => {
    const asked: string[] = [];
    function Host({ follow }: { follow: boolean }) {
      const [manifestId, setManifestId] = useState(LETTER);
      return (
        <Clover.Root
          iiifContent={shelf}
          request={{ fetch: mockFetch() }}
          manifestId={manifestId}
          onManifestChange={(id) => {
            asked.push(id);
            if (follow) setManifestId(id);
          }}
        >
          <Clover.Label as="h1" />
          <Clover.CollectionSelect />
        </Clover.Root>
      );
    }
    const { unmount } = render(<Host follow={false} />);
    await screen.findByRole("heading", { name: "A letter" });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: BOOK },
    });
    expect(asked).toEqual([BOOK]);
    expect(screen.getByRole("heading")).toHaveTextContent("A letter");
    unmount();

    render(<Host follow />);
    await screen.findByRole("heading", { name: "A letter" });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: BOOK },
    });
    expect(
      await screen.findByRole("heading", { name: "Simple Manifest - Book" }),
    ).toBeInTheDocument();
  });
});

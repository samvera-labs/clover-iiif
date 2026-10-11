import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";

import { Sections, type SectionsLayout } from "./Sections";

const mounts: string[] = [];
function Body({ name }: { name: string }) {
  React.useEffect(() => {
    mounts.push(name);
  }, [name]);
  return <p>{name} body</p>;
}

const items = ["About", "Contents", "Notes"].map((name) => ({
  value: name.toLowerCase(),
  label: name,
  content: <Body name={name} />,
}));

const Layout = ({ layout }: { layout: SectionsLayout }) => (
  <Sections items={items} layout={layout} label="Information" />
);

beforeEach(() => {
  mounts.length = 0;
});

describe("Sections", () => {
  describe("as tabs", () => {
    it("is a tablist of tabs, one panel open, one tab stop", () => {
      render(<Layout layout="tabs" />);
      const list = screen.getByRole("tablist", { name: "Information" });
      const tabs = within(list).getAllByRole("tab");
      expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual([
        "true",
        "false",
        "false",
      ]);
      expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
      expect(screen.getByRole("tabpanel", { name: "About" })).toHaveTextContent(
        "About body",
      );
      expect(screen.queryByText("Contents body")).toBeNull();
    });

    it("selects as the arrow keys move, and wraps", () => {
      render(<Layout layout="tabs" />);
      const [about, , notes] = screen.getAllByRole("tab");
      fireEvent.keyDown(about, { key: "ArrowLeft" });
      expect(notes).toHaveFocus();
      expect(notes).toHaveAttribute("aria-selected", "true");
      expect(screen.getByText("Notes body")).toBeVisible();
    });
  });

  describe("as an accordion", () => {
    it("is a heading per section; opening one closes the others", () => {
      render(<Layout layout="accordion" />);
      expect(screen.queryByRole("tablist")).toBeNull();
      const headings = screen.getAllByRole("heading", { level: 3 });
      expect(headings.map((heading) => heading.textContent)).toEqual([
        "About",
        "Contents",
        "Notes",
      ]);
      const about = screen.getByRole("button", { name: "About" });
      const contents = screen.getByRole("button", { name: "Contents" });
      expect(about).toHaveAttribute("aria-expanded", "true");
      expect(contents).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(contents);
      expect(contents).toHaveAttribute("aria-expanded", "true");
      expect(about).toHaveAttribute("aria-expanded", "false");
      expect(screen.getByText("About body")).not.toBeVisible();
      expect(
        screen.getByRole("region", { name: "Contents" }),
      ).toHaveTextContent("Contents body");

      // Pressing the open one closes it: none open.
      fireEvent.click(contents);
      expect(contents).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryAllByRole("region")).toHaveLength(0);
    });

    it("moves between headings by arrow without opening them", () => {
      render(<Layout layout="accordion" />);
      const about = screen.getByRole("button", { name: "About" });
      const contents = screen.getByRole("button", { name: "Contents" });
      fireEvent.keyDown(about, { key: "ArrowDown" });
      expect(contents).toHaveFocus();
      expect(contents).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("mounts a section's content when it first opens, and keeps it", () => {
    render(<Layout layout="tabs" />);
    expect(mounts).toEqual(["About"]);
    fireEvent.click(screen.getByRole("tab", { name: "Contents" }));
    fireEvent.click(screen.getByRole("tab", { name: "About" }));
    expect(mounts).toEqual(["About", "Contents"]);
    // Still there, hidden, rather than mounted afresh.
    expect(screen.getByText("Contents body")).not.toBeVisible();
  });

  it("keeps what is open when the layout changes", () => {
    const { rerender } = render(<Layout layout="tabs" />);
    fireEvent.click(screen.getByRole("tab", { name: "Notes" }));
    rerender(<Layout layout="accordion" />);
    expect(screen.getByRole("button", { name: "Notes" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: "About" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    // Nothing that had been shown is mounted again.
    expect(mounts).toEqual(["About", "Notes"]);
  });
});

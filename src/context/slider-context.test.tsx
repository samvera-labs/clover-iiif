import {
  CollectionContextStore,
  CollectionProvider,
  useCollectionDispatch,
  useCollectionState,
} from "./slider-context";
import { render, screen } from "@testing-library/react";

import React from "react";

describe("Slider Context", () => {
  test("should render default state for the Provider", () => {
    function ChildComponent() {
      const state = useCollectionState();
      return <div>{JSON.stringify(state)}</div>;
    }

    const initialState: CollectionContextStore = {
      isLoaded: true,
      options: {
        credentials: "same-origin",
      },
    };

    render(
      <CollectionProvider initialState={initialState}>
        <ChildComponent />
      </CollectionProvider>,
    );
    expect(screen.getByText(JSON.stringify(initialState))).toBeInTheDocument();
  });

  test("Can update the state via dispatch", async () => {
    function ChildComponent() {
      const state = useCollectionState();
      const dispatch: any = useCollectionDispatch();

      React.useEffect(() => {
        if (!dispatch) return;
        dispatch({
          type: "updateIsLoaded",
          isLoaded: false,
        });
      }, [dispatch]);

      return <div>{JSON.stringify(state)}</div>;
    }

    const initialState: CollectionContextStore = {
      isLoaded: true,
      options: {
        credentials: "same-origin",
      },
    };

    render(
      <CollectionProvider initialState={initialState}>
        <ChildComponent />
      </CollectionProvider>,
    );

    expect(
      screen.getByText(
        `{"isLoaded":false,"options":{"credentials":"same-origin"}}`,
      ),
    ).toBeInTheDocument();
  });

  test("Throws an error trying to update the state with an invalid action", async () => {
    function ChildComponent() {
      const dispatch: any = useCollectionDispatch();

      React.useEffect(() => {
        dispatch({
          type: "foo",
          isLoaded: "bar",
        });
      }, [dispatch]);

      return <div></div>;
    }

    expect(() => {
      render(
        <CollectionProvider>
          <ChildComponent />
        </CollectionProvider>,
      );
    }).toThrowError("Unhandled action type: foo");
  });
});

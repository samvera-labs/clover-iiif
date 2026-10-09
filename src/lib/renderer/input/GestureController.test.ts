import {
  DEFAULT_GESTURES,
  GestureController,
  type GestureTarget,
} from "src/lib/renderer/input/GestureController";

function setup(options = DEFAULT_GESTURES) {
  const element = document.createElement("div");
  element.tabIndex = 0;
  element.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 400, height: 200 }) as DOMRect;
  document.body.appendChild(element);
  const target: GestureTarget = {
    panBy: vi.fn(),
    zoomBy: vi.fn(),
    flick: vi.fn(),
    home: vi.fn(),
    rotateBy: vi.fn(),
    setInteracting: vi.fn(),
  };
  const controller = new GestureController(element, target, options);
  return { element, target, controller };
}

describe("GestureController", () => {
  it("leaves a plain wheel to the page when scrollToZoom is off", () => {
    const { element, target } = setup();
    const event = new WheelEvent("wheel", { deltaY: 100, cancelable: true });
    element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(target.zoomBy).not.toHaveBeenCalled();
  });

  it("zooms on a trackpad pinch even with scrollToZoom off", () => {
    const { element, target } = setup();
    const event = new WheelEvent("wheel", {
      deltaY: -20,
      ctrlKey: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    const [factor] = (target.zoomBy as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(factor).toBeGreaterThan(1);
  });

  it("zooms on a plain wheel when scrollToZoom is on", () => {
    const { element, target } = setup({
      ...DEFAULT_GESTURES,
      scrollToZoom: true,
    });
    const event = new WheelEvent("wheel", { deltaY: 100, cancelable: true });
    element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    const [factor] = (target.zoomBy as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(factor).toBeLessThan(1);
  });

  it.each([
    ["ArrowLeft", "panBy", [40, 0, true]],
    ["ArrowRight", "panBy", [-40, 0, true]],
    ["ArrowUp", "panBy", [0, 20, true]],
    ["+", "zoomBy", [1.5, undefined, true]],
    ["-", "zoomBy", [1 / 1.5, undefined, true]],
    ["0", "home", []],
    ["r", "rotateBy", [90]],
    ["R", "rotateBy", [-90]],
  ])("maps %s to %s", (key, method, args) => {
    const { element, target } = setup();
    const event = new KeyboardEvent("keydown", { key, cancelable: true });
    element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect((target as any)[method]).toHaveBeenCalledWith(...args);
  });

  it("ignores keys it does not handle, and modified keys", () => {
    const { element, target } = setup();
    const plain = new KeyboardEvent("keydown", { key: "x", cancelable: true });
    const modified = new KeyboardEvent("keydown", {
      key: "+",
      metaKey: true,
      cancelable: true,
    });
    element.dispatchEvent(plain);
    element.dispatchEvent(modified);
    expect(plain.defaultPrevented).toBe(false);
    expect(modified.defaultPrevented).toBe(false);
    expect(target.zoomBy).not.toHaveBeenCalled();
  });

  it("stops listening on dispose", () => {
    const { element, target, controller } = setup();
    controller.dispose();
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "0" }));
    expect(target.home).not.toHaveBeenCalled();
  });

  it("holds the camera still when not navigable, reporting only taps", () => {
    const { element, target } = setup({
      ...DEFAULT_GESTURES,
      clickToZoom: false,
      navigable: false,
    });
    target.tap = vi.fn();
    const pointer = (type: string, x: number) =>
      element.dispatchEvent(
        Object.assign(
          new MouseEvent(type, { clientX: x, clientY: 10, button: 0 }),
          { pointerId: 1, pointerType: "mouse" },
        ),
      );

    // A drag moves nothing.
    pointer("pointerdown", 10);
    pointer("pointermove", 60);
    pointer("pointerup", 60);
    expect(target.panBy).not.toHaveBeenCalled();
    expect(target.flick).not.toHaveBeenCalled();

    // A click is still a tap (play / pause).
    pointer("pointerdown", 20);
    pointer("pointerup", 20);
    expect(target.tap).toHaveBeenCalledTimes(1);

    // Double-click, keys and a trackpad pinch are left alone.
    element.dispatchEvent(new MouseEvent("dblclick", { clientX: 20 }));
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "+" }));
    const pinch = new WheelEvent("wheel", { ctrlKey: true, cancelable: true });
    element.dispatchEvent(pinch);
    expect(pinch.defaultPrevented).toBe(false);
    expect(target.zoomBy).not.toHaveBeenCalled();
  });
});

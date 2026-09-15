const readPx = (element: HTMLElement, property: "width" | "height") => {
  const inline = element.style?.[property];
  if (inline) {
    const value = Number.parseFloat(inline);
    if (!Number.isNaN(value)) {
      return value;
    }
  }
  const fromAttr = element.getAttribute(
    property === "width" ? "data-width" : "data-height",
  );
  if (fromAttr) {
    return Number.parseFloat(fromAttr);
  }
  return 0;
};

export const installContractLayout = () => {
  Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value: function getBoundingClientRect(this: HTMLElement) {
      const width = readPx(this, "width");
      const height = readPx(this, "height");
      let x = 0;
      let sibling = this.previousElementSibling as HTMLElement | null;
      while (sibling) {
        x += readPx(sibling, "width");
        sibling = sibling.previousElementSibling as HTMLElement | null;
      }
      return {
        x,
        y: 0,
        width,
        height,
        top: 0,
        left: x,
        right: x + width,
        bottom: height,
        toJSON() {},
      };
    },
  });
};

declare module "@earendil-works/pi-tui" {
  export class Container {
    addChild(child: unknown): void;
  }
  export class Box {
    constructor(width: number, height: number, bg: (s: string) => string);
    addChild(child: unknown): void;
  }
  export class Text {
    constructor(content: string, x: number, y: number);
  }
}

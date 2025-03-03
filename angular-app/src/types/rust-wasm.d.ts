declare module '@wasm/rust_wasm' {
  export enum PrimitiveType {
    Cube = 0,
    Tetrahedron = 1,
    Octahedron = 2,
    Icosahedron = 3,
    Dodecahedron = 4
  }

  export class Mesh {
    constructor();
    static from_primitive(type: PrimitiveType): Mesh;
    get_vertices(): Float32Array;
    get_indices(): Uint16Array;
    subdivide(): void;
  }

  export function initSync(): void;
  export function greet(): string;
  export default function init(wasmPath?: string): Promise<void>;
} 
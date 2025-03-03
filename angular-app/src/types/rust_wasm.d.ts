/* tslint:disable */
/* eslint-disable */
export enum PrimitiveType {
  Cube = 0,
  Tetrahedron = 1,
  Octahedron = 2
}
export class Mesh {
  free(): void;
  constructor();
  static from_primitive(primitive_type: PrimitiveType): Mesh;
  get_vertices(): Float32Array;
  get_indices(): Uint16Array;
  subdivide(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_mesh_free: (a: number, b: number) => void;
  readonly mesh_new: () => number;
  readonly mesh_from_primitive: (a: number) => number;
  readonly mesh_get_vertices: (a: number) => any;
  readonly mesh_get_indices: (a: number) => [number, number];
  readonly mesh_subdivide: (a: number) => void;
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;

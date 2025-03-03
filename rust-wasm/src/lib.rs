mod operations;
mod primitives;

use wasm_bindgen::prelude::*;
use js_sys::Float32Array;

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub enum PrimitiveType {
    Cube = 0,
    Tetrahedron = 1,
    Octahedron = 2,
}

#[wasm_bindgen]
pub struct Mesh {
    vertices: Vec<f32>,
    indices: Vec<u16>,
}

#[wasm_bindgen]
impl Mesh {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Mesh {
        Mesh {
            vertices: Vec::new(),
            indices: Vec::new(),
        }
    }

    #[wasm_bindgen]
    pub fn from_primitive(primitive_type: PrimitiveType) -> Mesh {
        match primitive_type {
            PrimitiveType::Cube => primitives::create_cube(),
            PrimitiveType::Tetrahedron => primitives::create_tetrahedron(),
            PrimitiveType::Octahedron => primitives::create_octahedron(),
        }
    }

    #[wasm_bindgen]
    pub fn get_vertices(&self) -> Float32Array {
        unsafe { Float32Array::view(&self.vertices) }
    }

    #[wasm_bindgen]
    pub fn get_indices(&self) -> Vec<u16> {
        self.indices.clone()
    }

    #[wasm_bindgen]
    pub fn subdivide(&mut self) {
        operations::subdivide::subdivide(self);
    }
}

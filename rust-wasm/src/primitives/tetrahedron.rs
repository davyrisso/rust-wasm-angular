use crate::Mesh;

pub fn create_tetrahedron() -> Mesh {
    let vertices = vec![
        0.0, 0.0, 0.0,      // base
        1.0, 0.0, 0.0,      // right
        0.5, 1.0, 0.0,      // top
        0.5, 0.5, 0.866,    // front
    ];

    let indices = vec![
        0, 1, 2,  // front
        0, 2, 3,  // left
        1, 0, 3,  // bottom
        2, 1, 3,  // right
    ];

    Mesh { vertices, indices }
} 
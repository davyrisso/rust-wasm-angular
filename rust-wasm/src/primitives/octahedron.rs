use crate::Mesh;

pub fn create_octahedron() -> Mesh {
    let vertices = vec![
        0.0, 0.0, 1.0,      // top
        1.0, 0.0, 0.0,      // right
        0.0, 0.0, -1.0,     // bottom
        -1.0, 0.0, 0.0,     // left
        0.0, 1.0, 0.0,      // front
        0.0, -1.0, 0.0,     // back
    ];

    let indices = vec![
        0, 1, 4, 0, 4, 3, 0, 3, 5, 0, 5, 1,  // top faces
        2, 4, 1, 2, 1, 5, 2, 5, 3, 2, 3, 4,  // bottom faces
    ];

    Mesh { vertices, indices }
} 
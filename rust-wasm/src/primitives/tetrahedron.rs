use crate::Mesh;

pub fn create_tetrahedron() -> Mesh {
    let vertices = vec![
        0.0, 0.0, 0.0,      // 0
        1.0, 0.0, 0.0,      // 1
        0.5, 1.0, 0.0,      // 2
        0.5, 0.5, 0.866,    // 3
    ];

    let indices = vec![
        0, 1, 2,  // front
        0, 2, 3,  // left
        1, 0, 3,  // bottom
        2, 1, 3,  // right
    ];

    Mesh { vertices, indices }
} 
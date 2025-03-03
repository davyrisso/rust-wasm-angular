use crate::Mesh;

pub fn create_octahedron() -> Mesh {
    let vertices = vec![
        0.0, 0.0, 1.0,      // 0 top
        1.0, 0.0, 0.0,      // 1 right
        0.0, 0.0, -1.0,     // 2 bottom
        -1.0, 0.0, 0.0,     // 3 left
        0.0, 1.0, 0.0,      // 4 front
        0.0, -1.0, 0.0,     // 5 back
    ];

    let indices = vec![
        0, 1, 4,  // top-right-front
        0, 4, 3,  // top-front-left
        0, 3, 5,  // top-left-back
        0, 5, 1,  // top-back-right
        2, 4, 1,  // bottom-front-right
        2, 1, 5,  // bottom-right-back
        2, 5, 3,  // bottom-back-left
        2, 3, 4,  // bottom-left-front
    ];

    Mesh { vertices, indices }
} 
use crate::Mesh;

pub fn create_cube() -> Mesh {
    let vertices = vec![
        // Front face
        -1.0, -1.0,  1.0,  // 0
         1.0, -1.0,  1.0,  // 1
         1.0,  1.0,  1.0,  // 2
        -1.0,  1.0,  1.0,  // 3
        // Back face
        -1.0, -1.0, -1.0,  // 4
         1.0, -1.0, -1.0,  // 5
         1.0,  1.0, -1.0,  // 6
        -1.0,  1.0, -1.0,  // 7
    ];

    let indices = vec![
        // Front face
        0, 1, 2, 0, 2, 3,
        // Right face
        1, 5, 6, 1, 6, 2,
        // Back face
        5, 4, 7, 5, 7, 6,
        // Left face
        4, 0, 3, 4, 3, 7,
        // Top face
        3, 2, 6, 3, 6, 7,
        // Bottom face
        4, 5, 1, 4, 1, 0,
    ];

    Mesh { vertices, indices }
} 
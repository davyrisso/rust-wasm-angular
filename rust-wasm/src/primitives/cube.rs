use crate::Mesh;

pub fn create_cube() -> Mesh {
    let vertices = vec![
        -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
        -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,  1.0, -1.0, -1.0,  1.0, -1.0,
    ];

    let indices = vec![
        0, 1, 2, 0, 2, 3,  // front
        1, 5, 6, 1, 6, 2,  // right
        5, 4, 7, 5, 7, 6,  // back
        4, 0, 3, 4, 3, 7,  // left
        3, 2, 6, 3, 6, 7,  // top
        4, 5, 1, 4, 1, 0,  // bottom
    ];

    Mesh { vertices, indices }
} 
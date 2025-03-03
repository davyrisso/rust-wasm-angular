use crate::Mesh;

pub fn subdivide(mesh: &mut Mesh) {
    let mut new_vertices = mesh.vertices.clone();
    let mut new_indices = Vec::new();
    let mut edge_midpoints = std::collections::HashMap::new();

    let get_vertex = |idx: u16| -> (f32, f32, f32) {
        let i = idx as usize * 3;
        (mesh.vertices[i], mesh.vertices[i + 1], mesh.vertices[i + 2])
    };

    for i in (0..mesh.indices.len()).step_by(3) {
        let [v1, v2, v3] = [mesh.indices[i], mesh.indices[i + 1], mesh.indices[i + 2]];
        let keys = [(v1.min(v2), v1.max(v2)), (v2.min(v3), v2.max(v3)), (v3.min(v1), v3.max(v1))];
        
        let midpoints: Vec<u16> = keys.iter().map(|&(v1, v2)| {
            if let Some(&midpoint) = edge_midpoints.get(&(v1, v2)) {
                midpoint
            } else {
                let (x1, y1, z1) = get_vertex(v1);
                let (x2, y2, z2) = get_vertex(v2);
                let midpoint = (new_vertices.len() / 3) as u16;
                new_vertices.extend_from_slice(&[
                    (x1 + x2) * 0.5,
                    (y1 + y2) * 0.5,
                    (z1 + z2) * 0.5,
                ]);
                edge_midpoints.insert((v1, v2), midpoint);
                midpoint
            }
        }).collect();

        let [m1, m2, m3] = [midpoints[0], midpoints[1], midpoints[2]];
        new_indices.extend_from_slice(&[v1, m1, m3, m1, v2, m2, m3, m2, v3, m1, m2, m3]);
    }

    let vertex_count = new_vertices.len() / 3;
    if new_indices.iter().any(|&idx| idx as usize >= vertex_count) {
        panic!("Invalid index detected");
    }

    mesh.vertices = new_vertices;
    mesh.indices = new_indices;
} 
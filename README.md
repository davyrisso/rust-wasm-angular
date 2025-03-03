# Rust WASM Angular 3D Viewer

A 3D viewer application built with Angular and Three.js, featuring Rust-generated WebAssembly meshes. This project demonstrates the integration of Rust WASM modules with Angular for 3D graphics rendering.

## Features

- Real-time 3D mesh rendering using Three.js
- Rust-generated WebAssembly mesh primitives (Cube, Tetrahedron, Octahedron)
- Interactive mesh subdivision
- Orbit controls for camera manipulation
- Responsive design with automatic resizing
- Wireframe overlay for better mesh visualization

## Prerequisites

- Rust (latest stable version)
- Node.js (v18 or later)
- Angular CLI (v17 or later)
- wasm-pack

## Project Structure

```
.
├── rust-wasm/          # Rust WASM module
│   ├── src/           # Rust source code
│   └── Cargo.toml     # Rust dependencies
├── angular-app/       # Angular application
│   ├── src/          # Angular source code
│   └── package.json  # Node.js dependencies
└── run.sh            # Build and run script
```

## Building and Running

1. Build the Rust WASM module:
```bash
cd rust-wasm
wasm-pack build --target web
```

2. Install Angular dependencies:
```bash
cd angular-app
npm install
```

3. Run the application:
```bash
./run.sh
```

The application will be available at `http://localhost:4200`.

## Development

- The Rust WASM module handles mesh generation and subdivision
- The Angular application provides the UI and 3D rendering
- Three.js is used for 3D graphics rendering
- The application uses a service-based architecture for WASM initialization and mesh management

## License

MIT License 
module.exports = {
  experiments: {
    asyncWebAssembly: true,
    layers: true,
    lazyCompilation: true,
    syncWebAssembly: true,
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
      },
    ],
  },
}; 
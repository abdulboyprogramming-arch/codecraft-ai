// frontend/babel.config.js
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
    // You can add TypeScript support if needed, but it's optional:
    // ["@babel/preset-typescript", { isTSX: true, allExtensions: true }]
  ]
};
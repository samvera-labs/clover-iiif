// CJS-friendly ReactDOM shim mirroring ESM behavior
const ReactDOMNS = require('react-dom');

module.exports = ReactDOMNS;
Object.assign(module.exports, ReactDOMNS);


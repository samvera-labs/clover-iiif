// CJS-friendly React shim that mirrors ESM behavior
// Re-export the React namespace and default for Node/Jest CJS consumers.
const ReactNS = require('react');

// Provide default pointing to the namespace and copy enumerable props
module.exports = ReactNS;
Object.assign(module.exports, ReactNS);


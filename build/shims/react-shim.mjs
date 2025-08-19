// Re-export everything from React and provide a default that is the namespace.
export * from 'react';
import * as ReactNS from 'react';

// React 19 ESM doesn't provide a default export. Provide one that points to
// the namespace and also defines a minimal internal owner object so any
// legacy JSX runtimes that read it do not crash.
const defaultExport = { ...ReactNS };
// Define a minimal internals bag without reading from React’s exports.
defaultExport.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  ReactCurrentOwner: { current: null },
};

export default defaultExport;

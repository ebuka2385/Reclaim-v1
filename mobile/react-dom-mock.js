// Mock react-dom for React Native (required by @clerk/clerk-react)
module.exports = {
  createPortal: () => null,
  findDOMNode: () => null,
  render: () => null,
  unmountComponentAtNode: () => null,
  version: '18.2.0',
};


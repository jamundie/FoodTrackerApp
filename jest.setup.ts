// Jest setup file to mock components that cause async state updates

// Mock Ionicons to prevent async state updates in tests
jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = require('react-native');
  const mockReact = require('react');
  return (props: any) => mockReact.createElement(Text, { testID: 'mocked-icon', ...props }, props.name || 'icon');
});

// Silence act() warnings for tests that can't easily be wrapped
const originalError = console.error;
console.error = (...args: any[]) => {
  // Suppress the specific act() warning for Icon components
  if (
    typeof args[0] === 'string' &&
    args[0].includes('An update to Icon inside a test was not wrapped in act')
  ) {
    return;
  }
  originalError.call(console, ...args);
};
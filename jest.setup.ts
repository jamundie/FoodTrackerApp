// Jest setup file to mock components that cause async state updates

// Mock Ionicons to prevent async state updates in tests
jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = require('react-native');
  const mockReact = require('react');
  return (props: any) => mockReact.createElement(Text, { testID: 'mocked-icon', ...props }, props.name || 'icon');
});

// Mock React Native Skia components for tests
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockCanvas = ({ children, style, ...props }: any) => {
    return React.createElement(View, { 
      testID: 'mocked-canvas', 
      style: style,
      ...props 
    }, children);
  };
  
  const MockLine = (props: any) => {
    return React.createElement(View, { 
      testID: 'mocked-line', 
      style: { width: 1, height: 1 },
      ...props 
    });
  };
  
  const MockCircle = (props: any) => {
    return React.createElement(View, { 
      testID: 'mocked-circle', 
      style: { width: 1, height: 1 },
      ...props 
    });
  };
  
  const MockRect = (props: any) => {
    return React.createElement(View, { 
      testID: 'mocked-rect', 
      style: { width: 1, height: 1 },
      ...props 
    });
  };
  
  return {
    Canvas: MockCanvas,
    Line: MockLine,
    Circle: MockCircle,
    Rect: MockRect,
  };
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
  
  // Allow Skia errors through to debug
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('React.jsx: type is invalid') || 
     args[0].includes('Element type is invalid'))
  ) {
    originalError.call(console, ...args);
    return;
  }
  
  originalError.call(console, ...args);
};
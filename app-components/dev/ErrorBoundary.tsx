import React, { Component, ReactNode } from 'react';
import { Alert } from 'react-native';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] Caught error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    // Show alert to user
    Alert.alert(
      'Error Occurred',
      error.message || 'Something went wrong. Please try again.',
      [{ text: 'OK', onPress: () => this.setState({ hasError: false }) }]
    );
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log to crash reporting service in production
    if (!__DEV__) {
      console.error('[ErrorBoundary] Production error:', error.message);
    }
  }

  render() {
    // Always render children, whether there was an error or not
    // The alert notifies the user without breaking the UI
    return this.props.children;
  }
}

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  return (error: Error) => {
    // This will be caught by the nearest error boundary
    throw error;
  };
};

import React, { Component, ReactNode } from 'react';
import { View, Text, Alert } from 'react-native';
import GrouplyButton from '../shared/GrouplyButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  onRestart?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.error('[ErrorBoundary] Caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log to crash reporting service in production
    if (!__DEV__) {
      // In production, could add crash reporting here (e.g., Sentry, Bugsnag)
      console.error('[ErrorBoundary] Production error:', error.message);
    }
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleRestartApp = () => {
    Alert.alert(
      'Restart App',
      'This will reset the app and take you back to the home screen. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restart', 
          onPress: () => {
            this.setState({ hasError: false, error: undefined });
            this.props.onRestart?.();
          }
        }
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View className="flex-1 justify-center items-center p-6 bg-background">
          <Text className="text-2xl font-bold text-foreground mb-4">
            Oops! Something went wrong
          </Text>
          
          <Text className="text-base text-muted-foreground text-center mb-8">
            Don't worry, this happens sometimes. You can try again or restart the app.
          </Text>
          
          {__DEV__ && this.state.error && (
            <View className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
              <Text className="text-xs text-red-800 font-mono">
                {this.state.error.message}
              </Text>
            </View>
          )}
          
          <View className="flex-row gap-4">
            <GrouplyButton 
              variant="outline" 
              onPress={this.handleTryAgain}
              className="flex-1"
              label="Try Again"
            />
            
            <GrouplyButton 
              variant="primary" 
              onPress={this.handleRestartApp}
              className="flex-1"
              label="Restart App"
            />
          </View>
        </View>
      );
    }

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

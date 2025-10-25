import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';

interface TroubleshootItemProps {
  title: string;
  description: string;
  onRun: (value?: number) => Promise<void>;
  requiresInput?: boolean;
  inputPlaceholder?: string;
}

type Status = {
  type: 'success' | 'error' | 'loading' | null;
  message?: string;
};

const TroubleshootItem = ({
  title,
  description,
  onRun,
  requiresInput = false,
  inputPlaceholder = "Enter value..."
}: TroubleshootItemProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [status, setStatus] = useState<Status>({ type: null });

  const handleRun = async () => {
    try {
      setStatus({ type: 'loading' });
      if (requiresInput && !inputValue) {
        throw new Error('Please enter a value');
      }
      
      await onRun(requiresInput ? Number(inputValue) : undefined);
      setStatus({ type: 'success', message: 'Operation completed successfully' });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'An error occurred' 
      });
    }
  };

  return (
    <View className="p-4 bg-white rounded-lg shadow-sm mb-4">
      <Text className="text-lg font-semibold text-gray-800">{title}</Text>
      <Text className="text-sm text-gray-600 mt-1 mb-3">{description}</Text>
      
      {requiresInput && (
        <TextInput
          className="border border-gray-300 rounded-md p-2 mb-3"
          placeholder={inputPlaceholder}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numeric"
        />
      )}

      {status.type && (
        <View className={`p-2 rounded-md mb-3 ${
          status.type === 'success' ? 'bg-success/10' :
          status.type === 'error' ? 'bg-danger/10' :
          'bg-gray-100'
        }`}>
          <Text className={`text-sm ${
            status.type === 'success' ? 'text-success' :
            status.type === 'error' ? 'text-danger' :
            'text-gray-600'
          }`}>
            {status.message || (status.type === 'loading' ? 'Running...' : '')}
          </Text>
        </View>
      )}

      <Pressable
        onPress={handleRun}
        disabled={status.type === 'loading'}
        className={`py-2 px-4 rounded-md ${
          status.type === 'loading' ? 'bg-primary/50' : 'bg-primary active:opacity-80'
        }`}
      >
        {status.type === 'loading' ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="text-white text-center font-medium">Run</Text>
        )}
      </Pressable>
    </View>
  );
};

export default TroubleshootItem;
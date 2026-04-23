import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';

interface FieldDef {
  key: string;
  placeholder: string;
  required?: boolean;
}

interface TroubleshootItemProps {
  title: string;
  description: string;
  onRun: (value?: number, fields?: Record<string, string>) => Promise<void>;
  requiresInput?: boolean;
  inputPlaceholder?: string;
  fields?: FieldDef[];
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
  inputPlaceholder = "Enter value...",
  fields,
}: TroubleshootItemProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ type: null });

  const handleRun = async () => {
    try {
      setStatus({ type: 'loading' });
      if (requiresInput && !inputValue) {
        throw new Error('Please enter a value');
      }
      if (fields) {
        for (const f of fields) {
          if (f.required && !fieldValues[f.key]?.trim()) {
            throw new Error(`${f.placeholder} is required`);
          }
        }
        await onRun(undefined, fieldValues);
      } else {
        await onRun(requiresInput ? Number(inputValue) : undefined);
      }
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

      {requiresInput && !fields && (
        <TextInput
          className="border border-gray-300 rounded-md p-2 mb-3"
          placeholder={inputPlaceholder}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numeric"
        />
      )}

      {fields && fields.map((f) => (
        <TextInput
          key={f.key}
          className="border border-gray-300 rounded-md p-2 mb-2"
          placeholder={f.placeholder + (f.required ? ' *' : '')}
          value={fieldValues[f.key] ?? ''}
          onChangeText={(v) => setFieldValues((prev) => ({ ...prev, [f.key]: v }))}
          autoCapitalize="none"
        />
      ))}

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
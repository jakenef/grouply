import { colors } from "@/lib/theme";
import React, { ReactNode } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface FormFieldProps extends TextInputProps {
  /**
   * Label text to display above the input
   */
  label: string;

  /**
   * Optional error message to display
   */
  error?: string;

  /**
   * Optional helper text to display below the input
   */
  helperText?: string;

  /**
   * Custom styling for the label text
   */
  labelStyle?: object;

  /**
   * Custom className for the label text
   */
  labelClassName?: string;

  /**
   * Custom className for the container
   */
  containerClassName?: string;

  /**
   * Custom input component instead of default TextInput
   */
  customInput?: ReactNode;
}

/**
 * A standardized form field component with label and optional error message
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  labelStyle = {},
  labelClassName = "text-base font-semibold text-foreground mb-2",
  containerClassName = "mb-6",
  customInput,
  style = {},
  placeholderTextColor = colors.muted.DEFAULT,
  ...textInputProps
}) => {
  return (
    <View className={containerClassName}>
      <Text style={labelStyle} className={labelClassName}>
        {label}
      </Text>

      {customInput || (
        <TextInput
          placeholderTextColor={placeholderTextColor}
          style={[
            {
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: error ? colors.danger.DEFAULT : colors.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              height: textInputProps.multiline ? undefined : 45,
              fontSize: 16,
              color: colors.foreground,
              textAlignVertical: textInputProps.multiline ? "top" : "center",
              paddingVertical: textInputProps.multiline ? 12 : undefined,
            },
            style,
          ]}
          {...textInputProps}
        />
      )}

      {error && <Text className="text-sm text-danger mt-1">{error}</Text>}

      {helperText && !error && (
        <Text className="text-sm text-muted mt-1">{helperText}</Text>
      )}
    </View>
  );
};

export default FormField;

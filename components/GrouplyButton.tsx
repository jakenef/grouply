import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";

type ButtonVariant = "primary" | "outline" | "text";
type ButtonSize = "large" | "medium" | "small";
type IconPosition = "left" | "right" | "none";

interface GrouplyButtonProps extends PressableProps {
  label?: string; // Made optional to support icon-only buttons
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconPosition?: IconPosition;
  fullWidth?: boolean;
  iconOnly?: boolean; // New prop for icon-only buttons
}

export default function GrouplyButton({
  label,
  variant = "primary",
  size = "medium",
  isLoading = false,
  iconName,
  iconPosition = "none",
  fullWidth = false,
  iconOnly = false,
  disabled = false,
  style,
  className = "", // Support for additional className
  ...pressableProps
}: GrouplyButtonProps) {
  // Base button styling
  let buttonClasses = "rounded-2xl flex-row justify-center items-center";
  let textClasses = "font-semibold text-center";

  // Variant-specific styling
  switch (variant) {
    case "primary":
      buttonClasses += " bg-primary";
      textClasses += " text-white";
      break;
    case "outline":
      buttonClasses += " bg-white border border-primary";
      textClasses += " text-primary";
      break;
    case "text":
      buttonClasses += " bg-transparent";
      textClasses += " text-primary";
      break;
  }

  // Size-specific styling
  switch (size) {
    case "large":
      buttonClasses += " py-4";
      textClasses += " text-lg";
      // Make icon-only buttons square for large size
      if (iconOnly) buttonClasses += " px-4";
      break;
    case "medium":
      buttonClasses += " py-3";
      textClasses += " text-base";
      // Make icon-only buttons square for medium size
      if (iconOnly) buttonClasses += " px-3";
      break;
    case "small":
      buttonClasses += " py-2";
      textClasses += " text-sm";
      // Make icon-only buttons square for small size
      if (iconOnly) buttonClasses += " px-2";
      break;
  }

  // Add horizontal padding for text buttons
  if (!iconOnly) {
    buttonClasses += " px-4";
  }

  // Width styling
  if (fullWidth) {
    buttonClasses += " w-full";
  }

  // Disabled styling
  if (disabled || isLoading) {
    buttonClasses += " opacity-50";
  }

  // Add any additional classNames
  buttonClasses += ` ${className}`;

  // Icon size based on button size
  const iconSize = size === "large" ? 24 : size === "medium" ? 20 : 16;
  const iconColor = variant === "primary" ? "white" : "#4f47e5";

  return (
    <Pressable
      className={buttonClasses}
      disabled={disabled || isLoading}
      style={style}
      {...pressableProps}
    >
      {/* Show loading spinner */}
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "white" : "#4f47e5"}
        />
      ) : (
        <>
          {/* Left icon */}
          {iconName && (iconPosition === "left" || iconOnly) && (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={iconColor}
              style={{ marginRight: iconOnly || !label ? 0 : 8 }}
            />
          )}

          {/* Button text */}
          {label && !iconOnly && <Text className={textClasses}>{label}</Text>}

          {/* Right icon */}
          {iconName && iconPosition === "right" && !iconOnly && (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={iconColor}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

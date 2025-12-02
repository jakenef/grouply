export const colors = {
  primary: "#4f47e5",
  accent: "#e1e6fe",
  info: "#6199f8",
  muted: {
    DEFAULT: "#6d7281",
    darker: "#4a5562",
  },
  foreground: "#1f2836",
  background: {
    DEFAULT: "#ffffff",
    darker: "#f5f5f5",
  },
  border: "#f3f4f6",
  success: {
    DEFAULT: "#065e47",
    accent: "#d1fae6",
  },
  warning: {
    DEFAULT: "#93410f",
    accent: "#fef3c7",
  },
  danger: {
    DEFAULT: "#b91d1a",
    accent: "#fff3f2",
  },
};

// Optional: Export individual color groups for easier access
export const {
  primary,
  accent,
  muted,
  foreground,
  background,
  border,
  success,
  warning,
  danger,
} = colors;

/**
 * Standard font sizes for the application
 */
export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 18,
  xl: 20,
  xxl: 24,
};

/**
 * Standardized text input styles for consistent appearance across the app
 */
/**
 * Properly typed text input styles with correct TypeScript types
 * for textAlignVertical and other properties
 */
export const textInputStyles = {
  standard: {
    height: 45,
    fontSize: fontSizes.base,
    color: colors.foreground,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    textAlignVertical: "center" as const, // Type assertion for strict typing
  },
  // Add variants as needed (e.g., multiline, search, etc.)
  multiline: {
    minHeight: 100,
    fontSize: fontSizes.base,
    color: colors.foreground,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlignVertical: "top" as const, // Type assertion for strict typing
  },
  error: {
    borderColor: colors.danger.DEFAULT,
  },
};

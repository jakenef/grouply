import { colors } from "@/lib/theme";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

interface GrouplySliderProps {
  label: string;
  minValue: number;
  maxValue: number;
  minLimit: number;
  maxLimit: number;
  step?: number;
  valueLabels?: string[];
  onValuesChange?: (values: [number, number]) => void;
  formatLabel?: (value: number) => string;
  error?: string;
}

const GrouplySlider = ({
  label,
  minValue,
  maxValue,
  minLimit,
  maxLimit,
  step = 1,
  valueLabels,
  onValuesChange,
  formatLabel,
  error,
}: GrouplySliderProps) => {
  const [values, setValues] = useState<[number, number]>([minValue, maxValue]);

  useEffect(() => {
    setValues([minValue, maxValue]);
  }, [minValue, maxValue]);

  const handleValuesChange = (newValues: number[]) => {
    const typedValues: [number, number] = [newValues[0], newValues[1]];
    setValues(typedValues);
    if (onValuesChange) {
      onValuesChange(typedValues);
    }
  };

  const formatValueLabel = (value: number): string => {
    if (formatLabel) {
      return formatLabel(value);
    }

    if (valueLabels && valueLabels[value - minLimit]) {
      return valueLabels[value - minLimit];
    }

    return String(value);
  };

  const isMaxValue = (value: number): boolean => {
    return value === maxLimit;
  };

  return (
    <View className="mb-6">
      <Text className="text-base font-semibold text-foreground mb-2">
        {label}
      </Text>

      <View className="bg-white border rounded-xl p-4 border-border">
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-muted">
            {formatValueLabel(values[0])}
          </Text>
          <Text className="text-sm text-muted">
            {formatValueLabel(values[1])}
            {isMaxValue(values[1]) ? "+" : ""}
          </Text>
        </View>

        <MultiSlider
          values={[values[0], values[1]]}
          min={minLimit}
          max={maxLimit}
          step={step}
          allowOverlap={false}
          snapped
          sliderLength={280}
          onValuesChange={handleValuesChange}
          selectedStyle={{ backgroundColor: colors.primary }}
          unselectedStyle={{ backgroundColor: colors.border }}
          markerStyle={{
            backgroundColor: colors.primary,
            height: 20,
            width: 20,
          }}
          pressedMarkerStyle={{
            backgroundColor: colors.accent,
            height: 24,
            width: 24,
          }}
          containerStyle={{
            height: 40,
            alignItems: "center",
          }}
        />
      </View>

      {error && <Text className="text-sm text-danger mt-1">{error}</Text>}
    </View>
  );
};

export default GrouplySlider;

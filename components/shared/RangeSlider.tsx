import { colors } from "@/lib/theme";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

interface RangeSliderProps {
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
  valuePrefix?: string;
  valueSuffix?: string;
  sliderLength?: number;
}

const RangeSlider = ({
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
  valuePrefix = "",
  valueSuffix = "",
  sliderLength = 280,
}: RangeSliderProps) => {
  const [values, setValues] = useState<number[]>([minValue, maxValue]);

  useEffect(() => {
    setValues([minValue, maxValue]);
  }, [minValue, maxValue]);

  const handleValuesChange = (newValues: number[]) => {
    setValues(newValues);
    if (onValuesChange) {
      onValuesChange([newValues[0], newValues[1]] as [number, number]);
    }
  };

  const formatValueLabel = (value: number): string => {
    if (formatLabel) {
      return formatLabel(value);
    }

    if (valueLabels && value - minLimit < valueLabels.length) {
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
            {valuePrefix}
            {formatValueLabel(values[0])}
            {valueSuffix}
          </Text>
          <Text className="text-sm text-muted">
            {valuePrefix}
            {formatValueLabel(values[1])}
            {valueSuffix}
            {isMaxValue(values[1]) ? "+" : ""}
          </Text>
        </View>

        <View className="items-center">
          <MultiSlider
            values={[values[0], values[1]]}
            min={minLimit}
            max={maxLimit}
            step={step}
            allowOverlap={false}
            snapped
            sliderLength={sliderLength}
            onValuesChange={handleValuesChange}
            selectedStyle={{ backgroundColor: colors.primary }}
            unselectedStyle={{ backgroundColor: colors.border }}
            markerStyle={{
              backgroundColor: colors.primary,
              height: 20,
              width: 20,
              borderRadius: 10,
            }}
            pressedMarkerStyle={{
              backgroundColor: colors.primary,
              height: 24,
              width: 24,
              borderRadius: 12,
            }}
            containerStyle={{
              height: 40,
            }}
          />
        </View>
      </View>

      {error && <Text className="text-sm text-danger mt-1">{error}</Text>}
    </View>
  );
};

export default RangeSlider;

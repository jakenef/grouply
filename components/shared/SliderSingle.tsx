import { colors } from "@/lib/theme";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

interface SliderSingleProps {
  label: string;
  value: number;
  minLimit: number;
  maxLimit: number;
  step?: number;
  valueLabels?: string[];
  onValueChange?: (value: number) => void;
  formatLabel?: (value: number) => string;
  error?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  sliderLength?: number;
}

const SliderSingle = ({
  label,
  value,
  minLimit,
  maxLimit,
  step = 1,
  valueLabels,
  onValueChange,
  formatLabel,
  error,
  valuePrefix = "",
  valueSuffix = "",
  sliderLength = 280,
}: SliderSingleProps) => {
  const [sliderValue, setSliderValue] = useState<number>(value);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const handleValueChange = (newValues: number[]) => {
    setSliderValue(newValues[0]);
    if (onValueChange) {
      onValueChange(newValues[0]);
    }
  };

  const formatValueLabel = (val: number): string => {
    if (formatLabel) {
      return formatLabel(val);
    }

    if (valueLabels && val - minLimit < valueLabels.length) {
      return valueLabels[val - minLimit];
    }

    return String(val);
  };

  const isMaxValue = (val: number): boolean => {
    return val === maxLimit;
  };

  return (
    <View className="mb-6">
      <Text className="text-base font-semibold text-foreground mb-2">
        {label}
      </Text>

      <View className="bg-white border rounded-xl p-4 border-border">
        <View className="flex-row justify-center mb-2">
          <Text className="text-sm text-muted">
            {valuePrefix}
            {formatValueLabel(sliderValue)}
            {valueSuffix}
            {isMaxValue(sliderValue) ? "+" : ""}
          </Text>
        </View>

        <View className="items-center">
          <MultiSlider
            values={[sliderValue]}
            min={minLimit}
            max={maxLimit}
            step={step}
            allowOverlap={false}
            snapped
            sliderLength={sliderLength}
            onValuesChange={handleValueChange}
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

export default SliderSingle;

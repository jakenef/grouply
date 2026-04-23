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
  formatRangeLabel?: (value: number) => string;
  error?: string;
  valuePrefix?: string;
  valueSuffix?: string;
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
  formatRangeLabel,
  error,
  valuePrefix = "",
  valueSuffix = "",
}: SliderSingleProps) => {
  const [sliderValue, setSliderValue] = useState<number>(value);
  const [sliderWidth, setSliderWidth] = useState(280);

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
    if (formatLabel) return formatLabel(val);
    if (valueLabels && val - minLimit < valueLabels.length)
      return valueLabels[val - minLimit];
    return `${valuePrefix}${String(val)}${valueSuffix}`;
  };

  const formatEndLabel = (val: number): string => {
    if (formatRangeLabel) return formatRangeLabel(val);
    if (valueLabels && val - minLimit < valueLabels.length)
      return valueLabels[val - minLimit];
    return `${valuePrefix}${String(val)}${valueSuffix}`;
  };

  const isMaxValue = (val: number) => val === maxLimit;

  return (
    <View
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
    >
      <View className="flex-row justify-between items-baseline mb-1">
        <Text className="text-base font-semibold text-foreground flex-1 mr-4">
          {label}
        </Text>
        <Text className="text-base font-semibold text-primary flex-shrink-0">
          {formatValueLabel(sliderValue)}
          {isMaxValue(sliderValue) ? "+" : ""}
        </Text>
      </View>

      <View className="h-px bg-border mb-3" />

      <MultiSlider
        values={[sliderValue]}
        min={minLimit}
        max={maxLimit}
        step={step}
        allowOverlap={false}
        snapped
        sliderLength={sliderWidth}
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
        containerStyle={{ height: 40 }}
      />

      <View className="flex-row justify-between">
        <Text className="text-xs text-muted">{formatEndLabel(minLimit)}</Text>
        <Text className="text-xs text-muted">{formatEndLabel(maxLimit)}</Text>
      </View>

      {error && <Text className="text-sm text-danger mt-1">{error}</Text>}
    </View>
  );
};

export default SliderSingle;

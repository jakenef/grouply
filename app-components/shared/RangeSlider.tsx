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
  formatRangeLabel?: (value: number) => string;
  error?: string;
  valuePrefix?: string;
  valueSuffix?: string;
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
  formatRangeLabel,
  error,
  valuePrefix = "",
  valueSuffix = "",
}: RangeSliderProps) => {
  const [values, setValues] = useState<number[]>([minValue, maxValue]);
  const [sliderWidth, setSliderWidth] = useState(280);

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
    if (formatLabel) return formatLabel(value);
    if (valueLabels && value - minLimit < valueLabels.length)
      return valueLabels[value - minLimit];
    return `${valuePrefix}${String(value)}${valueSuffix}`;
  };

  const formatEndLabel = (value: number): string => {
    if (formatRangeLabel) return formatRangeLabel(value);
    if (valueLabels && value - minLimit < valueLabels.length)
      return valueLabels[value - minLimit];
    return `${valuePrefix}${String(value)}${valueSuffix}`;
  };

  const isMaxValue = (value: number) => value === maxLimit;

  return (
    <View
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
    >
      <View className="flex-row justify-between items-baseline mb-1">
        <Text className="text-base font-semibold text-foreground flex-1 mr-4">
          {label}
        </Text>
        <Text className="text-base font-semibold text-primary flex-shrink-0">
          {formatValueLabel(values[0])} –{" "}
          {formatValueLabel(values[1])}
          {isMaxValue(values[1]) ? "+" : ""}
        </Text>
      </View>

      <View className="h-px bg-border mb-3" />

      <View style={{ paddingHorizontal: 12 }}>
        <MultiSlider
          values={[values[0], values[1]]}
          min={minLimit}
          max={maxLimit}
          step={step}
          allowOverlap={false}
          snapped
          sliderLength={sliderWidth - 24}
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
          containerStyle={{ height: 40 }}
        />
      </View>

      <View className="flex-row justify-between">
        <Text className="text-xs text-muted">{formatEndLabel(minLimit)}</Text>
        <Text className="text-xs text-muted">{formatEndLabel(maxLimit)}+</Text>
      </View>

      {error && <Text className="text-sm text-danger mt-1">{error}</Text>}
    </View>
  );
};

export default RangeSlider;

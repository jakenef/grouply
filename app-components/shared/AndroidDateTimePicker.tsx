import React from "react";
import { DateTimePicker } from "./DateTimePicker";

interface AndroidDateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  containerClassName?: string;
}

export const AndroidDateTimePicker: React.FC<AndroidDateTimePickerProps> = ({
  label,
  value,
  onChange,
  mode = "datetime",
  containerClassName = "mb-6",
}) => {
  return (
    <DateTimePicker
      label={label}
      value={value}
      onChange={onChange}
      mode={mode}
      containerClassName={containerClassName}
    />
  );
};

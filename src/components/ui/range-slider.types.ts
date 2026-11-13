export type RangeValue = [number, number];

export type RangeSliderProps = {
  value: RangeValue;
  min: number;
  max: number;
  step: number;
  onChange: (value: RangeValue) => void;
  onCommit?: (value: RangeValue) => void;
  label: string;
};

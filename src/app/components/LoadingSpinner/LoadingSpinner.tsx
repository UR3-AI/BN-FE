import type { LoadingSpinnerProps } from "./LoadingSpinner.type";

const borderTopColorStyles = {
  current: "border-t-current",
  white: "border-t-white",
  black: "border-t-black",
  primary: "border-t-primary",
} as const;

const LoadingSpinner = ({
  size = "100%",
  weight = "0.2rem",
  color = "current",
}: LoadingSpinnerProps) => {
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      <div
        className={`w-full h-full rounded-full border-transparent ${borderTopColorStyles[color]} animate-loading-spinner`}
        style={{ borderWidth: weight }}
      />
    </div>
  );
};

export default LoadingSpinner;

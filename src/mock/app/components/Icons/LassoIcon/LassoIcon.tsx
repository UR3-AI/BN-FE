import type { IconCommonProps } from "../icon.type";

const LassoIcon = ({
  size = "2.4rem",
  fill = "currentColor",
  ...props
}: IconCommonProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      {...props}>
      <path d="M17 4c-3.08 0-5.68 2.09-6.44 4.93C9.2 8.35 7.7 8 6.15 8 3.34 8 1 9.83 1 12.29c0 1.63 1.06 3.05 2.63 3.84-.4.67-.63 1.42-.63 2.22C3 20.36 4.64 22 6.65 22c1.4 0 2.63-.78 3.25-1.93.25.02.5.04.75.04C16.94 20.11 22 16.17 22 12c0-4.42-2.24-8-5-8z" />
    </svg>
  );
};

export default LassoIcon;

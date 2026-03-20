import type { IconCommonProps } from "../icon.type";

const ChevronRightIcon = ({
  size = "2.4rem",
  fill = "none",
  stroke = "currentColor",
  ...props
}: IconCommonProps & { stroke?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      {...props}>
      <path
        d="M9 18l6-6-6-6"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ChevronRightIcon;

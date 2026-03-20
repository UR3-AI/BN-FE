import type { IconCommonProps } from "../icon.type";

const PasskeyIcon = ({
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
      <path d="M2 17v2h4v-2H2zm6.5 0v2H20v-2H8.5zM2 12v2h10v-2H2zm12.5 0v2H20v-2h-5.5zM2 7v2h4V7H2zm6.5 0v2H20V7H8.5z" />
    </svg>
  );
};

export default PasskeyIcon;

import type { IconCommonProps } from "../icon.type";

const CursorIcon = ({
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
      <path d="M13.64 21.97l-2.73-5.44L7 19.5V4.5l11.5 9h-5.79l2.73 5.44-1.8.53z" />
    </svg>
  );
};

export default CursorIcon;

import type { IconCommonProps } from "../icon.type";

const ArrowOutwardIcon = ({
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
      <path d="M6 6v2h8.59L5 17.59 6.41 19 16 9.41V18h2V6z" />
    </svg>
  );
};

export default ArrowOutwardIcon;

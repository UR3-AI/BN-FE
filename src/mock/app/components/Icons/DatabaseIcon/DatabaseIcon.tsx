import type { IconCommonProps } from "../icon.type";

const DatabaseIcon = ({
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
      <path d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2zM6 17V14.77c1.61.77 3.72 1.23 6 1.23s4.39-.46 6-1.23V17c0 .5-2.13 2-6 2s-6-1.5-6-2z" />
    </svg>
  );
};

export default DatabaseIcon;

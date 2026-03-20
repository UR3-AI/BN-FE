import type { IconCommonProps } from "../icon.type";

const BubbleChartIcon = ({
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
      <path d="M7 10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm4.5-10C10.12 6 9 4.88 9 3.5S10.12 1 11.5 1 14 2.12 14 3.5 12.88 6 11.5 6zm0-3c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM16.5 9C14.01 9 12 11.01 12 13.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5S18.99 9 16.5 9zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
};

export default BubbleChartIcon;

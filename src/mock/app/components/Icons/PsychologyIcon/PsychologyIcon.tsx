import type { IconCommonProps } from "../icon.type";

const PsychologyIcon = ({
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
      <path d="M13 8.57c-.79 0-1.43.64-1.43 1.43s.64 1.43 1.43 1.43 1.43-.64 1.43-1.43-.64-1.43-1.43-1.43zm-4.07-2.13c-.6 0-1.09.49-1.09 1.09s.49 1.09 1.09 1.09 1.09-.49 1.09-1.09-.49-1.09-1.09-1.09zM13 3C9.25 3 6.2 5.94 6.02 9.64L4.1 12.2a.5.5 0 00.4.8H6v3c0 1.1.9 2 2 2h1v3h7v-4.68c2.36-1.12 4-3.53 4-6.32 0-3.87-3.13-7-7-7z" />
    </svg>
  );
};

export default PsychologyIcon;

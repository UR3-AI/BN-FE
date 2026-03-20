import type { IconCommonProps } from "../icon.type";

const PhotoCameraIcon = ({
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
      <path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zm9-8.6h-3.17L16 4.6H8L6.17 6.6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2z" />
    </svg>
  );
};

export default PhotoCameraIcon;

import type { ReactNode } from "react";

import type { HTMLMotionProps } from "motion/react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";
type ButtonSize = "s" | "m" | "l";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  isLoading?: boolean;
  children?: ReactNode;
}

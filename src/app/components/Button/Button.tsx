import { LoadingSpinner } from "@app/components/LoadingSpinner";

import {
  disabledVariantStyles,
  sizeStyles,
  spinnerSizes,
  tapStyles,
  variantStyles,
} from "./Button.constants";
import type { ButtonProps } from "./Button.type";

import { motion } from "motion/react";

const Button = ({
  variant = "primary",
  size = "m",
  icon,
  isLoading,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  const showIcon = icon && size !== "s";

  return (
    <motion.button
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : tapStyles[variant]}
      transition={{ duration: 0.15 }}
      className={`rounded-[0.6rem] font-semibold gap-[0.8rem] inline-flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-100 ${sizeStyles[size]} ${disabled ? disabledVariantStyles[variant] : variantStyles[variant]} ${className}`}
      {...rest}
    >
      {isLoading && (
        <LoadingSpinner
          size={spinnerSizes[size]}
          weight="0.2rem"
        />
      )}

      {!isLoading && (
        <>
          {showIcon && (
            <span className="w-[2rem] h-[2rem] inline-flex items-center justify-center">
              {icon}
            </span>
          )}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;

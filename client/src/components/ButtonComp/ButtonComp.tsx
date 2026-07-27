import { Button } from "@material-tailwind/react";
import { twMerge } from "tailwind-merge";

export default function ButtonComp({
  variant = "filled",
  onClick,
  className,
  label,
  type = "submit",
  loading,
  disabled,
}: InputProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      color="blue"
      type={type}
      className={twMerge(
        `flex w-full justify-center capitalize font-medium rounded-md bg-lightPrimary dark:bg-darkPrimary px-3 py-1.5 text-sm leading-6 text-white shadow-sm hover:bg-indigo-700`,
        className,
      )}
      loading={!!loading}
      disabled={loading || disabled}
    >
      {label}
    </Button>
  );
}

interface InputProps {
  onClick?: () => void;
  className?: string;
  label: string;
  type?: "submit" | "button" | "reset";
  loading?: boolean;
  disabled?: boolean;
  variant?: "filled" | "gradient" | "text" | "outlined";
}

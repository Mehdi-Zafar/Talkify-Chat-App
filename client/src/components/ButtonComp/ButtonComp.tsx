import { Button } from "@material-tailwind/react";
import { twMerge } from "tailwind-merge";

export default function ButtonComp({
  onClick,
  className,
  label,
  type = "submit",
  loading,
}: InputProps) {
  return (
    <Button
      onClick={onClick}
      type={type}
      className={twMerge(
        `flex w-full justify-center capitalize font-medium rounded-md bg-lightPrimary dark:bg-darkPrimary px-3 py-1.5 text-sm leading-6 text-white shadow-sm hover:bg-indigo-700`,
        className
      )}
      loading={!!loading}
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
}

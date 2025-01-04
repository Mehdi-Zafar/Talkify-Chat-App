import { Button } from "@material-tailwind/react";

export default function ButtonComp({
  onClick,
  className,
  label,
  type = "submit",
}: InputProps) {
  return (
    <Button
      onClick={onClick}
      type={type}
      className={`flex w-full justify-center rounded-md bg-lightPrimary dark:bg-darkPrimary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
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
}

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { HTMLInputTypeAttribute, useState } from "react";
import { twMerge } from "tailwind-merge";

export default function InputField({
  label,
  name,
  placeholder = "",
  type = "text",
  disabled = false,
  register,
  error,
  containerClass,
  labelClass,
  inputClass,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className={containerClass}>
      {label ? (
        <label
          className={twMerge(
            `block text-sm font-semibold leading-6 text-lightText dark:text-darkText`,
            labelClass
          )}
        >
          {label}
        </label>
      ) : null}
      <div className="relative mt-1">
        <input
          name={name}
          placeholder={placeholder}
          type={showPassword ? "text" : type}
          className={twMerge(
            `block w-full rounded-md border border-gray-50 dark:border-darkPrimary px-4 py-2 bg-white dark:bg-darkBody text-lightText dark:text-darkText shadow-sm placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6`,
            inputClass
          )}
          {...register}
          disabled={disabled}
        />
        {type === "password" ? (
          <span
            className="absolute top-1/2 -translate-y-1/2 right-3 z-10 cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-4 text-lightText dark:text-darkText" />
            ) : (
              <EyeIcon className="w-4 text-lightText dark:text-darkText" />
            )}
          </span>
        ) : null}
      </div>
      {error && (
        <small className="text-red-500 font-medium uppercase mt-2 block">
          {error?.message}
        </small>
      )}
    </div>
  );
}

interface InputProps {
  label?: string;
  type?: HTMLInputTypeAttribute;
  name?: string;
  placeholder?: string;
  register?: any;
  error?: any;
  disabled?: boolean;
  className?: string;
  containerClass?: string;
  labelClass?: string;
  inputClass?: string;
}

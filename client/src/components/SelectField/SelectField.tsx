import { Select } from "@headlessui/react";

export default function SelectField({
  label,
  className,
  placeholder,
  options,
  disabled = false,
  register,
  error,
}: InputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold leading-6 text-lightText dark:text-darkText mb-1">
        {label}
      </label>
      <Select
        {...register}
        disabled={disabled}
        className={`block w-full rounded-md px-2 py-2 border border-gray-50 dark:border-darkPrimary bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText shadow-sm placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6`}
      >
        <option value="" selected disabled>
          {placeholder}
        </option>
        {options?.map((option) => (
          <option value={option?.value}>{option?.label}</option>
        ))}
      </Select>
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
  type?: string;
  placeholder?: string;
  register?: any;
  error?: any;
  disabled?: boolean;
  className?: string;
  options?: {
    label: string;
    value: string;
  }[];
}

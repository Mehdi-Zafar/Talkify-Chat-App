import { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

export default function PhoneNumberField({
  label,
  name,
  placeholder = "",
  value = "",
  disabled = false,
  register,
  error,
}: InputProps) {
  const [phone, setPhone] = useState(value);
  return (
    <div>
      <label className="block text-sm font-semibold leading-6 text-lightText dark:text-darkText mb-1">
        {label}
      </label>
      <PhoneInput
        defaultCountry="pk"
        value={phone}
        {...register}
        disabled={disabled}
        name={name}
        placeholder={placeholder}
        onChange={(phone) => setPhone(phone)}
        className="!bg-lightBg dark:!bg-darkBg"
        countrySelectorStyleProps={{
          buttonClassName:
            "!bg-lightBg dark:!bg-darkBg border !border-gray-50 dark:!border-darkPrimary",
        }}
        inputClassName="flex-1 rounded-md border !border-gray-50 dark:!border-darkPrimary px-4 py-2 !text-lightText dark:!text-darkText !bg-lightBg dark:!bg-darkBg shadow-sm placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6"
      />
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
  name?: string;
  placeholder?: string;
  value: string;
  disabled?: boolean;
  register?: any;
  error?: any;
}

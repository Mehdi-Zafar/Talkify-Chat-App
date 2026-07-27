import { useState } from "react";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
// Minimal CSS — only resets, no opinionated styles
import "react-phone-number-input/style.css";

export default function PhoneNumberField({
  label,
  name,
  placeholder = "",
  value = "",
  disabled = false,
  register,
  error,
}: InputProps) {
  const [phone, setPhone] = useState<string>(value);

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold leading-6 text-lightText dark:text-darkText mb-1">
          {label}
        </label>
      )}
      <PhoneInput
        defaultCountry="PK"
        value={phone}
        onChange={(val) => setPhone(val ?? "")}
        disabled={disabled}
        name={name}
        placeholder={placeholder}
        // Tailwind classes applied via these props
        className="flex gap-2 !bg-lightBg dark:!bg-darkBg"
        numberInputProps={{
          className:
            "flex-1 rounded-md border border-gray-50 dark:border-darkPrimary px-4 py-2 text-lightText dark:text-darkText bg-lightBg dark:bg-darkBg shadow-sm placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6",
        }}
        countrySelectProps={{
          className:
            "bg-lightBg dark:bg-darkBg border border-gray-50 dark:border-darkPrimary rounded-md text-lightText dark:text-darkText",
        }}
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

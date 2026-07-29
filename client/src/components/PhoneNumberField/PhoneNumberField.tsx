import { Controller, Control } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface InputProps {
  label?: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  control: Control<any>;
  error?: any;
}

export default function PhoneNumberField({
  label,
  name,
  placeholder = "",
  disabled = false,
  control,
  error,
}: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold leading-6 text-lightText dark:text-darkText mb-1">
          {label}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <PhoneInput
            defaultCountry="PK"
            value={field.value}
            onChange={(val) => field.onChange(val ?? "")}
            onBlur={field.onBlur}
            disabled={disabled}
            placeholder={placeholder}
            className="flex gap-2 bg-lightBg! dark:bg-darkBg!"
            numberInputProps={{
              className:
                "flex-1 rounded-md border border-gray-50 dark:border-darkPrimary px-4 py-2 text-lightText dark:text-darkText bg-lightBg dark:bg-darkBg shadow-sm placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6 focus:ring-2 focus:ring-lightPrimary",
            }}
            countrySelectProps={{
              className:
                "bg-lightBg dark:bg-darkBg border border-gray-50 dark:border-darkPrimary rounded-md text-lightText dark:text-darkText",
            }}
          />
        )}
      />
      {error && (
        <small className="text-red-500 font-medium uppercase mt-2 block">
          {error?.message}
        </small>
      )}
    </div>
  );
}

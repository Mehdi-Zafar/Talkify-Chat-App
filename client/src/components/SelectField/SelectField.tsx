import { Controller, Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  control: Control<any>;
  name: string;
  error?: any;
  disabled?: boolean;
  options?: { label: string; value: string }[];
}

export default function SelectField({
  label,
  placeholder,
  control,
  name,
  error,
  disabled = false,
  options,
}: SelectFieldProps) {
  return (
    <div>
      {label ? (
        <label className="block text-sm font-semibold leading-6 text-lightText dark:text-darkText mb-1">
          {label}
        </label>
      ) : null}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full py-2 px-4 bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText border-gray-50 dark:border-darkPrimary mt-1 shadow-sm placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6 focus:ring-2 focus:ring-lightPrimary">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="">
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

export default function InputField({
  label,
  name,
  placeholder = "",
  type = "text",
  disabled = false,
  register,
  error,
}: InputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold leading-6 text-lightText dark:text-darkText">
        {label}
      </label>
      <div className="mt-1">
        <input
          name={name}
          placeholder={placeholder}
          type={type}
          className="block w-full rounded-md border border-gray-50 dark:border-darkPrimary px-4 py-2 bg-white dark:bg-darkBody text-lightText dark:text-darkText shadow-sm placeholder:text-gray-400 outline-none sm:text-sm sm:leading-6"
          {...register}
          disabled={disabled}
        />
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
  type?: string;
  name?: string;
  placeholder?: string;
  register?: any;
  error?: any;
  disabled?: boolean;
  className?: string;
}

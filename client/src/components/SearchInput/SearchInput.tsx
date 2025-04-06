import { ChangeEvent } from "react";

export default function SearchInput({ value, onChange }: InputProps) {
  return (
    <div className="relative my-2">
      <input
        type="text"
        className="w-full bg-lightBg dark:bg-darkBg placeholder:text-slate-400 text-lightText dark:text-darkText text-sm border border-slate-200 dark:border-gray-800 rounded-md pl-8 pr-4 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
        placeholder="Search"
        value={value}
        onChange={onChange}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="blue"
        className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2"
      >
        <path
          fillRule="evenodd"
          d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
          clipRule="evenodd"
        ></path>
      </svg>
    </div>
  );
}

interface InputProps {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

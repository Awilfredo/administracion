import { useId } from "react";

function Select({ children, label = "", onChange, value = "" }) {
    const inpuId = useId();
    return (
        <div className="flex flex-col">
            <label
                className="text-stone-600 text-sm font-medium"
                htmlFor={inpuId}
            >
                {label}
            </label>
            <select
                value={value}
                onChange={onChange}
                id={inpuId}
                className="mt-2 block w-full rounded-md border border-gray-200 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
                {children}
            </select>
        </div>
    );
}

export default Select;
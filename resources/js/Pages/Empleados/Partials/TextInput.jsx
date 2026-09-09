import { useId } from "react";

function TextInput({
    label,
    placeholder,
    type = "text",
    value = "",
    onChange,
    list = "",
    className='', 
    disabled = false
}) {
    const inputId = useId();
    return (
        <div className="flex flex-col">
            <label
                htmlFor={inputId}
                className="text-stone-600 text-sm font-medium"
            >
                {label}
            </label>
            <input
                disabled={disabled}
                list={list}
                onChange={onChange}
                type={type}
                id={inputId}
                placeholder={placeholder}
                className={"mt-2 block w-full rounded-md border border-gray-200 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 " + className}
                value={value}
            />
        </div>
    );
}

export default TextInput;

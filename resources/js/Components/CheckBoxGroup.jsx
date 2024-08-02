import { useId } from "react";
import Checkbox from "./Checkbox";


export const CheckBoxGroup = ({ label, value, onChange }) => {
    const id = useId()
    return (
        <div>
        <label className="mr-2" htmlFor={id}>
            {label}
        </label>
        <Checkbox id={id} value={value} onChange={onChange}/>
    </div>
    );
};

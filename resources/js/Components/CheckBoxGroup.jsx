import Checkbox from "./Checkbox";


export const CheckBoxGroup = ({ label, checked, onToggle, id }) => {
    console.log({id});
    return (
        <>
            <label className='ms-2' onClick={onToggle} htmlFor={id}>{label}</label>
            <Checkbox checked={checked} onChange={onToggle} id={id} ></Checkbox>
        </>
    );
};

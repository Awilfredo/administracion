import React, { useId } from 'react';

export const Select = ({ options, label, onChange }) => {
    const id = useId();
    return (
        <div className="form-group">
            <label
                htmlFor={id}
                style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }} // Ajusta el tamaño de la fuente según sea necesario
            >
                {label}
            </label>
            <select id={id} name={id} className="form-control" onChange={onChange}>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
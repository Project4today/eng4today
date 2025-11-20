import React from 'react';
import './Input.css';

const Input = ({ id, name, value, onChange, type = 'text', required = false, placeholder = '' }) => {
  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="form-input"
    />
  );
};

export default Input;

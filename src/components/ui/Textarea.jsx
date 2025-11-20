import React, { forwardRef } from 'react';
import './Input.css'; // Uses the same styles as Input

const Textarea = forwardRef(({ id, name, value, onChange, onKeyDown, rows = 1, placeholder = '', className = '' }, ref) => {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      rows={rows}
      placeholder={placeholder}
      className={`form-textarea ${className}`}
      ref={ref}
    />
  );
});

export default Textarea;

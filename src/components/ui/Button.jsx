import React from 'react';
import './Button.css';

const Button = ({children, onClick, variant = 'primary', className = '', disabled = false, title, style}) => {
    const buttonClasses = `
    btn
    ${variant === 'icon' ? 'btn-icon' : `btn-${variant}`}
    ${className}
  `;

    return (
        <button
            className={buttonClasses.trim()}
            onClick={onClick}
            disabled={disabled}
            title={title}
            style={style} // Pass the style prop
        >
            {children}
        </button>
    );
};

export default Button;

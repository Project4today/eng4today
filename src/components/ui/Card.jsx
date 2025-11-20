import React from 'react';
import { Link } from 'react-router-dom';
import './Card.css';

const Card = ({ children, to, className = '' }) => {
  const cardClasses = `card ${className}`;

  if (to) {
    return (
      <Link to={to} className={cardClasses}>
        {children}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export default Card;

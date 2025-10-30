import React from 'react';

const Notification = ({ show, message, type }) => {
  if (!show) return null;

  return (
    <div className={`notification ${type} show`}>
      {message}
    </div>
  );
};

export default Notification;
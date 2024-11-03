// src/common/components/AppSmallButton.tsx

import React from 'react';

interface AppSmallButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const AppSmallButton: React.FC<AppSmallButtonProps> = ({ children, onClick, ...props }) => {
  return (
    <button className="btn btn-sm w-fit h-fit" onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default AppSmallButton;

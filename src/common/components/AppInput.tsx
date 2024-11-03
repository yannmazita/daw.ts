// src/common/components/AppInput.tsx

import React, { forwardRef } from 'react';

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, className = "input-bordered input-xs", ...props }, ref) => {
    return (
      <>
        {label && <label className="label-text">{label}</label>}
        <input
          ref={ref}
          {...props}
          className={`input ${className}`}
        />
      </>
    );
  }
);

export default AppInput;

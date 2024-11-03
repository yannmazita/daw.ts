// src/common/components/AppSmallCheckbox.tsx

import React, { forwardRef } from 'react';

interface AppSmallCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftLabel?: React.ReactNode;
  rightLabel?: React.ReactNode;
}

const AppSmallCheckbox = forwardRef<HTMLInputElement, AppSmallCheckboxProps>(
  ({ leftLabel, rightLabel, ...props }, ref) => {
    return (
      <div className="form-control">
        <label className="label cursor-pointer">
          {leftLabel && <span className="label-text">{leftLabel}</span>}
          <input
            ref={ref}
            type="checkbox"
            className="checkbox checkbox-sm"
            {...props}
          />
          {rightLabel && <span className="label-text ml-1">{rightLabel}</span>}
        </label>
      </div>
    );
  }
);

export default AppSmallCheckbox;

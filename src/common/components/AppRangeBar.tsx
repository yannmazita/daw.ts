// src/features/component/AppRangeBar.tsx

import React, { forwardRef, ChangeEvent } from 'react';

interface AppRangeBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
}

const AppRangeBar = forwardRef<HTMLInputElement, AppRangeBarProps>(
  ({ min = 0, max = 100, step = 1, onChange, ...props }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      if (onChange) {
        onChange(value);
      }
    };

    return (
      <div id="app-range-bar-container" className="flex">
        <input
          ref={ref}
          type="range"
          className="range [--range-shdw:#5bcefa]"
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

export default AppRangeBar;

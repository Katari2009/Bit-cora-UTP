import React from 'react';

export const AppLogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="logoIconGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    <path
      d="M4 19.5V4.5C4 3.12 5.12 2 6.5 2H20v16H6.5C5.12 18 4 16.88 4 15.5V19.5z"
      stroke="url(#logoIconGradient)"
    />
    <path
      d="M7 17V2.5"
      stroke="url(#logoIconGradient)"
      strokeLinecap="round"
    />
    <path
      d="M9.5 10.5L12 13l4.5-4.5"
      stroke="#4ade80"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

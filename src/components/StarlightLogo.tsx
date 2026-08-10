import React from 'react';

interface StarlightLogoProps {
  className?: string;
  size?: number;
}

export const StarlightLogo: React.FC<StarlightLogoProps> = ({ className = "w-9 h-9", size }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Dark Teal Navy 'A' Star Gradient */}
        <linearGradient
          id="starlight-teal"
          x1="100"
          y1="20"
          x2="100"
          y2="180"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2B7B8E" />
          <stop offset="50%" stopColor="#1B5666" />
          <stop offset="100%" stopColor="#0D323E" />
        </linearGradient>

        {/* Vibrant Emerald Lime Green Arch Gradient */}
        <linearGradient
          id="starlight-green"
          x1="20"
          y1="120"
          x2="180"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Unified Dark Teal 'A' Star Frame */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="
          M 100 24
          L 122 84
          L 185 92
          L 138 108
          L 158 172
          L 128 172
          L 100 120
          L 72 172
          L 42 172
          L 62 108
          L 15 92
          L 78 84
          Z
          M 100 52
          L 114 84
          L 86 84
          Z
        "
        fill="url(#starlight-teal)"
      />

      {/* Single Smooth Sweeping Green Arch Ribbon */}
      <path
        d="
          M 20 148
          Q 100 90 180 148
          Q 100 112 20 148
          Z
        "
        fill="url(#starlight-green)"
      />
    </svg>
  );
};







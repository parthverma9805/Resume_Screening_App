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
        {/* Rich Dark Teal Navy Gradient for main 'A' Frame */}
        <linearGradient
          id="starlight-teal-smooth"
          x1="100"
          y1="20"
          x2="100"
          y2="180"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#226B7E" />
          <stop offset="60%" stopColor="#154B5A" />
          <stop offset="100%" stopColor="#0B2C37" />
        </linearGradient>

        {/* Vibrant Smooth Emerald Lime Green Arch Gradient */}
        <linearGradient
          id="starlight-green-smooth"
          x1="20"
          y1="100"
          x2="180"
          y2="160"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Subtle glow filter for the green arch */}
        <filter id="soft-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Smooth Dark Teal Navy 'A' Star Upper Structure with organic fluid curves */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="
          M 100 25
          C 103 25, 107 33, 115 55
          C 122 73, 148 80, 182 86
          C 187 87, 189 91, 186 95
          C 178 104, 155 106, 131 106
          C 125 106, 122 110, 125 116
          L 152 170
          C 154 174, 151 178, 146 178
          L 126 178
          C 123 178, 120 176, 118 172
          L 100 128
          L 82 172
          C 80 176, 77 178, 74 178
          L 54 178
          C 49 178, 46 174, 48 170
          L 75 116
          C 78 110, 75 106, 69 106
          C 45 106, 22 104, 14 95
          C 11 91, 13 87, 18 86
          C 52 80, 78 73, 85 55
          C 93 33, 97 25, 100 25
          Z
          M 100 58
          C 103 68, 107 78, 112 86
          C 112 87, 111 88, 109 88
          L 91 88
          C 89 88, 88 87, 88 86
          C 93 78, 97 68, 100 58
          Z
        "
        fill="url(#starlight-teal-smooth)"
      />

      {/* Smooth Fluid Emerald-Lime Green Sweeping Arch Ribbon */}
      <path
        d="
          M 22 142
          C 65 105, 135 105, 178 142
          C 182 145, 180 151, 175 152
          C 130 125, 70 125, 25 152
          C 20 151, 18 145, 22 142
          Z
        "
        fill="url(#starlight-green-smooth)"
        filter="url(#soft-glow)"
      />
    </svg>
  );
};








import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number | string;
}

/**
 * BrandLogo - Official emblem for Dealer & Loan Center
 * Styled after the teardrop emblem with database cylinder stack & golden leaf swoosh
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'w-full h-full', size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Dealer & Loan Center Emblem"
    >
      <defs>
        {/* Blue / Teal-Blue Water Drop Gradient */}
        <linearGradient id="psDropGrad" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="35%" stopColor="#0ea5e9" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Golden Orange Leaf Gradient */}
        <linearGradient id="psLeafGrad" x1="20%" y1="100%" x2="80%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="35%" stopColor="#f97316" />
          <stop offset="80%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>

        {/* Database Disc Top Surface Gradient */}
        <linearGradient id="psDbTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>

        {/* Subtle glow filter */}
        <filter id="psEmblemGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Main Teardrop Silhouette (Water Droplet curving around leaf) */}
      <path
        d="M50 4 C50 4, 12 48, 12 73 C12 92, 25 103, 42 105.5 C37.5 96, 37.5 83, 42.5 72 C47.5 60, 58 51, 70 45 C78 41, 82 32, 75 24 C66 14, 50 4, 50 4 Z"
        fill="url(#psDropGrad)"
        filter="url(#psEmblemGlow)"
      />

      {/* Central Database Discs Stack (3 cylindrical layers) */}
      <g transform="translate(37.5, 43)">
        {/* Disc 1 (Top Disc) */}
        <ellipse cx="14" cy="5" rx="12" ry="4.3" fill="url(#psDbTopGrad)" />
        <path
          d="M2 5 v4.2 c0 2.4 5.4 4.3 12 4.3 s12 -1.9 12 -4.3 v-4.2 c0 2.4 -5.4 4.3 -12 4.3 s-12 -1.9 -12 -4.3 Z"
          fill="#0284c7"
        />

        {/* Disc 2 (Middle Disc) */}
        <path
          d="M2 13.5 v4.2 c0 2.4 5.4 4.3 12 4.3 s12 -1.9 12 -4.3 v-4.2 c0 2.4 -5.4 4.3 -12 4.3 s-12 -1.9 -12 -4.3 Z"
          fill="#0284c7"
        />

        {/* Disc 3 (Bottom Disc) */}
        <path
          d="M2 22 v4.2 c0 2.4 5.4 4.3 12 4.3 s12 -1.9 12 -4.3 v-4.2 c0 2.4 -5.4 4.3 -12 4.3 s-12 -1.9 -12 -4.3 Z"
          fill="#0369a1"
        />
      </g>

      {/* Golden Leaf Swoosh (Wrapping lower-right contour) */}
      <path
        d="M48.5 106 C42.5 97, 41 83, 46.5 70 C52.5 56, 65 46, 78.5 39 C89 33.5, 93 43, 91.5 54 C89.5 70, 82 86, 70 97 C62 104, 53.5 106, 48.5 106 Z"
        fill="url(#psLeafGrad)"
      />

      {/* Clean White Leaf Vein / Boundary Arc */}
      <path
        d="M49 105 C55 94, 64 83, 78 65"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

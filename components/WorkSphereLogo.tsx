import React from 'react';

export default function WorkSphereLogo({
  size = 32,
  withText,
  showText,
}: {
  size?: number;
  withText?: boolean;
  showText?: boolean;
}) {
  const displayTitle = withText !== undefined ? withText : showText !== undefined ? showText : false;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      >
        <defs>
          {/* Subtle Glow Filter */}
          <filter id="wsGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Linear Gradients */}
          <linearGradient id="wsWPathGrad" x1="6" y1="12" x2="38" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="45%" stopColor="#B9A3FF" />
            <stop offset="75%" stopColor="#F48AC2" />
            <stop offset="100%" stopColor="#25D9D2" />
          </linearGradient>

          <linearGradient id="wsCrossLineGrad" x1="14" y1="30" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.4)" />
            <stop offset="100%" stopColor="rgba(37, 217, 210, 0.4)" />
          </linearGradient>

          <radialGradient id="wsNodeGlow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B9A3FF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </radialGradient>

          <radialGradient id="wsNodeGlow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFAEE0" />
            <stop offset="100%" stopColor="#F48AC2" />
          </radialGradient>

          <radialGradient id="wsNodeGlow3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6EE7E2" />
            <stop offset="100%" stopColor="#25D9D2" />
          </radialGradient>
        </defs>

        {/* Faint ambient glow behind logo */}
        <circle cx="22" cy="22" r="18" fill="url(#wsWPathGrad)" opacity="0.12" filter="url(#wsGlow)" />

        {/* Background Network Connecting Lines forming connected 'W' constellation */}
        <path
          d="M8 14L15 32L22 20L29 32L36 14"
          stroke="url(#wsWPathGrad)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Subtle Constellation Cross Lines */}
        <path
          d="M8 14L22 20M22 20L36 14M15 32L29 32"
          stroke="url(#wsCrossLineGrad)"
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />

        {/* Constellation Nodes */}
        {/* Node 1: Top Left */}
        <circle cx="8" cy="14" r="3.75" fill="url(#wsNodeGlow1)" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Node 2: Bottom Left */}
        <circle cx="15" cy="32" r="3.25" fill="#7C3AED" stroke="#B9A3FF" strokeWidth="1.5" />
        {/* Node 3: Center Apex */}
        <circle cx="22" cy="20" r="4.25" fill="url(#wsNodeGlow2)" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Node 4: Bottom Right */}
        <circle cx="29" cy="32" r="3.25" fill="#25D9D2" stroke="#FFFFFF" strokeWidth="1.25" />
        {/* Node 5: Top Right */}
        <circle cx="36" cy="14" r="3.75" fill="url(#wsNodeGlow3)" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Small satellite micro-nodes */}
        <circle cx="22" cy="11" r="1.5" fill="#F48AC2" opacity="0.75" />
        <circle cx="5" cy="24" r="1.2" fill="#B9A3FF" opacity="0.6" />
        <circle cx="39" cy="24" r="1.2" fill="#25D9D2" opacity="0.6" />
      </svg>

      {displayTitle && (
        <span
          className="worksphere-logo-text"
          style={{
            fontSize: 'clamp(1.15rem, 4vw, 1.35rem)',
            fontWeight: '700',
            color: 'var(--text-main)',
            letterSpacing: '-0.4px',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          WorkSphere
        </span>
      )}
    </div>
  );
}

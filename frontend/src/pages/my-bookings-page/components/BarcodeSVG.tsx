import React, { useMemo } from 'react';

interface BarcodeSVGProps {
  code?: string;
  className?: string;
  showText?: boolean;
  barColor?: string;
  textColor?: string;
}

export const BarcodeSVG: React.FC<BarcodeSVGProps> = ({
  code = 'X06138420082680826',
  className = 'w-full h-10',
  showText = true,
  barColor = 'currentColor',
  textColor
}) => {
  // Generate deterministic bar widths based on code
  const bars = useMemo(() => {
    const pattern: number[] = [];
    const normalizedCode = code.replace(/[^a-zA-Z0-9]/g, '') || 'CP2026';
    for (let i = 0; i < normalizedCode.length; i++) {
      const charCode = normalizedCode.charCodeAt(i);
      pattern.push((charCode % 3) + 1); // bar width: 1, 2, or 3
      pattern.push(((charCode >> 2) % 2) + 1); // gap width: 1 or 2
    }
    return pattern;
  }, [code]);

  let currentX = 4;
  const elements = [];
  for (let i = 0; i < bars.length; i += 2) {
    const barWidth = (bars[i] || 1) * 2;
    const gap = (bars[i + 1] || 1) * 1.5;
    elements.push(
      <rect key={i} x={currentX} y={0} width={barWidth} height={44} fill={barColor} />
    );
    currentX += barWidth + gap;
  }

  const formattedCode = useMemo(() => {
    // Format with spaces like "X 0 6 1 3 8 4 2 0 0 8 2 6 8 0 8 2 6"
    return code.replace(/\s+/g, '').split('').join(' ');
  }, [code]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg
        viewBox={`0 0 ${Math.max(currentX + 4, 180)} 44`}
        className={className}
        preserveAspectRatio="none"
      >
        {elements}
      </svg>
      {showText && (
        <span
          className={`text-[9px] font-mono tracking-[0.2em] mt-1 uppercase font-bold text-center block select-all ${
            textColor || 'text-zinc-400'
          }`}
        >
          {formattedCode}
        </span>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface ScorePillSelectorProps {
  value: number | null | undefined;
  onChange: (score: number | null) => void;
  descriptors?: Record<0 | 1 | 2 | 3 | 4, string>;
  criterionName?: string;
  disabled?: boolean;
}

export const ScorePillSelector: React.FC<ScorePillSelectorProps> = ({
  value,
  onChange,
  descriptors,
  criterionName,
  disabled = false,
}) => {
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);

  const scores: (0 | 1 | 2 | 3 | 4)[] = [0, 1, 2, 3, 4];

  return (
    <div className="relative inline-flex flex-col items-center">
      <div className="inline-flex rounded-lg bg-slate-900/90 p-0.5 border border-slate-700/80 shadow-inner">
        {scores.map((s) => {
          const isSelected = value === s;
          return (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                // If clicking currently selected, allow unselecting (setting null) or keeping
                onChange(isSelected ? null : s);
              }}
              onMouseEnter={() => setHoveredScore(s)}
              onMouseLeave={() => setHoveredScore(null)}
              className={cn(
                'w-7 h-7 flex items-center justify-center text-xs font-semibold rounded transition-all duration-150',
                isSelected
                  ? s === 4
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                    : s === 3
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                    : s === 2
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                    : s === 1
                    ? 'bg-orange-600 text-white shadow-sm ring-1 ring-orange-400'
                    : 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              title={descriptors ? `${s}: ${descriptors[s]}` : `Skor ${s}`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Interactive Floating Descriptor Tooltip */}
      {hoveredScore !== null && descriptors && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-2.5 rounded-lg bg-slate-900 text-slate-100 text-xs shadow-2xl border border-slate-700 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-1 mb-1 font-semibold border-b border-slate-800 pb-1">
            <span className="text-indigo-300 truncate">{criterionName || 'Rubrik'}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px]',
                hoveredScore === 4
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                  : hoveredScore === 3
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                  : hoveredScore === 2
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                  : hoveredScore === 1
                  ? 'bg-orange-950 text-orange-300 border border-orange-700/50'
                  : 'bg-rose-950 text-rose-300 border border-rose-700/50'
              )}
            >
              Skor {hoveredScore} ({(hoveredScore / 4) * 100})
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {descriptors[hoveredScore as 0 | 1 | 2 | 3 | 4]}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl p-4 space-y-4 animate-pulse-soft">
      <div className="bg-stone-200 h-48 rounded-xl w-full" />
      <div className="space-y-2">
        <div className="bg-stone-200 h-4 rounded w-2/3" />
        <div className="bg-stone-200 h-3 rounded w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="bg-stone-200 h-5 rounded w-1/4" />
        <div className="bg-stone-200 h-8 rounded-lg w-1/3" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="border border-stone-200/60 rounded-2xl overflow-hidden bg-white animate-pulse-soft">
      <div className="bg-stone-50 border-b border-stone-150 p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="bg-stone-200 h-4 rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-stone-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="bg-stone-150 h-5 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const KpiSkeleton = () => {
  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl p-5 space-y-3 animate-pulse-soft">
      <div className="flex justify-between items-center">
        <div className="bg-stone-200 h-3 rounded w-1/3" />
        <div className="bg-stone-200 h-8 w-8 rounded-lg" />
      </div>
      <div className="bg-stone-200 h-6 rounded w-1/2" />
      <div className="bg-stone-200 h-3 rounded w-2/3" />
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl p-6 space-y-4 animate-pulse-soft">
      <div className="bg-stone-200 h-4 rounded w-1/4" />
      <div className="bg-stone-200 h-64 rounded-xl w-full" />
    </div>
  );
};

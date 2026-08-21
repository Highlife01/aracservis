import React from 'react';

interface Props {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PlateBadge: React.FC<Props> = ({ plate, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 min-w-[90px]',
    md: 'text-sm px-2.5 py-1 min-w-[120px]',
    lg: 'text-base px-3 py-1.5 min-w-[150px] font-bold',
  };

  return (
    <div className={`inline-flex items-center rounded border-2 border-slate-900 bg-white text-black font-extrabold tracking-wider shadow-sm select-none font-mono ${sizeClasses[size]}`}>
      {/* Blue TR Euroband */}
      <div className="bg-[#003399] text-white flex flex-col items-center justify-center -ml-2 -my-1 px-1.5 py-1 rounded-l text-[9px] font-bold border-r border-slate-900 leading-tight">
        <span>TR</span>
      </div>
      <span className="flex-1 text-center font-black pl-1.5 uppercase">{plate}</span>
    </div>
  );
};

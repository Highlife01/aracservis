import React, { useState } from 'react';
import { DamagePoint } from '../../types';
import { AlertCircle, Plus, Trash2, ShieldAlert } from 'lucide-react';

interface Props {
  damagePoints: DamagePoint[];
  onChange: (points: DamagePoint[]) => void;
  readOnly?: boolean;
}

export const VehicleDamageCanvas: React.FC<Props> = ({ damagePoints, onChange, readOnly = false }) => {
  const [selectedView, setSelectedView] = useState<DamagePoint['view']>('TOP');
  const [selectedType, setSelectedType] = useState<DamagePoint['type']>('SCRATCH');
  const [selectedSeverity, setSelectedSeverity] = useState<DamagePoint['severity']>('LIGHT');
  const [activeNote, setActiveNote] = useState('');

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint: DamagePoint = {
      id: 'dmg-' + Math.random().toString(36).substr(2, 9),
      xPercent: Math.round(x * 10) / 10,
      yPercent: Math.round(y * 10) / 10,
      view: selectedView,
      type: selectedType,
      severity: selectedSeverity,
      note: activeNote.trim() || undefined
    };

    onChange([...damagePoints, newPoint]);
    setActiveNote('');
  };

  const removePoint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    onChange(damagePoints.filter(p => p.id !== id));
  };

  const currentViewPoints = damagePoints.filter(p => p.view === selectedView);

  const getDamageColor = (type: DamagePoint['type']) => {
    switch (type) {
      case 'SCRATCH': return 'bg-amber-500 border-amber-300 text-black';
      case 'DENT': return 'bg-rose-600 border-rose-300 text-white';
      case 'CRACK': return 'bg-purple-600 border-purple-300 text-white';
      case 'PAINT': return 'bg-blue-500 border-blue-200 text-white';
      default: return 'bg-red-500 border-white text-white';
    }
  };

  const getDamageLabel = (type: DamagePoint['type']) => {
    switch (type) {
      case 'SCRATCH': return 'Çizik';
      case 'DENT': return 'Göçük';
      case 'CRACK': return 'Kırık / Çatlak';
      case 'PAINT': return 'Boya Hasarı';
      case 'RUST': return 'Korozyon / Pas';
    }
  };

  return (
    <div className="space-y-4">
      {/* View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {(['TOP', 'FRONT', 'BACK', 'LEFT', 'RIGHT'] as const).map(view => (
            <button
              key={view}
              type="button"
              onClick={() => setSelectedView(view)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedView === view
                  ? 'bg-brand-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {view === 'TOP' && 'Üstten / Genel'}
              {view === 'FRONT' && 'Ön'}
              {view === 'BACK' && 'Arka'}
              {view === 'LEFT' && 'Sol Yan'}
              {view === 'RIGHT' && 'Sağ Yan'}
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300">
                {damagePoints.filter(p => p.view === view).length}
              </span>
            </button>
          ))}
        </div>

        {!readOnly && (
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-brand-400" />
            <span>Hasarlı noktayı işaretlemek için araca dokunun</span>
          </div>
        )}
      </div>

      {/* Toolbox (Type & Severity Selection) */}
      {!readOnly && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
          <div>
            <label className="text-slate-400 mb-1.5 block font-medium">Hasar Türü:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['SCRATCH', 'DENT', 'CRACK', 'PAINT'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1.5 rounded-lg border text-left font-medium flex items-center justify-between transition-all ${
                    selectedType === t
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{getDamageLabel(t)}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${getDamageColor(t).split(' ')[0]}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 mb-1.5 block font-medium">Şiddet:</label>
            <div className="flex gap-1.5">
              {(['LIGHT', 'MEDIUM', 'HEAVY'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSeverity(s)}
                  className={`flex-1 py-2 rounded-lg border text-center font-medium transition-all ${
                    selectedSeverity === s
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  {s === 'LIGHT' && 'Hafif'}
                  {s === 'MEDIUM' && 'Orta'}
                  {s === 'HEAVY' && 'Ağır'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 mb-1.5 block font-medium">Opsiyonel Not:</label>
            <input
              type="text"
              placeholder="Örn: 5cm çizik, taş sekmesi..."
              value={activeNote}
              onChange={e => setActiveNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}

      {/* Interactive 2D Vehicle Canvas */}
      <div 
        onClick={handleCanvasClick}
        className={`relative w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center select-none overflow-hidden ${
          !readOnly ? 'cursor-crosshair' : ''
        }`}
      >
        {/* Stylized 2D Vehicle Silhouettes in SVG */}
        <div className="absolute inset-0 flex items-center justify-center p-6 opacity-80 pointer-events-none">
          {selectedView === 'TOP' && (
            <svg viewBox="0 0 300 600" className="h-full w-auto max-h-80 drop-shadow-2xl">
              {/* Car Body (Top View) */}
              <rect x="50" y="80" width="200" height="440" rx="60" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" opacity="0.6"/>
              {/* Windshield Front */}
              <path d="M 70 180 Q 150 210 230 180 L 220 250 Q 150 270 80 250 Z" fill="#0f172a" stroke="#64748b" strokeWidth="2"/>
              {/* Windshield Rear */}
              <path d="M 80 430 Q 150 410 220 430 L 210 470 Q 150 455 90 470 Z" fill="#0f172a" stroke="#64748b" strokeWidth="2"/>
              {/* Sunroof / Roof */}
              <rect x="90" y="270" width="120" height="130" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="1.5"/>
              {/* Mirrors */}
              <rect x="25" y="190" width="25" height="40" rx="10" fill="#334155" stroke="#64748b" strokeWidth="1.5"/>
              <rect x="250" y="190" width="25" height="40" rx="10" fill="#334155" stroke="#64748b" strokeWidth="1.5"/>
              {/* Headlights */}
              <path d="M 60 100 Q 80 80 110 85" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <path d="M 240 100 Q 220 80 190 85" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" fill="none"/>
              {/* Taillights */}
              <path d="M 65 510 Q 85 520 110 515" stroke="#f87171" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <path d="M 235 510 Q 215 520 190 515" stroke="#f87171" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <text x="150" y="340" fill="#64748b" fontSize="14" fontWeight="600" textAnchor="middle">TAVAN & GENEL GÖRÜNÜM</text>
            </svg>
          )}

          {selectedView === 'FRONT' && (
            <svg viewBox="0 0 500 300" className="w-full max-w-md drop-shadow-2xl">
              <path d="M 80 240 L 420 240 L 430 180 L 390 120 L 340 70 L 160 70 L 110 120 L 70 180 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" opacity="0.6"/>
              <path d="M 125 125 L 375 125 L 335 75 L 165 75 Z" fill="#0f172a" stroke="#64748b" strokeWidth="2"/>
              <rect x="150" y="160" width="200" height="50" rx="8" fill="#090d16" stroke="#475569" strokeWidth="2"/>
              <circle cx="110" cy="160" r="25" fill="#0f172a" stroke="#fef08a" strokeWidth="3"/>
              <circle cx="390" cy="160" r="25" fill="#0f172a" stroke="#fef08a" strokeWidth="3"/>
              <text x="250" y="105" fill="#64748b" fontSize="14" fontWeight="600" textAnchor="middle">ÖN GÖRÜNÜM</text>
            </svg>
          )}

          {selectedView === 'BACK' && (
            <svg viewBox="0 0 500 300" className="w-full max-w-md drop-shadow-2xl">
              <path d="M 80 240 L 420 240 L 430 180 L 390 120 L 340 70 L 160 70 L 110 120 L 70 180 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" opacity="0.6"/>
              <path d="M 125 125 L 375 125 L 335 75 L 165 75 Z" fill="#0f172a" stroke="#64748b" strokeWidth="2"/>
              <rect x="180" y="170" width="140" height="40" rx="6" fill="#090d16" stroke="#475569" strokeWidth="2"/>
              <circle cx="110" cy="160" r="25" fill="#0f172a" stroke="#f87171" strokeWidth="3"/>
              <circle cx="390" cy="160" r="25" fill="#0f172a" stroke="#f87171" strokeWidth="3"/>
              <text x="250" y="105" fill="#64748b" fontSize="14" fontWeight="600" textAnchor="middle">ARKA GÖRÜNÜM</text>
            </svg>
          )}

          {(selectedView === 'LEFT' || selectedView === 'RIGHT') && (
            <svg viewBox="0 0 600 240" className="w-full max-w-lg drop-shadow-2xl">
              <path d="M 40 180 L 100 180 Q 140 120 180 180 L 420 180 Q 460 120 500 180 L 560 180 L 550 120 L 480 80 L 360 50 L 220 50 L 130 90 L 50 120 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" opacity="0.6"/>
              <circle cx="140" cy="180" r="32" fill="#090d16" stroke="#64748b" strokeWidth="4"/>
              <circle cx="460" cy="180" r="32" fill="#090d16" stroke="#64748b" strokeWidth="4"/>
              <text x="300" y="130" fill="#64748b" fontSize="14" fontWeight="600" textAnchor="middle">
                {selectedView === 'LEFT' ? 'SOL YAN PROFİL' : 'SAĞ YAN PROFİL'}
              </text>
            </svg>
          )}
        </div>

        {/* Render Points on Current View */}
        {currentViewPoints.map((p, idx) => (
          <div
            key={p.id}
            style={{ left: `${p.xPercent}%`, top: `${p.yPercent}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
          >
            <div className={`relative flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs shadow-lg border-2 cursor-pointer transition-transform hover:scale-125 ${getDamageColor(p.type)}`}>
              <span>{idx + 1}</span>
              <span className={`absolute inset-0 rounded-full damage-pulse ${getDamageColor(p.type)} -z-10`} />
            </div>

            {/* Hover Tooltip Card */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-slate-900 text-slate-100 text-xs p-2.5 rounded-lg border border-slate-700 shadow-2xl min-w-[160px] z-30 pointer-events-auto">
              <div className="font-bold flex items-center justify-between text-brand-400">
                <span>#{idx + 1} {getDamageLabel(p.type)}</span>
                {!readOnly && (
                  <button 
                    type="button"
                    onClick={(e) => removePoint(p.id, e)} 
                    className="text-rose-400 hover:text-rose-300 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Şiddet: {p.severity}</div>
              {p.note && <div className="text-slate-300 mt-1 italic">"{p.note}"</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Point Inventory List */}
      {damagePoints.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>Tespit Edilen Hasar Kayıtları ({damagePoints.length})</span>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-rose-400 hover:underline text-[11px]"
              >
                Tümünü Temizle
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {damagePoints.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${getDamageColor(p.type)}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-medium text-slate-200">
                      {getDamageLabel(p.type)} ({p.view})
                    </div>
                    {p.note && <div className="text-slate-400 text-[11px] truncate max-w-[140px]">{p.note}</div>}
                  </div>
                </div>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => removePoint(p.id, e)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

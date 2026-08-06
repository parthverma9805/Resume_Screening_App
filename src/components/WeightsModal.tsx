import React, { useState } from 'react';
import { EvaluationWeights } from '../types';
import { X, Sliders, RotateCcw, Check, Info } from 'lucide-react';

interface WeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: EvaluationWeights;
  onSaveWeights: (newWeights: EvaluationWeights) => void;
}

export const WeightsModal: React.FC<WeightsModalProps> = ({
  isOpen,
  onClose,
  weights,
  onSaveWeights,
}) => {
  const [localWeights, setLocalWeights] = useState<EvaluationWeights>({ ...weights });

  if (!isOpen) return null;

  const total =
    localWeights.hardSkills +
    localWeights.softSkills +
    localWeights.experience +
    localWeights.education;

  const handleReset = () => {
    setLocalWeights({
      hardSkills: 40,
      softSkills: 20,
      experience: 30,
      education: 10,
    });
  };

  const handleSave = () => {
    onSaveWeights(localWeights);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Evaluation Criteria Weights</h3>
              <p className="text-xs text-slate-500 font-medium">Customize how AI scores candidate match percentages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 p-1.5 rounded-2xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 font-medium flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Adjust the weight sliders to emphasize technical hard skills, years of experience, or educational background. Future AI resume evaluations will apply these proportion weights.
            </span>
          </div>

          {/* Hard Skills */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-800">Hard & Technical Skills</span>
              <span className="text-indigo-600 font-black">{localWeights.hardSkills}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localWeights.hardSkills}
              onChange={(e) => setLocalWeights({ ...localWeights, hardSkills: Number(e.target.value) })}
              className="w-full accent-indigo-600 bg-slate-200 rounded-lg cursor-pointer h-2"
            />
            <p className="text-[11px] text-slate-500 font-medium">Direct overlap with required framework, language, and tool keywords.</p>
          </div>

          {/* Experience */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-800">Relevant Work Experience</span>
              <span className="text-indigo-600 font-black">{localWeights.experience}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localWeights.experience}
              onChange={(e) => setLocalWeights({ ...localWeights, experience: Number(e.target.value) })}
              className="w-full accent-indigo-600 bg-slate-200 rounded-lg cursor-pointer h-2"
            />
            <p className="text-[11px] text-slate-500 font-medium">Years in role, leadership responsibility, and key achievements.</p>
          </div>

          {/* Soft Skills */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-800">Soft Skills & Communication</span>
              <span className="text-indigo-600 font-black">{localWeights.softSkills}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localWeights.softSkills}
              onChange={(e) => setLocalWeights({ ...localWeights, softSkills: Number(e.target.value) })}
              className="w-full accent-indigo-600 bg-slate-200 rounded-lg cursor-pointer h-2"
            />
            <p className="text-[11px] text-slate-500 font-medium">Mentorship, collaboration, project management, and problem solving.</p>
          </div>

          {/* Education */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-800">Education & Certifications</span>
              <span className="text-indigo-600 font-black">{localWeights.education}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localWeights.education}
              onChange={(e) => setLocalWeights({ ...localWeights, education: Number(e.target.value) })}
              className="w-full accent-indigo-600 bg-slate-200 rounded-lg cursor-pointer h-2"
            />
            <p className="text-[11px] text-slate-500 font-medium">Degrees, field of study, and relevant professional certifications.</p>
          </div>

          {/* Total Indicator */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Total Criteria Sum:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                total === 100
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {total}% {total !== 100 && '(Adjust to reach 100%)'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-200 transition-all"
            >
              <Check className="w-4 h-4" /> Save Weights
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { ActivityLevel, DietHistory, Discipline, Gender, Goal, TrainingTime } from '../types';
import { ChevronRight, Check } from 'lucide-react';

interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ selected, onClick, label, description, icon }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left group ${
      selected
        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-700'
    }`}
  >
    <div className="flex items-center gap-3">
        {icon && <div className={`p-2 rounded-lg ${selected ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500 group-hover:bg-white'}`}>{icon}</div>}
        <div>
        <div className="font-semibold">{label}</div>
        {description && <div className="text-sm text-slate-500 mt-1 leading-tight">{description}</div>}
        </div>
    </div>
    {selected && <Check className="w-5 h-5 text-emerald-600" />}
  </button>
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, unit, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">{label}</label>
    <div className="relative">
      <input
        {...props}
        className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-lg"
      />
      {unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  </div>
);

export const PrimaryButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean }> = ({ onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
      disabled
        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/30'
    }`}
  >
    {children}
    {!disabled && <ChevronRight className="w-5 h-5" />}
  </button>
);
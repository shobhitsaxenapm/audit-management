
import React, { useState, useEffect, useMemo } from 'react';
import type { Engagement, NewEngagementData, RACM, EngagementType } from '../types';
import { LEAD_PARTNERS, ENGAGEMENT_TYPES } from '../constants';
import { CloseIcon, ChevronDownIcon, CalendarIcon, InfoCircleIcon } from './icons/Icons';
import { AMZ_RACM_ID } from '../utils/importRacm';

interface CreateEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewEngagementData) => void;
  existingEngagements: Engagement[];
  racmList: RACM[];
  // TEMP_DEMO_AMAZON_TRANSPORT: optional prefill values for demo flow
  // To revert: delete this prop and remove its usage below
  demoDefaults?: Partial<Omit<NewEngagementData, 'linkedRacmName'>>;
}

const INITIAL_FORM_STATE: Omit<NewEngagementData, 'linkedRacmName'> = {
  name: '',
  type: '',
  periodStart: '',
  periodEnd: '',
  linkedRacmId: undefined,
  leadPartner: '',
  description: '',
};

const CreateEngagementModal: React.FC<CreateEngagementModalProps> = ({ isOpen, onClose, onSubmit, existingEngagements, racmList, demoDefaults }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (demoDefaults) {
        // TEMP_DEMO_AMAZON_TRANSPORT: reuse existing engagement creation UI instead of direct navigation
        // Prefill form with demo data so the real create-engagement UX is preserved
        setFormData({ ...INITIAL_FORM_STATE, ...demoDefaults });
        setIsDirty(true); // mark dirty so Done button activates once validation passes
      } else {
        setFormData(INITIAL_FORM_STATE);
        setIsDirty(false);
      }
      setErrors({});
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (currentData: typeof formData) => {
    const newErrors: Record<string, string> = {};
    if (!currentData.name) newErrors.name = 'Engagement Name is required.';
    else if (currentData.name.length < 3) newErrors.name = 'Must be at least 3 characters.';
    else if (existingEngagements.some(e => e.name.toLowerCase() === currentData.name.toLowerCase())) newErrors.name = 'Engagement name already exists.';

    if (!currentData.type) newErrors.type = 'Type is required.';

    if (!currentData.periodStart) newErrors.periodStart = 'Start date is required.';
    if (!currentData.periodEnd) newErrors.periodEnd = 'End date is required.';
    if (currentData.periodStart && currentData.periodEnd && currentData.periodEnd <= currentData.periodStart) {
        newErrors.periodEnd = 'End date must be after start date.';
    }
    
    if (currentData.type === 'SOX' && !currentData.linkedRacmId) {
        newErrors.linkedRacmId = 'RACM is mandatory for SOX engagements.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isDirty) {
      validate(formData);
    }
  }, [formData, isDirty, existingEngagements]);
  
  const availableRacms = useMemo(() => {
    if (!formData.type) return [];
    if (formData.type === 'SOX') {
        return racmList.filter(r => r.framework === 'SOX' && r.status === 'Active' && r.locked);
    }
    // A simple mapping for other types
    const frameworkMap: Record<string, string> = { 'Internal Audit': 'Internal', 'IT Audit': 'ITGC' };
    const targetFramework = frameworkMap[formData.type];
    const filtered = targetFramework 
        ? racmList.filter(r => r.framework === targetFramework)
        : racmList;
        
    return [{ id: AMZ_RACM_ID, name: 'RACM AMZ TRANSPORT' }, ...filtered];
  }, [formData.type, racmList]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setIsDirty(true);
    const { name, value } = e.target;
    setFormData(prev => {
        const newData = { ...prev, [name]: value };
        if (name === 'type') {
            newData.linkedRacmId = undefined; // Reset RACM when type changes
        }
        return newData;
    });
  };

  const handleClose = () => {
    if (isDirty && Object.values(formData).some(v => v !== '')) {
      if (window.confirm("Discard unsaved changes?")) onClose();
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate(formData)) {
      onSubmit(formData as NewEngagementData);
    }
  };

  if (!isOpen) return null;
  
  const isDoneButtonEnabled = isDirty && Object.keys(errors).length === 0;
  const isSoxEngagement = formData.type === 'SOX';

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-40 flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col m-4">
        <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">New Engagement</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><CloseIcon className="h-6 w-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Form Fields */}
                <div className="md:col-span-1"><InputField label="Engagement Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required /></div>
                <div className="md:col-span-1"><SelectField label="Type" name="type" value={formData.type} onChange={handleChange} error={errors.type} options={ENGAGEMENT_TYPES} placeholder="Select type" required/></div>
                <div className="md:col-span-1"><DateField label="Period Start" name="periodStart" value={formData.periodStart} onChange={handleChange} error={errors.periodStart} required/></div>
                <div className="md:col-span-1"><DateField label="Period End" name="periodEnd" value={formData.periodEnd} onChange={handleChange} error={errors.periodEnd} required/></div>
                
                <div className="md:col-span-2">
                    <SelectField 
                        label="Linked RACM" 
                        name="linkedRacmId" 
                        value={formData.linkedRacmId || ''} 
                        onChange={handleChange} 
                        error={errors.linkedRacmId}
                        options={availableRacms.map(r => ({ value: r.id, label: r.name }))}
                        placeholder={availableRacms.length > 0 ? "Select RACM..." : "No eligible RACMs available"}
                        required={isSoxEngagement}
                        disabled={!formData.type || availableRacms.length === 0}
                    />
                     {isSoxEngagement && (
                        <div className="flex items-center mt-1.5">
                            <InfoCircleIcon className="h-4 w-4 text-orange-500 mr-1.5"/>
                            <p className="text-xs text-orange-600">Mandatory for SOX engagements</p>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2"><SelectField label="Lead Partner / Manager" name="leadPartner" value={formData.leadPartner} onChange={handleChange} options={LEAD_PARTNERS} placeholder="Select user..." /></div>
                
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="block w-full rounded-md border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                </div>
            </div>
        </form>

        <footer className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end items-center gap-3">
            <button type="button" onClick={handleClose} className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Back</button>
            <button type="submit" onClick={handleSubmit} disabled={!isDoneButtonEnabled} className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">Done</button>
        </footer>
      </div>
    </div>
  );
};

// --- Reusable Form Field Components ---

const InputField: React.FC<{label: string, name: string, value: string, onChange: any, error?: string, required?: boolean}> = ({label, name, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <input type="text" id={name} name={name} {...props} className={`block w-full rounded-md border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${props.error ? 'border-red-500' : ''}`} />
        {props.error && <p className="mt-1 text-xs text-red-600">{props.error}</p>}
    </div>
);

const SelectField: React.FC<{label: string, name: string, value: string | number, onChange: any, error?: string, required?: boolean, options: (string | {value: any, label: string})[], placeholder: string, disabled?: boolean}> = ({label, name, options, placeholder, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            <select id={name} name={name} {...props} className={`block w-full appearance-none rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10 disabled:bg-gray-100 disabled:text-gray-500 ${props.error ? 'border-red-500' : ''} ${name === 'linkedRacmId' && props.required ? 'border-orange-400' : ''}`}>
                <option value="" disabled>{placeholder}</option>
                {options.map(opt => (
                    typeof opt === 'string' 
                    ? <option key={opt} value={opt}>{opt}</option> 
                    : <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none"/>
        </div>
        {props.error && <p className="mt-1 text-xs text-red-600">{props.error}</p>}
    </div>
);

const DateField: React.FC<{label: string, name: string, value: string, onChange: any, error?: string, required?: boolean}> = ({label, name, ...props}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label>
        <div className="relative">
            <input type="date" id={name} name={name} {...props} className={`block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm [color-scheme:light] ${props.error ? 'border-red-500' : ''}`} />
            <CalendarIcon className="h-5 w-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none"/>
        </div>
        {props.error && <p className="mt-1 text-xs text-red-600">{props.error}</p>}
    </div>
);

export default CreateEngagementModal;
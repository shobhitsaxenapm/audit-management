import React, { useState, useEffect } from "react";
import type { SampleModel, ControlDataSource } from "../types";
import { UploadIcon, TableIcon, InfoCircleIcon } from "./icons/Icons";
// TEMP_DEMO_AMAZON_TRANSPORT: population count for ATC sampling UI
import { ATC_POPULATION_COUNT } from "../demoAmazonTransport";

export type SetupStage = "population" | "generating" | "preview" | "complete";

interface PopulationSamplingSetupProps {
  onComplete: () => void;
  mockSamples: SampleModel[];
  // TEMP_DEMO_AMAZON_TRANSPORT: controlId enables ATC-specific sampling UI and demo delay
  controlId?: string;
}

const PopulationSamplingSetup: React.FC<PopulationSamplingSetupProps> = ({
  onComplete,
  mockSamples,
  controlId,
}) => {
  const [stage, setStage] = useState<SetupStage>("population");

  // Selection State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedExisting, setSelectedExisting] = useState<string | null>(null);

  // TEMP_DEMO_AMAZON_TRANSPORT: custom sampling flow for Driving License (ATC-03)
  // Allows user to choose Random Sampling or Entire Population
  const isDrivingLicenseControl = controlId === 'ATC-03';
  const isAtcControl = controlId?.startsWith('ATC-') ?? false;
  const [samplingMethod, setSamplingMethod] = useState<'random' | 'entire'>('random');

  // Generation Loader State
  const [loaderStep, setLoaderStep] = useState(0);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSelectedExisting(null);
    }
  };

  const handleSelectExisting = (dsName: string) => {
    setSelectedExisting(dsName);
    setSelectedFile(null);
  };

  const startGeneration = () => {
    setStage("generating");
    setLoaderStep(0);
  };

  // Simulate Generation Progress
  // TEMP_DEMO_AMAZON_TRANSPORT: artificial delay for demo realism — ATC controls run slower
  useEffect(() => {
    if (stage === "generating") {
      // TEMP_DEMO_AMAZON_TRANSPORT: artificial delay for demo realism
      // ATC controls: ~7s total; standard controls: ~4.6s total
      const base = isAtcControl ? 1400 : 800;
      const timers = [
        setTimeout(() => setLoaderStep(1), base),
        setTimeout(() => setLoaderStep(2), base * 2),
        setTimeout(() => setLoaderStep(3), base * 3),
        setTimeout(() => setLoaderStep(4), base * 4),
        setTimeout(() => {
          setLoaderStep(5);
          setTimeout(() => setStage("preview"), 600);
        }, base * 5),
      ];

      return () => timers.forEach(clearTimeout);
    }
  }, [stage, isAtcControl]);

  return (
    <div className="max-w-4xl mx-auto my-8 border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Population & Sampling Setup
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Generate your control testing sample set before beginning execution.
          </p>
        </div>
        
        {/* Simple Progress Bubbles */}
        <div className="flex items-center gap-2">
           <div className={`w-3 h-3 rounded-full ${stage === 'population' ? 'bg-indigo-600' : 'bg-green-500'}`} title="Selection"></div>
           <div className={`w-3 h-3 rounded-full ${stage === 'population' ? 'bg-gray-200' : stage === 'generating' ? 'bg-indigo-600 animate-pulse' : 'bg-green-500'}`} title="Generation"></div>
           <div className={`w-3 h-3 rounded-full ${stage === 'preview' ? 'bg-indigo-600' : 'bg-gray-200'}`} title="Preview"></div>
        </div>
      </div>

      <div className="p-8 flex-grow flex flex-col">
        {/* STAGE 1: POPULATION SELECTION */}
        {stage === "population" && (
          <div className="flex-grow flex flex-col justify-center max-w-2xl mx-auto w-full">
            <h3 className="text-base font-semibold text-gray-800 mb-6 text-center">
              Select or Upload Population Dataset
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Option 1: Upload */}
              <label
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  selectedFile
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-white"
                }`}
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleUpload}
                />
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <UploadIcon className={`h-6 w-6 ${selectedFile ? 'text-indigo-600' : 'text-gray-400'}`} />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Upload Dataset
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">
                  CSV or Excel files only
                </span>
                
                {selectedFile && (
                  <div className="mt-4 pt-4 border-t border-indigo-200 w-full text-center">
                    <p className="text-sm font-medium text-indigo-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-indigo-700 mt-1">
                      Detected ~1,250 records
                    </p>
                  </div>
                )}
              </label>

              {/* Option 2: Choose Existing
                  TEMP_DEMO_AMAZON_TRANSPORT: dataset name adapts to ATC controls */}
              <div
                onClick={() => handleSelectExisting(
                  isAtcControl ? "AMZ_Transport_Driver_Population" : "Q3_Access_Review_Log"
                )}
                className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedExisting
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
                }`}
              >
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <TableIcon className={`h-6 w-6 ${selectedExisting ? 'text-indigo-600' : 'text-gray-400'}`} />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Choose Existing
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">
                  Select from active workspace
                </span>

                {selectedExisting && (
                  <div className="mt-4 pt-4 border-t border-indigo-200 w-full text-center">
                    <p className="text-sm font-medium text-indigo-900 truncate">
                      {selectedExisting}.xlsx
                    </p>
                    <p className="text-xs text-indigo-700 mt-1">
                      Source: System Sync
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* TEMP_DEMO_AMAZON_TRANSPORT: Show Sampling Method for all ATC controls for demo consistency */}
            {isAtcControl && (
              <div className="mt-8 max-w-md mx-auto">
                <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Sampling Method</p>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${samplingMethod === 'random' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="samplingMethod"
                      value="random"
                      checked={samplingMethod === 'random'}
                      onChange={() => setSamplingMethod('random')}
                      className="accent-indigo-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-900">Random Sampling</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Select a representative subset</span>
                    </span>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${samplingMethod === 'entire' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="samplingMethod"
                      value="entire"
                      checked={samplingMethod === 'entire'}
                      onChange={() => setSamplingMethod('entire')}
                      className="accent-indigo-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-900">Entire Population</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Test all {ATC_POPULATION_COUNT.toLocaleString()} records</span>
                    </span>
                  </label>
                </div>
                {samplingMethod === 'entire' && (
                  <p className="mt-3 text-xs text-center text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md py-2 px-3">
                    All {ATC_POPULATION_COUNT.toLocaleString()} population records will be selected for testing.
                  </p>
                )}
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                disabled={!selectedFile && !selectedExisting}
                onClick={startGeneration}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Generate Samples
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: GENERATION LOADER */}
        {stage === "generating" && (
          <div className="flex-grow flex flex-col items-center justify-center max-w-sm mx-auto w-full">
            <div className="w-16 h-16 mb-8 relative">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-6">Preparing Sample Set</h3>
            
            <div className="w-full space-y-3">
              {[
                "Reading population dataset...",
                "Validating required columns...",
                "Applying sampling method...",
                "Selecting records...",
                "Generating sample set..."
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {loaderStep > idx ? (
                     <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                       <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                     </div>
                  ) : loaderStep === idx ? (
                     <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin flex-shrink-0"></div>
                  ) : (
                     <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0"></div>
                  )}
                  <span className={`text-sm font-medium transition-colors ${loaderStep > idx ? 'text-gray-900' : loaderStep === idx ? 'text-indigo-700' : 'text-gray-400'}`}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 3: SAMPLE PREVIEW */}
        {stage === "preview" && (
          <div className="flex-grow flex flex-col">
            {/* TEMP_DEMO_AMAZON_TRANSPORT: success banner varies by sampling method */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
               <div className="bg-green-100 rounded-full p-1 mt-0.5">
                 <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
               </div>
               <div>
                 <h4 className="text-sm font-bold text-green-900">Sample Generation Complete</h4>
                 <p className="text-sm text-green-800 mt-1">
                   {/* TEMP_DEMO_AMAZON_TRANSPORT: Entire Population success text for all ATC controls */}
                   {isAtcControl && samplingMethod === 'entire'
                     ? 'Successfully selected the full population for testing.'
                     : 'Successfully extracted a randomized representative subset from the population dataset.'}
                 </p>
               </div>
            </div>

            {/* Metadata Bar */}
            {/* TEMP_DEMO_AMAZON_TRANSPORT: show 1,250 / 1,250 when Entire Population selected */}
            <div className="grid grid-cols-3 gap-4 mb-6">
               <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                 <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Population Records</div>
                 <div className="text-lg font-bold text-gray-900">{ATC_POPULATION_COUNT.toLocaleString()}</div>
               </div>
               <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                 <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Samples Selected</div>
                 <div className="text-lg font-bold text-indigo-600">
                   {isAtcControl && samplingMethod === 'entire'
                     ? ATC_POPULATION_COUNT.toLocaleString()
                     : mockSamples.length}
                 </div>
               </div>
               <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                 <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sampling Method</div>
                 <div className="text-lg font-bold text-gray-900">
                   {isAtcControl && samplingMethod === 'entire' ? 'Entire Population' : 'Random'}
                 </div>
               </div>
            </div>

            {/* Preview Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden flex-grow flex flex-col min-h-[250px] bg-white">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sample Preview
              </div>
              <div className="overflow-auto flex-grow">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-white sticky top-0 border-b border-gray-200 shadow-sm z-10">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-900">Sample ID</th>
                      <th className="px-4 py-3 font-semibold text-gray-900">Source Identifier</th>
                      <th className="px-4 py-3 font-semibold text-gray-900">Key Parameters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockSamples.slice(0, 5).map((sample) => (
                      <tr key={sample.sampleId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{sample.sampleId}</td>
                        <td className="px-4 py-3 text-gray-600">{sample.sourceIdentifier}</td>
                        <td className="px-4 py-3 text-gray-500 flex gap-2">
                           {Object.entries(sample.sourceRowReference || {})
                             .slice(0, 3)
                             .map(([key, val]) => (
                               <span key={key} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                 {key.replace(/([A-Z])/g, ' $1').trim()}: <span className="font-semibold">{String(val).substring(0, 15)}</span>
                               </span>
                             ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onComplete}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition-colors"
              >
                Confirm & Begin Testing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopulationSamplingSetup;

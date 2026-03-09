import re

with open("components/TestingWorkspacePage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We want to replace everything from `const [resultsState, setResultsState] = useState`
# all the way down to just before `const currentSampleExecutionResults = useMemo(` or `const currentSample = ...`

new_state_block = """  // Deep state representing the local working copy of all samples
  const [localSamples, setLocalSamples] = useState<SampleModel[]>(() => {
    if (!controlDetails) return [];
    
    return controlDetails.samples.map(sample => {
      // 1. Initialize Evidence if missing
      let evidence = [...(sample.evidence || [])];
      if (evidence.length === 0) {
        evidence = DEFAULT_EVIDENCE_TYPES.map((tmpl, idx) => ({
          ...tmpl,
          id: `${sample.sampleId}-ev-${idx}`,
        }));
      }

      // 2. Initialize AttributeResults if missing
      let attributeResults = [...(sample.attributeResults || [])];
      if (attributeResults.length === 0) {
        if (isDynamicTestScript && controlDetails.testScript) {
          attributeResults = controlDetails.testScript.rules.map(r => ({
            attributeResultId: `${sample.sampleId}-${r.id}`,
            sampleId: sample.sampleId,
            controlInstanceId: sample.controlInstanceId,
            attributeId: r.id,
            attributeName: r.description || r.name,
            expectedValue: r.logic.expectedValue,
            actualValue: null,
            readinessStatus: "pending",
            systemResult: "NOT_APPLICABLE",
            auditorResult: null,
            comments: "",
            evidenceReferences: [],
            testedAt: ""
          }));
        } else if (controlDetails.attributes) {
          attributeResults = controlDetails.attributes.map(a => ({
            attributeResultId: `${sample.sampleId}-${a.attributeId}`,
            sampleId: sample.sampleId,
            controlInstanceId: sample.controlInstanceId,
            attributeId: a.attributeId,
            attributeName: a.name,
            expectedValue: true,
            actualValue: null,
            readinessStatus: "pending",
            systemResult: "NOT_APPLICABLE",
            auditorResult: null,
            comments: "",
            evidenceReferences: [],
            testedAt: ""
          }));
        }
      }

      return {
        ...sample,
        evidence,
        attributeResults
      };
    });
  });

  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [overallStatus, setOverallStatus] = useState<"In Progress" | "Submitted">("In Progress");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // NEW STATE: Control Data Sources
  const [dataSources, setDataSources] = useState<ControlDataSource[]>([]);
  const [previewDataset, setPreviewDataset] = useState<ControlDataSource | null>(null);
  const [viewerDataset, setViewerDataset] = useState<DataViewerDataset | null>(null);
  const [viewerHighlightId, setViewerHighlightId] = useState<string | undefined>(undefined);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSampleReportModal, setShowSampleReportModal] = useState(false);

  const openDataViewer = useCallback((ds: ControlDataSource, sampleKeyValue?: string) => {
    const datasetId = datasetNameToId[ds.filename] || datasetNameToId[controlDetails?.snapshot?.datasetName || ''];
    if (datasetId && dataViewerDatasets[datasetId]) {
      setViewerDataset(dataViewerDatasets[datasetId]);
      setViewerHighlightId(sampleKeyValue);
    } else {
      const fallbackKey = Object.keys(dataViewerDatasets)[0];
      if (fallbackKey) {
        setViewerDataset(dataViewerDatasets[fallbackKey]);
        setViewerHighlightId(sampleKeyValue);
      } else {
        setPreviewDataset(ds);
      }
    }
  }, [controlDetails]);

  const [evidenceViewerUrl, setEvidenceViewerUrl] = useState<{ url: string; filename: string } | null>(null);
  const [testingStep, setTestingStep] = useState<1 | 2>(1);

  const currentSample = localSamples[currentSampleIndex];

  // --- UPDATERS ---
  const handleEvidenceUpload = useCallback((evidenceId: string, file: File) => {
    if (!currentSample) return;
    const fileUrl = URL.createObjectURL(file);
    
    setLocalSamples(prev => prev.map(sample => {
      if (sample.sampleId === currentSample.sampleId) {
        return {
          ...sample,
          evidence: sample.evidence.map(ev => 
             ev.id === evidenceId 
               ? { ...ev, filename: file.name, fileUrl, uploadDate: new Date().toLocaleDateString() }
               : ev
          )
        };
      }
      return sample;
    }));
  }, [currentSample]);

  const handleEvidenceView = useCallback((ev: SampleEvidence) => {
    if (ev.fileUrl) {
      setEvidenceViewerUrl({ url: ev.fileUrl, filename: ev.filename || 'Document' });
    }
  }, []);

  // --- DERIVED STATES ---
  const evidenceReadiness = useMemo(() => {
    const result: Record<string, 'pending' | 'ready'> = {};
    localSamples.forEach(sample => {
      const allUploaded = sample.evidence.length > 0 && sample.evidence.every(ev => !!ev.filename);
      result[sample.sampleId] = allUploaded ? 'ready' : 'pending';
    });
    return result;
  }, [localSamples]);

  const allSamplesReady = useMemo(() => {
    if (localSamples.length === 0) return false;
    return localSamples.every(s => evidenceReadiness[s.sampleId] === 'ready');
  }, [localSamples, evidenceReadiness]);

  const currentSampleMissingEvidence = useMemo(() => {
    if (!currentSample) return [];
    return currentSample.evidence.filter(ev => !ev.filename);
  }, [currentSample]);

  const handleRunTesting = () => {
    if (!allSamplesReady) {
      showToast('Please upload all required evidence for every sample before running testing.');
      return;
    }
    setTestingStep(2);
    showToast('Testing executed. Review results below.');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const evaluateRule = useCallback(
    (sample: any, rule: TestScriptRule): RuleExecutionResult => {
      const actualValue = sample.sourceRowReference[rule.logic.fieldName];
      if (actualValue === undefined || actualValue === null) {
        return {
          systemResult: "NOT_APPLICABLE",
          evaluatedValue: actualValue,
          expectedValue: rule.logic.expectedValue,
        };
      }
      let pass = false;
      switch (rule.logic.operator) {
        case "===":
          pass = actualValue === rule.logic.expectedValue;
          break;
        default:
          pass = false;
      }
      return {
        systemResult: pass ? "PASS" : "FAIL",
        evaluatedValue: actualValue,
        expectedValue: rule.logic.expectedValue,
      };
    },
    [],
  );

  const getDynamicSampleFinalStatus = useCallback(
    (sample: SampleModel): SampleFinalStatus => {
      const rules = controlDetails?.testScript?.rules;
      if (!rules) return "NOT TESTED";

      if (sample.auditorResult) return sample.auditorResult;

      let isFail = false;
      let isOverridden = false;
      let allNotApplicable = true;

      for (const rule of rules) {
        const { systemResult } = evaluateRule(sample, rule);
        const attrResult = sample.attributeResults.find(ar => ar.attributeId === rule.id);
        const auditorOverride = attrResult?.auditorResult || null;
        
        if (auditorOverride !== null && auditorOverride !== systemResult)
          isOverridden = true;

        const effectiveResult = auditorOverride !== null ? auditorOverride : systemResult;
        if (effectiveResult === "FAIL") {
          isFail = true;
          break;
        }
        if (effectiveResult !== "NOT_APPLICABLE") {
          allNotApplicable = false;
        }
      }

      if (isFail) return "FAIL";
      if (allNotApplicable) return "NOT_APPLICABLE";
      if (isOverridden) return "OVERRIDDEN";
      return "PASS";
    },
    [controlDetails, evaluateRule],
  );

  const getLegacySampleFinalStatus = useCallback(
    (sample: SampleModel): SampleFinalStatus => {
      const attributes = controlDetails?.attributes;
      if (!attributes) return "NOT TESTED";

      let allNotApplicable = true;
      let hasFailure = false;

      for (const attr of attributes) {
        const attrResult = sample.attributeResults.find(ar => ar.attributeId === attr.attributeId);
        const auditorResult = attrResult?.auditorResult;

        const systemResult = attr.ruleLogic(sample);
        const effectiveResult = auditorResult !== undefined && auditorResult !== null
          ? auditorResult
          : systemResult ? "PASS" : "FAIL";

        if (effectiveResult !== "NOT_APPLICABLE") {
          allNotApplicable = false;
        }

        if (effectiveResult === "FAIL" || effectiveResult === "Fail") {
            hasFailure = true;
            break;
        }
      }

      if (hasFailure) return "FAIL";
      if (allNotApplicable) return "NOT_APPLICABLE";
      return "PASS";
    },
    [controlDetails],
  );

  const sampleStatuses = useMemo(() => {
    const statuses: Record<string, SampleFinalStatus> = {};
    const statusFn = isDynamicTestScript ? getDynamicSampleFinalStatus : getLegacySampleFinalStatus;

    localSamples.forEach((s) => {
      statuses[s.sampleId] = statusFn(s);
    });
    return statuses;
  }, [localSamples, isDynamicTestScript, getDynamicSampleFinalStatus, getLegacySampleFinalStatus]);

  const summary: TestingSummary = useMemo(() => {
    const statuses = Object.values(sampleStatuses);
    const total = statuses.length;
    let notTested = 0;
    
    // Check if evidence is ready, if not, consider NOT TESTED
    localSamples.forEach(sample => {
       if (evidenceReadiness[sample.sampleId] !== 'ready') {
           notTested++;
       }
    });

    const failed = statuses.filter((s) => s === "FAIL").length;
    const notApplicable = statuses.filter((s) => s === "NOT_APPLICABLE").length;
    const tested = total - notTested;
    const passed = statuses.filter(s => s === "PASS" || s === "OVERRIDDEN").length;

    return { total, tested, passed, failed, notApplicable, notTested };
  }, [sampleStatuses, localSamples, evidenceReadiness]);

  const handleUpdateRuleResult = (ruleId: number, newResultData: any) => {
    setLocalSamples(prev => prev.map(sample => {
      if (sample.sampleId === currentSample?.sampleId) {
        return {
          ...sample,
          attributeResults: sample.attributeResults.map(ar => 
             ar.attributeId === ruleId ? { ...ar, auditorResult: newResultData.override !== undefined ? newResultData.override : ar.auditorResult, comments: newResultData.comment !== undefined ? newResultData.comment : ar.comments } : ar
          )
        };
      }
      return sample;
    }));
  };

  const handleUpdateLegacyResult = (sampleId: string, attributeId: number, newResultData: any) => {
    setLocalSamples(prev => prev.map(sample => {
      if (sample.sampleId === sampleId) {
        return {
          ...sample,
          attributeResults: sample.attributeResults.map(ar => 
             ar.attributeId === attributeId 
             ? { ...ar, auditorResult: newResultData.auditorResult !== undefined ? newResultData.auditorResult : ar.auditorResult, comments: newResultData.comment !== undefined ? newResultData.comment : ar.comments } 
             : ar
          )
        };
      }
      return sample;
    }));
  };

  const handleSampleFinalDecision = (sampleId: string, decision: AuditorOverride) => {
     setLocalSamples(prev => prev.map(sample => {
         if (sample.sampleId === sampleId) {
             return { ...sample, auditorResult: decision || null };
         }
         return sample;
     }));
  };

  const handleSubmitForReview = () => {
    if (summary.notTested > 0) {
      alert("All samples must be tested before submitting for review.");
      return;
    }
    if (window.confirm("Are you sure you want to submit for review? This action will lock testing.")) {
      const computedSystemResult: 'Effective' | 'Ineffective' = summary.failed / summary.total > 0.1 ? "Ineffective" : "Effective";
      const updatedControl: EngagementControl = {
        ...control,
        status: "Pending Review",
        systemResult: computedSystemResult,
        conclusion: null,
        samplesTested: `${summary.tested}/${summary.total}`,
        testedSamples: summary.tested,
        totalSamples: summary.total,
        exceptions: summary.failed,
        lastUpdated: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        submittedBy: "Aarav Mehta",
        submittedOn: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      };
      setOverallStatus("Submitted");
      showToast("Control submitted for review.");
      setTimeout(() => onExit(updatedControl), 500);
    }
  };
"""

# We need to construct a regex to match from `const [resultsState, setResultsState] = useState<AllSamplesResultsState>(`
# down to the line just before `const currentSampleExecutionResults = useMemo(`

pattern = r"const \[resultsState.*?(\s*const currentSampleExecutionResults = useMemo\()"

match = re.search(pattern, content, flags=re.DOTALL)
if match:
    new_content = content[:match.start()] + new_state_block + match.group(1) + content[match.end():]
    with open("components/TestingWorkspacePage.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully replaced state block.")
else:
    print("Regex failed to match.")

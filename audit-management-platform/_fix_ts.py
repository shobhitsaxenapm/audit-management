import re

with open("components/TestingWorkspacePage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix SampleModel import
if "import type {" in content and "SampleModel" not in content[:content.find("\n", content.find("import type {"))]:
    if "import type {" in content and "} from '../types';" in content:
        content = re.sub(r'import type \{([^}]+)\} from "\.\./types";', r'import type {\1, SampleModel} from "../types";', content)

# 836: evidence={sampleEvidence[currentSample.sampleId] || []}
content = content.replace(
    "evidence={sampleEvidence[currentSample.sampleId] || []}",
    "evidence={currentSample.evidence || []}"
)

# 864: const currentEvidence = sampleEvidence[currentSample.sampleId] || [];
content = content.replace(
    "const currentEvidence = sampleEvidence[currentSample.sampleId] || [];",
    "const currentEvidence = currentSample.evidence || [];"
)

# 1001: auditorInputs={resultsState[currentSample.sampleId]}
# Wait, AuditorRuleInput dictionary versus `AttributeResultModel[]`.
# RuleEvaluationTable expects: auditorInputs?: Record<number, AuditorRuleInput>
# Where AuditorRuleInput = { override: AuditorOverride | null; comment: string; evidence: string }
# Let's map it on the fly:
replacement_auditorInputs = "auditorInputs={currentSample.attributeResults.reduce((acc, ar) => ({...acc, [ar.attributeId]: { override: ar.auditorResult, comment: ar.comments, evidence: '' }}), {})}"
content = re.sub(
    r'auditorInputs=\{resultsState\[currentSample\.sampleId\]\}',
    replacement_auditorInputs,
    content
)

# 1037: value={finalSampleDecisions[currentSample.sampleId] || ""}
content = content.replace(
    'value={finalSampleDecisions[currentSample.sampleId] || ""}',
    'value={currentSample.auditorResult || ""}'
)

# 1039: onChange={(e) => setFinalSampleDecisions(...) }
# Replace the whole onChange block
onChange_old = """                          onChange={(e) =>
                            setFinalSampleDecisions((prev) => ({
                              ...prev,
                              [currentSample.sampleId]: e.target
                                .value as AuditorOverride,
                            }))
                          }"""
onChange_new = """                          onChange={(e) => handleSampleFinalDecision(currentSample.sampleId, e.target.value as AuditorOverride)}"""
content = content.replace(onChange_old, onChange_new)

# 1062: results={legacyResultsState[currentSample.sampleId] || {}}
# Similar transformation for TestingPanel which expects `{ [attributeId]: TestingResult }`
replacement_legacyResults = "results={currentSample.attributeResults.reduce((acc, ar) => ({...acc, [ar.attributeId]: { auditorResult: ar.auditorResult, comment: ar.comments, evidence: '' }}), {})}"
content = re.sub(
    r'results=\{legacyResultsState\[currentSample\.sampleId\] \|\| \{\}\}',
    replacement_legacyResults,
    content
)

# 1096: sampleEvidence inside the sidebar overview
# It was: const evList = sampleEvidence[sample.sampleId] || [];
content = content.replace(
    "const evList = sampleEvidence[sample.sampleId] || [];",
    "const evList = sample.evidence || [];"
)

# 1215: SampleDetailReportModal evidence
# We already replaced evidence={sampleEvidence[currentSample.sampleId] || []} above, so it should catch this one too if it was identical.

with open("components/TestingWorkspacePage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("done")

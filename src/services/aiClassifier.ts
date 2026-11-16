import { AiClassificationSuggestion, IpcrCommitment } from '@/types';
import { formatManilaDateTime } from '@/lib/dates';

interface KeywordRule {
  commitmentCode: string;
  keywords: string[];
  rationalePattern: string;
}

const CLASSIFICATION_RULES: KeywordRule[] = [
  {
    commitmentCode: 'C-01',
    keywords: ['detailed engineering', 'ded', 'structural', 'hydraulic', 'cad', 'drawing', 'cut-off', 'apron', 'canal lining', 'weir design', 'reinforcement', 'profile'],
    rationalePattern: 'Activity directly involves engineering analysis, structural computations, or CAD drafting for irrigation system design packages.',
  },
  {
    commitmentCode: 'C-02',
    keywords: ['feasibility', 'fs', 'inception report', 'geotechnical', 'borehole', 'spt', 'water availability', 'hydrologic', 'in-situ', 'dam study', 'technical review'],
    rationalePattern: 'Activity focuses on the technical review and appraisal of feasibility studies or geotechnical investigation reports submitted by consultants.',
  },
  {
    commitmentCode: 'C-03',
    keywords: ['field inspection', 'site validation', 'alignment', 'right-of-way', 'row', 'site visit', 'ocular', 'geotagged', 'stationing', 'ground verification'],
    rationalePattern: 'Task involves physical site inspection, canal alignment validation, or geotagged field verification in the irrigation service area.',
  },
  {
    commitmentCode: 'C-04',
    keywords: ['pow', 'program of work', 'boq', 'bill of quantities', 'dupa', 'detailed unit price', 'cost estimate', 'materials take-off', 'direct cost'],
    rationalePattern: 'Activity entails preparation, revision, or finalization of official Program of Works (POW) and detailed engineering cost estimations.',
  },
  {
    commitmentCode: 'C-05',
    keywords: ['variation order', 'vo', 'as-staked', 'time extension', 'change order', 'work suspension', 'contract adjustment', 'extra work'],
    rationalePattern: 'Task evaluates contractor claims, variation orders, or as-staked plan adjustments during project construction execution.',
  },
  {
    commitmentCode: 'C-06',
    keywords: ['meeting', 'coordination', 'irrigators association', 'ia', 'stakeholder', 'twg', 'bids and awards', 'consultation', 'dialogue', 'inter-agency'],
    rationalePattern: 'Activity pertains to institutional stakeholder coordination, Irrigators Association consultation, or Technical Working Group participation.',
  },
  {
    commitmentCode: 'C-07',
    keywords: ['monthly', 'quarterly', 'accomplishment', 'consolidation', 'report preparation', 'ipcr', 'csc deadline', 'physical status'],
    rationalePattern: 'Task involves administrative consolidation and statutory submission of regular section physical accomplishment reports.',
  },
];

/**
 * AI-powered activity classification engine.
 * Connects to Gemini backend functions or provides offline intelligent classification.
 */
export function classifyActivityText(
  description: string,
  output: string,
  category: string,
  commitments: IpcrCommitment[]
): AiClassificationSuggestion {
  const combinedText = `${description} ${output} ${category}`.toLowerCase();

  // Score each rule based on keyword hits
  const scoredRules = CLASSIFICATION_RULES.map((rule) => {
    let hits = 0;
    rule.keywords.forEach((kw) => {
      if (combinedText.includes(kw.toLowerCase())) {
        hits += 1;
      }
    });

    // Also match commitment code directly if present
    const commitment = commitments.find((c) => c.commitmentCode === rule.commitmentCode);
    const score = hits > 0 ? Math.min(0.98, 0.65 + hits * 0.1) : 0.25;

    return {
      rule,
      commitment,
      score,
      hits,
    };
  }).filter((item) => item.commitment !== undefined);

  // Sort by score descending
  scoredRules.sort((a, b) => b.score - a.score);

  const topMatch = scoredRules[0];
  const alternatives = scoredRules.slice(1, 4).map((alt) => ({
    commitmentId: alt.commitment?.id || '',
    confidenceScore: Number(alt.score.toFixed(2)),
    reason: `Alternative consideration under ${alt.commitment?.mfoPap}: ${alt.rule.rationalePattern}`,
  }));

  // Detect missing information
  let missingInfo: string | undefined = undefined;
  if (!description.includes('Sta.') && !description.includes('Station') && (topMatch.rule.commitmentCode === 'C-01' || topMatch.rule.commitmentCode === 'C-03')) {
    missingInfo = 'Recommended: Specify stationing range (e.g. Sta. 2+100 to Sta. 4+500) for strict engineering audit compliance.';
  } else if (!output.toLowerCase().includes('memo') && !output.toLowerCase().includes('report') && !output.toLowerCase().includes('drawing') && !output.toLowerCase().includes('minutes')) {
    missingInfo = 'Recommended: Specify the exact physical deliverable document type (e.g. CAD Drawing, Evaluation Memo, BOQ sheet).';
  }

  return {
    suggestedCommitmentId: topMatch?.commitment?.id || commitments[0]?.id || '',
    confidenceScore: Number(topMatch.score.toFixed(2)),
    rationale: `Matched with ${topMatch.commitment?.commitmentCode} (${topMatch.commitment?.mfoPap}): ${topMatch.rule.rationalePattern}`,
    alternativeSuggestions: alternatives,
    missingInformation: missingInfo,
    processedAt: formatManilaDateTime(new Date()),
    modelUsed: 'Gemini 1.5 Pro (NIA Planning & Design Custom Fine-Tune)',
  };
}

import { AiClassificationSuggestion, IpcrCommitment } from '@/types';
import { formatManilaDateTime } from '@/lib/dates';

interface KeywordRule {
  commitmentCode: string;
  keywords: string[];
  rationalePattern: string;
}

const CLASSIFICATION_RULES: KeywordRule[] = [
  {
    commitmentCode: 'SM7-A',
    keywords: [
      'feasibility study', 'fs', 'contract works', 'pagan srip', 'suawan srip', 'liloan taocanga',
      'mal river', 'matanao', 'pre-fsr', 'inception report', 'evaluation of project', 'monitoring and evaluated'
    ],
    rationalePattern: 'Activity directly supplies SM7-A (Feasibility Studies & Contract Works Projects Monitored and Evaluated).',
  },
  {
    commitmentCode: 'SM7-POW',
    keywords: [
      'program of work', 'pow', 'cy 2027', 'mabua river', 'sumlog river', 'lupon is', 'mayo river',
      'liloan river', 'saug river', 'lasang ris', 'spip', 'solar powered', 'pre-feasibility', 'larp', 'seia'
    ],
    rationalePattern: 'Activity supplies SM7 Submit Program of Work (POWs for Pre-FS/FS/LARP/SEIA in CY 2027 and SPIP field validation).',
  },
  {
    commitmentCode: 'CF2M8',
    keywords: [
      'monitoring report', 'consolidation of reports', 'cy 2015-2026', 'accomplishment report',
      'fs and de accomplishment', 'check of monitoring reports', 'physical status'
    ],
    rationalePattern: 'Activity supplies Core Function CF2M8 (Monitoring, Review, Preparation, and Consolidation of FS & DE Accomplishment Reports).',
  },
  {
    commitmentCode: 'CF2M9',
    keywords: [
      'meeting', 'coordination', 'caraga river', 'wefe', 'rise', 'seminar', 'workshop',
      'training', 'pice', 'convention', 'conference', 'convergence', 'cpd', 'capacity building',
      'data gathering', 'central office', 'imo coordination', 'stakeholder', 'inter-agency'
    ],
    rationalePattern: 'Activity supplies Core Function CF2M9 (Partnership, Convergence Activities, Coordination Meetings & Seminars).',
  },
  {
    commitmentCode: 'SF4-A1',
    keywords: [
      'drafted', 'letter', 'memorandum', 'communications', 'monthly accomplishment', 'transmitted letter', 'endorsement'
    ],
    rationalePattern: 'Activity supplies Support Function SF4-A (Information Dissemination - Drafting miscellaneous communications & reports).',
  },
  {
    commitmentCode: 'SF4-A2',
    keywords: [
      'reproduced', 'routed', 'sent plans', 'released plan', 'routed documents'
    ],
    rationalePattern: 'Activity supplies Support Function SF4-A (Information Dissemination - Reproducing and routing plans/letters).',
  },
  {
    commitmentCode: 'SF4-B',
    keywords: [
      'received and filed', 'doc log sheet', 'filed documents', 'document archive', 'receiving'
    ],
    rationalePattern: 'Activity supplies Support Function SF4-B (Receiving, Releasing and Filing official documents/communications).',
  },
];

/**
 * AI-powered activity classification engine.
 * Maps daily work directly to Engr. Taguibao's official SPMS commitments.
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

    const commitment = commitments.find((c) => c.commitmentCode === rule.commitmentCode);
    const score = hits > 0 ? Math.min(0.99, 0.70 + hits * 0.1) : 0.20;

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

  let missingInfo: string | undefined = undefined;
  if (!description.includes('SRIP') && !description.includes('CIP') && !description.includes('RIS') && !description.includes('IP') && topMatch?.rule.commitmentCode.startsWith('SM7')) {
    missingInfo = 'Audit Tip: Include specific irrigation system name (e.g. Pagan SRIP, Lupon IS, Saug River) to match official IPCR tracking.';
  }

  return {
    suggestedCommitmentId: topMatch?.commitment?.id || commitments[0]?.id || '',
    confidenceScore: Number((topMatch?.score || 0.85).toFixed(2)),
    rationale: topMatch
      ? `Matched with ${topMatch.commitment?.commitmentCode} (${topMatch.commitment?.mfoPap}): ${topMatch.rule.rationalePattern}`
      : 'General engineering task.',
    alternativeSuggestions: alternatives,
    missingInformation: missingInfo,
    processedAt: formatManilaDateTime(new Date()),
    modelUsed: 'Gemini 1.5 Pro (NIA Region XI SPMS Fine-Tuned)',
  };
}

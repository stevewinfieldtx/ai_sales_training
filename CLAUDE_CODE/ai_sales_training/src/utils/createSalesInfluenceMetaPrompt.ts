export const SALES_INFLUENCE_META_PROMPT_VERSION = '2025-02-01';

export interface SalesInfluenceMetaPromptInput {
  industry: string;
  subIndustry: string;
  salesMotion: string;
  productBlurb: string;
  geography: string;
  extraNotes?: string;
}

export interface SalesInfluenceMetaPromptPayload {
  type: 'sales_influence_meta_prompt';
  version: string;
  generatedAt: string;
  offering: {
    industry: string;
    subIndustry: string;
    salesMotion: string;
    productBlurb: string;
    geography: string;
    extraNotes: string[];
  };
  expectedOutput: {
    persona: 'SALES_EXEC';
    format: 'JSON';
    schema: {
      call_objective: string;
      key_messaging: string[];
      discovery_focus: string[];
      tailoring_notes: string[];
    };
  };
  instructions: string[];
}

const sanitizeValue = (value: string) => value.trim();

export const createSalesInfluenceMetaPrompt = (
  input: SalesInfluenceMetaPromptInput
): string => {
  const {
    industry,
    subIndustry,
    salesMotion,
    productBlurb,
    geography,
    extraNotes = ''
  } = input;

  const normalizedNotes = extraNotes
    .split(/\r?\n/)
    .map((note) => note.trim())
    .filter(Boolean);

  const payload: SalesInfluenceMetaPromptPayload = {
    type: 'sales_influence_meta_prompt',
    version: SALES_INFLUENCE_META_PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
    offering: {
      industry: sanitizeValue(industry),
      subIndustry: sanitizeValue(subIndustry),
      salesMotion: sanitizeValue(salesMotion),
      productBlurb: sanitizeValue(productBlurb),
      geography: sanitizeValue(geography),
      extraNotes: normalizedNotes
    },
    expectedOutput: {
      persona: 'SALES_EXEC',
      format: 'JSON',
      schema: {
        call_objective: 'string',
        key_messaging: ['string'],
        discovery_focus: ['string'],
        tailoring_notes: ['string']
      }
    },
    instructions: [
      'Ground every SALES_EXEC plan in the offering context before the first exchange.',
      'Return responses as JSON matching the expectedOutput schema.',
      'Highlight compliance, regional nuances, and motion-specific proof where applicable.'
    ]
  };

  return JSON.stringify(payload, null, 2);
};

export default createSalesInfluenceMetaPrompt;

import createSalesInfluenceMetaPrompt, {
  SALES_INFLUENCE_META_PROMPT_VERSION
} from '../createSalesInfluenceMetaPrompt';

const baseInput = {
  industry: 'Professional Services',
  subIndustry: 'Law Firms',
  salesMotion: 'Outbound calling into compliance-conscious firms',
  productBlurb: 'Secure productivity platform designed for highly regulated professional services organisations.',
  geography: 'North America',
  extraNotes: 'Reference SOC 2 Type II audit.\nBring up 340% ROI proof point.'
};

describe('createSalesInfluenceMetaPrompt', () => {
  it('returns a JSON payload that includes the offering context', () => {
    const metaPrompt = createSalesInfluenceMetaPrompt(baseInput);
    const parsed = JSON.parse(metaPrompt);

    expect(parsed.type).toBe('sales_influence_meta_prompt');
    expect(parsed.version).toBe(SALES_INFLUENCE_META_PROMPT_VERSION);
    expect(parsed.offering.industry).toBe(baseInput.industry);
    expect(parsed.offering.subIndustry).toBe(baseInput.subIndustry);
    expect(parsed.offering.salesMotion).toContain('Outbound');
    expect(parsed.offering.extraNotes).toEqual([
      'Reference SOC 2 Type II audit.',
      'Bring up 340% ROI proof point.'
    ]);
    expect(parsed.expectedOutput.persona).toBe('SALES_EXEC');
    expect(parsed.instructions.length).toBeGreaterThan(0);
  });

  it('produces an ISO timestamp for the generatedAt field', () => {
    const metaPrompt = createSalesInfluenceMetaPrompt(baseInput);
    const parsed = JSON.parse(metaPrompt);

    expect(() => new Date(parsed.generatedAt)).not.toThrow();
    expect(new Date(parsed.generatedAt).toString()).not.toBe('Invalid Date');
  });
});

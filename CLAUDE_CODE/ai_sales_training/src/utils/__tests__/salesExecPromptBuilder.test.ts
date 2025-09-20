import { buildSalesExecMessages } from '../salesExecPromptBuilder';

const offering = {
  industry: 'Professional Services',
  subIndustry: 'Consulting Firms',
  salesMotion: 'Account-based pursuit of strategic consulting firms',
  productBlurb: 'Secure collaboration suite purpose-built for consulting project delivery teams.',
  geography: 'United Kingdom',
  extraNotes: 'Highlight GDPR compliance posture and regional customer references.'
};

describe('buildSalesExecMessages', () => {
  it('places the sales influence meta prompt before the system prompt', () => {
    const result = buildSalesExecMessages({
      systemPrompt: 'system instructions',
      messages: [{ role: 'user', content: 'Hello prospect' }],
      offering
    });

    expect(result.messages[0]).toEqual({
      role: 'system',
      content: result.metaPrompt
    });
    expect(result.messages[1]).toEqual({ role: 'system', content: 'system instructions' });
    expect(JSON.parse(result.metaPrompt).offering.geography).toBe('United Kingdom');
  });
});

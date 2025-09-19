const DEFAULT_AUTOMATION_BASE_URL = '/api/automation';

const buildUrl = (path = '') => {
  const base = process.env.REACT_APP_AUTOMATION_API_BASE_URL || DEFAULT_AUTOMATION_BASE_URL;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

export class AutomationService {
  static async launchSalesExecRuns({
    testCaseCount,
    offeringId,
    industryId,
    subIndustryId,
    personaId,
    contactTitle,
    companyDomain,
    metadata = {}
  }) {
    try {
      const response = await fetch(buildUrl('/runs'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflow: 'SALES_EXEC',
          testCases: Number(testCaseCount) || 1,
          context: {
            offeringId,
            industryId,
            subIndustryId,
            personaId,
            contactTitle,
            companyDomain,
            metadata
          }
        })
      });

      if (!response.ok) {
        let message = `Automation request failed with status ${response.status}`;
        try {
          const errorBody = await response.json();
          if (errorBody?.error) {
            message = errorBody.error;
          }
        } catch (parseError) {
          // Ignore JSON parse errors and fall back to default message
        }
        throw new Error(message);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || 'Unable to launch automation run' };
    }
  }
}

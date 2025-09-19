import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { usePersonaLibrary } from './hooks/usePersonaLibrary';
import { AutomationService } from './utils/automationService';

const deriveCompanyDomain = (user, profile) => {
  const profileDomain = profile?.companies?.domain || profile?.company_domain;
  if (profileDomain) {
    return profileDomain.toLowerCase();
  }

  const emailDomain = user?.email?.split('@')[1];
  if (emailDomain) {
    return emailDomain.toLowerCase();
  }

  return null;
};

const LoginForm = ({ onSwitchToSignup }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await signIn(formData.email, formData.password);
    if (authError) {
      setError(authError);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sales Training Platform
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <button type="button" onClick={onSwitchToSignup} className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SignupForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();

  const handleSubmit = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error: authError } = await signUp(formData.email, formData.password, formData.fullName);
    if (authError) {
      setError(authError);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Join Sales Training Platform</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Create your account to get started</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="text-center">
            <button type="button" onClick={onSwitchToLogin} className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PersonaSummary = ({ persona }) => {
  if (!persona) {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
        Select a contact title to preview persona insights.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{persona.role}</h3>
      <p className="text-sm text-blue-600 font-medium mb-4">{persona.company} — {persona.subIndustry}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Personality</h4>
          <p className="text-sm text-gray-600">{persona.personality}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Initial Stance</h4>
          <p className="text-sm text-gray-600">{persona.initialStance}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Pain Points</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {persona.painPoints.slice(0, 3).map((pain, index) => (
              <li key={index}>{pain}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Common Objections</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {persona.objections.slice(0, 3).map((objection, index) => (
              <li key={index}>{objection}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const AutomationControls = ({
  testCaseCount,
  onTestCaseCountChange,
  onLaunch,
  isLaunching,
  result,
  error,
  selectedPersona,
  selectedOffering,
  companyDomain
}) => {
  const isLaunchDisabled = !selectedPersona || !selectedOffering || isLaunching;

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Automation Test Harness</h3>
          <p className="text-sm text-gray-600">
            Configure SALES_EXEC automation runs using the current persona context. Domain detected: {companyDomain || 'N/A'}.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <label htmlFor="testCases" className="text-sm font-medium text-gray-700">
            Number of test cases
          </label>
          <input
            id="testCases"
            type="number"
            min={1}
            max={100}
            value={testCaseCount}
            onChange={(e) => onTestCaseCountChange(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onLaunch}
        disabled={isLaunchDisabled}
        className={`w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
          isLaunchDisabled
            ? 'bg-indigo-200 text-white cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isLaunching ? 'Launching SALES_EXEC...' : 'Launch SALES_EXEC Runs'}
      </button>

      {result && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          <p className="font-semibold">Automation started successfully.</p>
          {result.runId && <p>Run ID: {result.runId}</p>}
          {result.message && <p>{result.message}</p>}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  const companyDomain = useMemo(() => deriveCompanyDomain(user, profile), [user, profile]);

  const { data: personaLibrary, loading: personaLoading, error: personaError } = usePersonaLibrary(companyDomain);

  const [selectedOfferingId, setSelectedOfferingId] = useState('');
  const [selectedIndustryId, setSelectedIndustryId] = useState('');
  const [selectedSubIndustryId, setSelectedSubIndustryId] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState('');
  const [testCaseCount, setTestCaseCount] = useState(10);
  const [isLaunching, setIsLaunching] = useState(false);
  const [automationResult, setAutomationResult] = useState(null);
  const [automationError, setAutomationError] = useState(null);

  useEffect(() => {
    if (!personaLibrary) {
      setSelectedOfferingId('');
      setSelectedIndustryId('');
      setSelectedSubIndustryId('');
      setSelectedPersonaId('');
      return;
    }

    const { offerings, defaultSelections } = personaLibrary;
    if (!offerings?.length) return;

    setSelectedOfferingId((prev) => {
      if (offerings.some((offering) => offering.id === prev)) {
        return prev;
      }
      return defaultSelections.offeringId || offerings[0].id;
    });
  }, [personaLibrary]);

  useEffect(() => {
    if (!personaLibrary || !selectedOfferingId) return;

    const offering = personaLibrary.offerings.find((item) => item.id === selectedOfferingId);
    if (!offering) {
      setSelectedIndustryId('');
      return;
    }

    setSelectedIndustryId((prev) => {
      if (offering.industries?.some((industry) => industry.id === prev)) {
        return prev;
      }
      return offering.industries?.[0]?.id || '';
    });
  }, [personaLibrary, selectedOfferingId]);

  useEffect(() => {
    if (!personaLibrary || !selectedOfferingId || !selectedIndustryId) return;

    const offering = personaLibrary.offerings.find((item) => item.id === selectedOfferingId);
    const industry = offering?.industries?.find((item) => item.id === selectedIndustryId);

    if (!industry) {
      setSelectedSubIndustryId('');
      return;
    }

    setSelectedSubIndustryId((prev) => {
      if (industry.subIndustries?.some((sub) => sub.id === prev)) {
        return prev;
      }
      return industry.subIndustries?.[0]?.id || '';
    });
  }, [personaLibrary, selectedOfferingId, selectedIndustryId]);

  const personaOptions = useMemo(() => {
    if (!personaLibrary || !selectedOfferingId || !selectedIndustryId || !selectedSubIndustryId) {
      return [];
    }

    const offering = personaLibrary.offerings.find((item) => item.id === selectedOfferingId);
    const industry = offering?.industries?.find((item) => item.id === selectedIndustryId);
    const subIndustry = industry?.subIndustries?.find((item) => item.id === selectedSubIndustryId);

    return subIndustry?.personas || [];
  }, [personaLibrary, selectedOfferingId, selectedIndustryId, selectedSubIndustryId]);

  useEffect(() => {
    if (!personaOptions.length) {
      setSelectedPersonaId('');
      return;
    }

    setSelectedPersonaId((prev) => {
      if (personaOptions.some((option) => option.id === prev)) {
        return prev;
      }
      return personaOptions[0].id;
    });
  }, [personaOptions]);

  useEffect(() => {
    if (!personaLibrary?.metadata) return;
    if (typeof personaLibrary.metadata.defaultTestCaseCount === 'number') {
      setTestCaseCount(personaLibrary.metadata.defaultTestCaseCount);
    }
  }, [personaLibrary]);

  const selectedPersona = useMemo(() => {
    if (!personaLibrary || !selectedPersonaId) return null;
    return personaLibrary.personas[selectedPersonaId] || null;
  }, [personaLibrary, selectedPersonaId]);

  const selectedOffering = useMemo(() => {
    if (!personaLibrary) return null;
    return personaLibrary.offerings.find((item) => item.id === selectedOfferingId) || null;
  }, [personaLibrary, selectedOfferingId]);

  const handleTestCaseCountChange = (value) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;
    const bounded = Math.min(100, Math.max(1, Math.floor(numericValue)));
    setTestCaseCount(bounded);
  };

  const handleLaunchAutomation = async () => {
    if (!selectedPersona || !selectedOffering) return;

    setIsLaunching(true);
    setAutomationResult(null);
    setAutomationError(null);

    const { data, error } = await AutomationService.launchSalesExecRuns({
      testCaseCount,
      offeringId: selectedOfferingId,
      industryId: selectedIndustryId,
      subIndustryId: selectedSubIndustryId,
      personaId: selectedPersonaId,
      contactTitle: selectedPersona.role,
      companyDomain,
      metadata: {
        offeringName: selectedOffering.name,
        personaRole: selectedPersona.role
      }
    });

    if (error) {
      setAutomationError(error);
    } else {
      setAutomationResult(data);
    }

    setIsLaunching(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showSignup ? (
      <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Sales Training Orchestrator</h1>
            <p className="text-sm text-gray-600">
              Signed in as {profile?.full_name || user.email} · {companyDomain || 'Domain not detected'}
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section className="bg-white shadow-sm rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Persona Context</h2>
            <p className="text-sm text-gray-600">
              Choose the offering, industry, and buyer persona to seed automation and practice scenarios.
            </p>
          </div>

          {personaError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {personaError}
            </div>
          )}

          {personaLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
                <p className="mt-3 text-gray-600">Loading persona library...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Offering</label>
                  <select
                    value={selectedOfferingId}
                    onChange={(e) => setSelectedOfferingId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {(personaLibrary?.offerings || []).map((offering) => (
                      <option key={offering.id} value={offering.id}>
                        {offering.name}
                      </option>
                    ))}
                  </select>
                  {selectedOffering?.description && (
                    <p className="mt-2 text-sm text-gray-500">{selectedOffering.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry</label>
                  <select
                    value={selectedIndustryId}
                    onChange={(e) => setSelectedIndustryId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {(selectedOffering?.industries || []).map((industry) => (
                      <option key={industry.id} value={industry.id}>
                        {industry.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sub-industry</label>
                  <select
                    value={selectedSubIndustryId}
                    onChange={(e) => setSelectedSubIndustryId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {(
                      selectedOffering?.industries
                        ?.find((industry) => industry.id === selectedIndustryId)
                        ?.subIndustries || []
                    ).map((subIndustry) => (
                      <option key={subIndustry.id} value={subIndustry.id}>
                        {subIndustry.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact title</label>
                  <select
                    value={selectedPersonaId}
                    onChange={(e) => setSelectedPersonaId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {personaOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <PersonaSummary persona={selectedPersona} />
            </div>
          )}
        </section>

        <AutomationControls
          testCaseCount={testCaseCount}
          onTestCaseCountChange={handleTestCaseCountChange}
          onLaunch={handleLaunchAutomation}
          isLaunching={isLaunching}
          result={automationResult}
          error={automationError}
          selectedPersona={selectedPersona}
          selectedOffering={selectedOffering}
          companyDomain={companyDomain}
        />
      </main>
    </div>
  );
};

export default App;

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  Zap,
  Package
} from 'lucide-react';
import ProductConfigManager from './components/ProductConfigManager';
import { personaLoader } from './utils/personaLoader';

type TabId = 'simulate' | 'practice' | 'personas' | 'results' | 'product';

type LLMOption = {
  id: string;
  name: string;
  provider: string;
};

const LLM_OPTIONS: LLMOption[] = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Meta' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral AI' }
];

const SALES_PITCHES = {
  industryPainPoint: "Hi [Name], I'm calling because I've been working with other [subIndustry] who are struggling with [specific pain point]. I wanted to see if this is something you're dealing with as well.",
  valueProposition: "Hi [Name], I'm calling from ProductivityPro. We help [subIndustry] like yours [specific value]. Do you have 30 seconds for me to explain why this might be relevant?",
  credibilityFirst: "Hi [Name], I'm calling because we just helped [similar company] achieve [specific result]. I thought this might be relevant for [their company]. Do you have a minute?",
  questionBased: "Hi [Name], quick question - how is [their company] currently handling [specific process]? The reason I ask is...",
  complianceFirst: "Hi [Name], I'm calling because we specialize in helping [subIndustry] maintain compliance while improving efficiency. Given the regulatory requirements in your industry, I thought this might be relevant."
} as const;

type PitchType = keyof typeof SALES_PITCHES;

type ConversationSpeaker = 'Sales Agent' | 'Customer' | 'Human Sales Rep';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

interface Persona {
  id: string;
  role: string;
  company: string;
  industry: string;
  subIndustry: string;
  personality: string;
  initialStance: string;
  painPoints: string[];
  objections: string[];
  successTriggers?: string[];
}

type PersonaMap = Record<string, Persona>;

interface ConversationTurn {
  speaker: ConversationSpeaker;
  message: string;
  timestamp: Date;
}

interface SimulationResult {
  persona: string;
  pitch: PitchType;
  success: boolean;
  duration: number;
  exchanges: number;
  timestamp: Date;
  conversationId: number;
  error?: string;
}

interface BatchProgress {
  current: number;
  total: number;
}

type ProductConfig = {
  productName?: string;
  company?: string;
  description?: string;
  valueProposition?: string;
  keyFeatures?: Array<string | { name: string; description?: string }>;
  [key: string]: unknown;
};

const defaultProductConfig: ProductConfig = {
  productName: 'ProductivityPro Security Suite',
  company: 'ProductivityPro Inc.',
  description: 'Comprehensive productivity and security platform designed specifically for professional services firms',
  valueProposition: 'Reduce administrative overhead by 40% while maintaining enterprise-grade security and compliance'
};

const buildSalesOpening = (persona: Persona, pitch: PitchType): string => {
  const template = SALES_PITCHES[pitch];
  const primaryPainPoint = persona.painPoints[0] ?? 'their most pressing operational challenge';
  const processSnippet = primaryPainPoint.split(' ').slice(0, 3).join(' ').toLowerCase();
  const subIndustry = persona.subIndustry.toLowerCase();

  return template
    .replace('[Name]', persona.role.split(' ')[0])
    .replace('[subIndustry]', subIndustry)
    .replace('[specific pain point]', primaryPainPoint.toLowerCase())
    .replace('[specific value]', 'reduce administrative overhead by 40% while maintaining compliance')
    .replace('[similar company]', `another ${subIndustry.replace(/s$/, '')} firm`)
    .replace('[specific result]', 'save 15 hours per week on document management')
    .replace('[their company]', 'your firm')
    .replace('[specific process]', processSnippet || 'critical workflows');
};

const SalesTrainingSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('simulate');
  const [customerPersonas, setCustomerPersonas] = useState<PersonaMap>({});
  const [productConfig, setProductConfig] = useState<ProductConfig>(defaultProductConfig);
  const [selectedPersona, setSelectedPersona] = useState<string>('law-managing-partner');
  const [selectedPitch, setSelectedPitch] = useState<PitchType>('industryPainPoint');
  const [selectedLLM, setSelectedLLM] = useState<string>(LLM_OPTIONS[0]?.id ?? '');
  const [apiKey, setApiKey] = useState('');
  const [conversationCount, setConversationCount] = useState<number>(25);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({ current: 0, total: 0 });
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [userInput, setUserInput] = useState('');
  const [personasLoaded, setPersonasLoaded] = useState(false);

  const conversationRef = useRef<HTMLDivElement | null>(null);
  const cancelSimulationRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cancelSimulationRef.current = true;
    };
  }, []);

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const personas = (await personaLoader.loadAllPersonas()) as PersonaMap;
        if (!isMountedRef.current) {
          return;
        }

        setCustomerPersonas(personas);

        if (!personas[selectedPersona]) {
          const personaIds = Object.keys(personas);
          if (personaIds.length > 0) {
            setSelectedPersona(personaIds[0]);
          }
        }

        setPersonasLoaded(true);
      } catch (error) {
        console.error('Failed to load personas:', error);
        if (isMountedRef.current) {
          setPersonasLoaded(true);
        }
      }
    };

    loadPersonas();
  }, []);

  useEffect(() => {
    setConversation([]);
  }, [selectedPersona]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  const callOpenRouter = async (messages: ChatMessage[], systemPrompt: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'AI Sales Training System'
      },
      body: JSON.stringify({
        model: selectedLLM,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message ?? 'Request failed'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content as string;
  };

  const generateCustomerResponse = async (
    persona: Persona,
    conversationHistory: ConversationTurn[],
    salesMessage: string
  ): Promise<string> => {
    const systemPrompt = `You are role-playing as a ${persona.role} at a ${persona.company} (${persona.subIndustry}).

    Your personality: ${persona.personality}
    Your initial stance: "${persona.initialStance}"
    Your hidden pain points (only reveal if sales person earns it through good discovery): ${persona.painPoints.join(', ')}
    Your typical objections: ${persona.objections.join(', ')}

    Respond realistically as this person would to a cold call. Be skeptical initially, but show interest if the salesperson demonstrates relevant industry knowledge or addresses your pain points. Keep responses very concise (1 sentence max). Stay in character.

    If this is the first contact, be very guarded and skeptical. If the salesperson has shown industry expertise or mentioned relevant pain points, be slightly more open but still cautious.`;

    const messages: ChatMessage[] = [
      ...conversationHistory.map((entry) => ({
        role: entry.speaker === 'Sales Agent' || entry.speaker === 'Human Sales Rep' ? 'user' : 'assistant',
        content: entry.message
      })),
      { role: 'user', content: salesMessage }
    ];

    return callOpenRouter(messages, systemPrompt);
  };

  const generateSalesResponse = async (
    persona: Persona,
    conversationHistory: ConversationTurn[],
    customerMessage: string
  ): Promise<string> => {
    const systemPrompt = `You are an experienced sales professional calling a ${persona.role} at a ${persona.company}. You're selling productivity and security software.

    What you know about this prospect:
    - Role: ${persona.role}
    - Company: ${persona.company} (${persona.subIndustry})
    - Personality: ${persona.personality}

    Your goal is to:
    1. Build credibility through industry knowledge
    2. Identify their pain points through good discovery questions
    3. Address objections professionally
    4. Secure a next step (demo, follow-up call)

    Keep responses very concise (1-2 sentences max), professional, and focused on their likely business challenges. Ask good discovery questions. Show industry expertise.`;

    const messages: ChatMessage[] = conversationHistory.map((entry) => ({
      role: entry.speaker === 'Customer' ? 'user' : 'assistant',
      content: entry.message
    }));

    messages.push({ role: 'user', content: customerMessage });

    return callOpenRouter(messages, systemPrompt);
  };

  const runSingleConversation = async (
    personaId: string,
    pitch: PitchType,
    conversationIndex: number
  ): Promise<SimulationResult> => {
    try {
      const personaData = customerPersonas[personaId];
      if (!personaData) {
        throw new Error(`Persona ${personaId} not found`);
      }

      const salesOpening = buildSalesOpening(personaData, pitch);

      const conversationHistory: ConversationTurn[] = [
        {
          speaker: 'Sales Agent',
          message: salesOpening,
          timestamp: new Date()
        }
      ];

      let exchanges = 0;
      let customerInterested = false;

      for (let i = 0; i < 3 && !customerInterested; i += 1) {
        const lastSalesMessage = conversationHistory[conversationHistory.length - 1].message;
        const customerResponse = await generateCustomerResponse(personaData, conversationHistory, lastSalesMessage);

        conversationHistory.push({
          speaker: 'Customer',
          message: customerResponse,
          timestamp: new Date()
        });

        const normalizedResponse = customerResponse.toLowerCase();
        if (
          normalizedResponse.includes('demo') ||
          normalizedResponse.includes('meeting') ||
          normalizedResponse.includes('tell me more') ||
          normalizedResponse.includes('interested')
        ) {
          customerInterested = true;
          break;
        }

        const salesResponse = await generateSalesResponse(personaData, conversationHistory, customerResponse);
        conversationHistory.push({
          speaker: 'Sales Agent',
          message: salesResponse,
          timestamp: new Date()
        });

        exchanges += 1;
      }

      return {
        persona: personaId,
        pitch,
        success: customerInterested,
        duration: exchanges * 1.5,
        exchanges: conversationHistory.length,
        timestamp: new Date(),
        conversationId: conversationIndex
      };
    } catch (error) {
      console.error(`Error in conversation ${conversationIndex}:`, error);
      return {
        persona: personaId,
        pitch,
        success: false,
        duration: 0,
        exchanges: 0,
        timestamp: new Date(),
        conversationId: conversationIndex,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runBatchConversations = async () => {
    if (!apiKey) {
      alert('Please enter your OpenRouter API key first.');
      return;
    }

    if (!customerPersonas[selectedPersona]) {
      alert('Please select a persona to simulate against.');
      return;
    }

    if (isSimulating) {
      return;
    }

    cancelSimulationRef.current = false;
    setIsSimulating(true);
    setBatchProgress({ current: 0, total: conversationCount });
    setSimulationResults([]);

    const batchSize = 8;

    for (let i = 0; i < conversationCount && !cancelSimulationRef.current; i += batchSize) {
      const end = Math.min(i + batchSize, conversationCount);
      const batch: Array<Promise<SimulationResult>> = [];

      for (let j = i; j < end; j += 1) {
        batch.push(runSingleConversation(selectedPersona, selectedPitch, j + 1));
      }

      try {
        const batchResults = await Promise.all(batch);

        if (cancelSimulationRef.current || !isMountedRef.current) {
          break;
        }

        setSimulationResults((prev) => [...prev, ...batchResults]);
        setBatchProgress({ current: end, total: conversationCount });
      } catch (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      }

      if (end < conversationCount && !cancelSimulationRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    if (isMountedRef.current) {
      setIsSimulating(false);
      setBatchProgress({ current: 0, total: 0 });
    }

    cancelSimulationRef.current = false;
  };

  const handleStopSimulation = () => {
    if (isSimulating) {
      cancelSimulationRef.current = true;
    }
  };

  const handleResetSimulation = () => {
    cancelSimulationRef.current = true;
    setIsSimulating(false);
    setSimulationResults([]);
    setBatchProgress({ current: 0, total: 0 });
  };

  const handleHumanMessage = async (message: string) => {
    if (!apiKey) {
      alert('Please enter your OpenRouter API key first.');
      return;
    }

    const persona = customerPersonas[selectedPersona];
    if (!persona) {
      return;
    }

    const updatedConversation: ConversationTurn[] = [
      ...conversation,
      {
        speaker: 'Human Sales Rep',
        message,
        timestamp: new Date()
      }
    ];

    setConversation(updatedConversation);
    setUserInput('');

    try {
      const response = await generateCustomerResponse(persona, updatedConversation.slice(0, -1), message);
      if (isMountedRef.current) {
        setConversation((prev) => [
          ...prev,
          {
            speaker: 'Customer',
            message: response,
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setConversation((prev) => [
          ...prev,
          {
            speaker: 'Customer',
            message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: new Date()
          }
        ]);
      }
    }
  };

  const resetConversation = () => {
    setConversation([]);
    setUserInput('');
  };

  const getSuccessRate = () => {
    if (simulationResults.length === 0) {
      return 0;
    }

    const successes = simulationResults.filter((result) => result.success).length;
    return Math.round((successes / simulationResults.length) * 100);
  };

  const getAverageExchanges = () => {
    if (simulationResults.length === 0) {
      return 0;
    }

    const total = simulationResults.reduce((sum, result) => sum + result.exchanges, 0);
    return Math.round((total / simulationResults.length) * 10) / 10;
  };

  if (!personasLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading personas...</p>
        </div>
      </div>
    );
  }

  const personaOptions = Object.entries(customerPersonas);
  const selectedPersonaData = customerPersonas[selectedPersona];
  const pitchPreview = selectedPersonaData ? buildSalesOpening(selectedPersonaData, selectedPitch) : '';
  const progressPercentage = batchProgress.total
    ? Math.round((batchProgress.current / batchProgress.total) * 100)
    : 0;
  const recentSimulationResults = simulationResults.slice(-5).reverse();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Sales Training System</h1>
        <p className="text-gray-600">
          Professional Services Industry Focus - Practice first calls with AI customer agents
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">OpenRouter API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Enter your OpenRouter API key"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language Model</label>
            <select
              value={selectedLLM}
              onChange={(event) => setSelectedLLM(event.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {LLM_OPTIONS.map((llm) => (
                <option key={llm.id} value={llm.id}>
                  {llm.name} ({llm.provider})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Persona</label>
            <select
              value={selectedPersona}
              onChange={(event) => setSelectedPersona(event.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {personaOptions.map(([id, persona]) => (
                <option key={id} value={id}>
                  {persona.role} • {persona.subIndustry}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {(
          [
            { id: 'simulate', label: 'AI vs AI Simulation', icon: Zap },
            { id: 'practice', label: 'Human Practice', icon: MessageSquare },
            { id: 'product', label: 'Product Configuration', icon: Package },
            { id: 'personas', label: 'Customer Personas', icon: Users },
            { id: 'results', label: 'Results & Analytics', icon: BarChart3 }
          ] as Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }>
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'simulate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Simulation Controls</h2>
                  <p className="text-sm text-gray-500">
                    Run AI vs AI conversations to test messaging at scale.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={runBatchConversations}
                  disabled={isSimulating}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Run Simulation
                </button>
                <button
                  onClick={handleStopSimulation}
                  disabled={!isSimulating}
                  className="inline-flex items-center px-3 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-md hover:bg-orange-200 disabled:opacity-50"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Stop
                </button>
                <button
                  onClick={handleResetSimulation}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
                <select
                  value={selectedPersona}
                  onChange={(event) => setSelectedPersona(event.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {personaOptions.map(([id, persona]) => (
                    <option key={id} value={id}>
                      {persona.role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pitch Strategy</label>
                <select
                  value={selectedPitch}
                  onChange={(event) => setSelectedPitch(event.target.value as PitchType)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(SALES_PITCHES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {(key as string).replace(/([A-Z])/g, ' $1').trim()} - {value.slice(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Conversations</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={conversationCount}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (!Number.isNaN(value)) {
                      const clamped = Math.max(1, Math.min(200, Math.round(value)));
                      setConversationCount(clamped);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {isSimulating && (
              <div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Simulating conversations...</span>
                  <span>
                    {batchProgress.current}/{batchProgress.total} completed ({progressPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Pitch Preview</h3>
              <p className="text-sm text-blue-900 leading-relaxed">{pitchPreview}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Simulation Results</h3>
            {recentSimulationResults.length === 0 ? (
              <p className="text-sm text-gray-500">
                Run a simulation to see success rates and conversation outcomes.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentSimulationResults.map((result) => (
                  <li
                    key={result.conversationId}
                    className="border border-gray-100 rounded-md p-3"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">
                        {customerPersonas[result.persona]?.role}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          result.success
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {result.success ? 'Success' : 'Missed'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pitch: {result.pitch.replace(/([A-Z])/g, ' $1').trim()} • Exchanges: {result.exchanges}
                    </p>
                    {result.error && (
                      <p className="text-xs text-red-500 mt-1">Error: {result.error}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === 'practice' && selectedPersonaData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Live Conversation Practice</h2>
                  <p className="text-sm text-gray-500">
                    Role-play the call and let the AI customer respond in real time.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetConversation}
                    className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
                  >
                    <RotateCcw className="w-4 h-4 mr-1 inline" /> Reset conversation
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
                  <select
                    value={selectedPersona}
                    onChange={(event) => setSelectedPersona(event.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {personaOptions.map(([id, persona]) => (
                      <option key={id} value={id}>
                        {persona.role} ({persona.subIndustry})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pitch Strategy</label>
                  <select
                    value={selectedPitch}
                    onChange={(event) => setSelectedPitch(event.target.value as PitchType)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.keys(SALES_PITCHES).map((key) => (
                      <option key={key} value={key}>
                        {(key as string).replace(/([A-Z])/g, ' $1').trim()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                ref={conversationRef}
                className="h-80 overflow-y-auto space-y-3 pr-2 border border-gray-100 rounded-lg p-3 bg-gray-50"
              >
                {conversation.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center mt-12">
                    Start the conversation with your opening line to see how the customer responds.
                  </div>
                ) : (
                  conversation.map((entry, index) => (
                    <div
                      key={`${entry.speaker}-${index}`}
                      className={`flex ${
                        entry.speaker === 'Customer' ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-xl px-3 py-2 rounded-lg shadow-sm text-sm ${
                          entry.speaker === 'Customer'
                            ? 'bg-white text-gray-800 border border-gray-200'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{entry.speaker}</span>
                          <span className="text-xs opacity-70">
                            {entry.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{entry.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <textarea
                  value={userInput}
                  onChange={(event) => setUserInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      if (userInput.trim()) {
                        handleHumanMessage(userInput.trim());
                      }
                    }
                  }}
                  placeholder="Type your next line..."
                  className="flex-1 min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!apiKey}
                />
                <button
                  onClick={() => userInput.trim() && handleHumanMessage(userInput.trim())}
                  disabled={!userInput.trim() || !apiKey}
                  className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Send response
                </button>
              </div>

              <div className="mt-2 bg-gray-50 border border-gray-200 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Tip:</strong> This customer is {selectedPersonaData.personality.toLowerCase()}. Their initial stance:
                  "{selectedPersonaData.initialStance}".
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Call Preparation</h3>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Suggested Opening</h4>
                  <p className="bg-blue-50 border border-blue-100 rounded-md p-3 text-blue-900">
                    {pitchPreview}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Discovery Focus</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedPersonaData.painPoints.slice(0, 3).map((pain, index) => (
                      <li key={index}>{pain}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Persona Snapshot</h3>
              <p className="text-sm text-gray-500">Use these insights to tailor your conversation.</p>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="font-semibold text-gray-800">Role:</span> {selectedPersonaData.role}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Company:</span> {selectedPersonaData.company}
              </div>
              <div>
                <span className="font-semibold text-gray-800">Sub-industry:</span> {selectedPersonaData.subIndustry}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Common Objections</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {selectedPersonaData.objections.slice(0, 4).map((objection, index) => (
                  <li key={index}>• {objection}</li>
                ))}
              </ul>
            </div>

            {selectedPersonaData.successTriggers && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Success Triggers</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {selectedPersonaData.successTriggers.map((trigger, index) => (
                    <li key={index}>• {trigger}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'product' && (
        <ProductConfigManager
          productConfig={productConfig}
          onProductConfigChange={setProductConfig}
        />
      )}

      {activeTab === 'personas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personaOptions.map(([key, persona]) => (
            <div key={key} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{persona.role}</h3>
                  <p className="text-sm text-blue-600 font-medium">{persona.subIndustry}</p>
                  <p className="text-sm text-gray-600">{persona.company}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-800">Personality</h4>
                  <p className="text-gray-600">{persona.personality}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Initial Stance</h4>
                  <p className="text-gray-600 italic">"{persona.initialStance}"</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Top Pain Points</h4>
                  <ul className="space-y-1 text-gray-600">
                    {persona.painPoints.slice(0, 2).map((pain, index) => (
                      <li key={index}>• {pain}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPersona(key);
                  setActiveTab('practice');
                  resetConversation();
                }}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Practice with this customer
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          {simulationResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{getSuccessRate()}%</div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {simulationResults.filter((result) => result.success).length}
                </div>
                <div className="text-sm text-gray-500">Successful Calls</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">{getAverageExchanges()}</div>
                <div className="text-sm text-gray-500">Avg Exchanges</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">{simulationResults.length}</div>
                <div className="text-sm text-gray-500">Total Tests</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detailed Results</h3>
              <button
                onClick={() => setSimulationResults([])}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Clear Results
              </button>
            </div>

            {simulationResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No simulation results yet. Run some AI vs AI tests to see data here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Persona</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pitch Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exchanges</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {simulationResults.slice().reverse().map((result, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customerPersonas[result.persona]?.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {customerPersonas[result.persona]?.subIndustry}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.pitch.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {result.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.duration.toFixed(1)} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.exchanges}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.timestamp.toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTrainingSystem;

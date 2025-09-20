import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, BarChart3, Users, MessageSquare, Settings, Zap } from 'lucide-react';
import { personaLoader } from './utils/personaLoader';
import { buildSalesExecMessages, SalesOfferingContext } from './utils/salesExecPromptBuilder';
import createSalesInfluenceMetaPrompt from './utils/createSalesInfluenceMetaPrompt';

// OpenRouter LLM Options
const LLM_OPTIONS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Meta' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral AI' }
];

// Sales pitches and responses
const SALES_PITCHES = {
  industryPainPoint: "Hi [Name], I'm calling because I've been working with other [subIndustry] who are struggling with [specific pain point]. I wanted to see if this is something you're dealing with as well.",
  valueProposition: "Hi [Name], I'm calling from ProductivityPro. We help [subIndustry] like yours [specific value]. Do you have 30 seconds for me to explain why this might be relevant?",
  credibilityFirst: "Hi [Name], I'm calling because we just helped [similar company] achieve [specific result]. I thought this might be relevant for [their company]. Do you have a minute?",
  questionBased: "Hi [Name], quick question - how is [their company] currently handling [specific process]? The reason I ask is...",
  complianceFirst: "Hi [Name], I'm calling because we specialize in helping [subIndustry] maintain compliance while improving efficiency. Given the regulatory requirements in your industry, I thought this might be relevant."
};

type SalesOfferingDefinition = SalesOfferingContext & { id: string; name: string };

const SALES_OFFERINGS: Record<string, SalesOfferingDefinition> = {
  'productivity-pro-ps-na': {
    id: 'productivity-pro-ps-na',
    name: 'ProductivityPro Suite — NA Legal',
    industry: 'Professional Services',
    subIndustry: 'Law Firms',
    salesMotion: 'Outbound prospecting to compliance-focused law firms',
    productBlurb:
      'Comprehensive productivity and security platform designed for firms that need airtight compliance and frictionless collaboration.',
    geography: 'North America',
    extraNotes: 'Lead with SOC 2 Type II proof points and the 340% ROI achieved within 12 months.'
  },
  'productivity-pro-ps-uk': {
    id: 'productivity-pro-ps-uk',
    name: 'ProductivityPro Suite — UK Consulting',
    industry: 'Professional Services',
    subIndustry: 'Consulting Firms',
    salesMotion: 'Account-based pursuit of UK consulting practices with distributed project teams',
    productBlurb:
      'Secure client portals and workflow automation purpose-built for consulting engagements that span multiple geographies.',
    geography: 'United Kingdom',
    extraNotes: 'Reference GDPR posture, localized success resources, and fast implementation windows.'
  }
};

const DEFAULT_OFFERING_ID = 'productivity-pro-ps-na';

const SalesTrainingSystem = () => {
  const [activeTab, setActiveTab] = useState('simulate');
  const [customerPersonas, setCustomerPersonas] = useState({});
  const [selectedPersona, setSelectedPersona] = useState('law-managing-partner');
  const [selectedPitch, setSelectedPitch] = useState('industryPainPoint');
  const [selectedLLM, setSelectedLLM] = useState('anthropic/claude-3.5-sonnet');
  const [apiKey, setApiKey] = useState('');
  const [conversationCount, setConversationCount] = useState(100);
  const [conversation, setConversation] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [simulationResults, setSimulationResults] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [personasLoaded, setPersonasLoaded] = useState(false);
  const [selectedOfferingId, setSelectedOfferingId] = useState(DEFAULT_OFFERING_ID);

  const conversationRef = useRef(null);
  const latestMetaPromptRef = useRef('');

  const selectedOffering = SALES_OFFERINGS[selectedOfferingId] ?? SALES_OFFERINGS[DEFAULT_OFFERING_ID];

  const metaPromptPreview = useMemo(() => {
    if (!selectedOffering) {
      return '';
    }
    return createSalesInfluenceMetaPrompt(selectedOffering);
  }, [selectedOffering]);

  // Load personas on component mount
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const personas = await personaLoader.loadAllPersonas();
        setCustomerPersonas(personas);
        setPersonasLoaded(true);
      } catch (error) {
        console.error('Failed to load personas:', error);
      }
    };

    loadPersonas();
  }, []);

  // Call OpenRouter API with improved error handling
  const callOpenRouter = async (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt: string
  ) => {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    if (!selectedOffering) {
      throw new Error('Selected offering configuration is missing');
    }

    const { metaPrompt, messages: salesExecMessages } = buildSalesExecMessages({
      systemPrompt,
      messages,
      offering: selectedOffering
    });

    latestMetaPromptRef.current = metaPrompt;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'AI Sales Training System'
      },
      body: JSON.stringify({
        model: selectedLLM,
        messages: salesExecMessages,
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Request failed'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  // Generate customer response using LLM
  const generateCustomerResponse = async (persona, conversationHistory, salesMessage) => {
    const systemPrompt = `You are role-playing as a ${persona.role} at a ${persona.company} (${persona.subIndustry}). 

    Your personality: ${persona.personality}
    Your initial stance: "${persona.initialStance}"
    Your hidden pain points (only reveal if sales person earns it through good discovery): ${persona.painPoints.join(', ')}
    Your typical objections: ${persona.objections.join(', ')}

    Respond realistically as this person would to a cold call. Be skeptical initially, but show interest if the salesperson demonstrates relevant industry knowledge or addresses your pain points. Keep responses very concise (1 sentence max). Stay in character.

    If this is the first contact, be very guarded and skeptical. If the salesperson has shown industry expertise or mentioned relevant pain points, be slightly more open but still cautious.`;

    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.speaker === 'Sales Agent' || msg.speaker === 'Human Sales Rep' ? 'user' : 'assistant',
        content: msg.message
      })),
      { role: 'user', content: salesMessage }
    ];

    return await callOpenRouter(messages, systemPrompt);
  };

  // Generate sales response using LLM
  const generateSalesResponse = async (persona, conversationHistory, customerMessage) => {
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

    const messages = conversationHistory.map(msg => ({
      role: msg.speaker === 'Customer' ? 'user' : 'assistant',
      content: msg.message
    }));

    messages.push({ role: 'user', content: customerMessage });

    return await callOpenRouter(messages, systemPrompt);
  };

  // Run single AI vs AI conversation
  const runSingleConversation = async (personaId, pitch, conversationIndex) => {
    try {
      const personaData = customerPersonas[personaId];
      if (!personaData) {
        throw new Error(`Persona ${personaId} not found`);
      }

      const pitchTemplate = SALES_PITCHES[pitch];
      
      // Generate initial sales message
      const salesOpening = pitchTemplate
        .replace('[Name]', personaData.role.split(' ')[0])
        .replace('[subIndustry]', personaData.subIndustry.toLowerCase())
        .replace('[specific pain point]', personaData.painPoints[0].toLowerCase())
        .replace('[specific value]', 'reduce administrative overhead by 40% while maintaining compliance')
        .replace('[similar company]', `another ${personaData.subIndustry.toLowerCase().slice(0, -1)} firm`)
        .replace('[specific result]', 'save 15 hours per week on document management')
        .replace('[their company]', 'your firm')
        .replace('[specific process]', personaData.painPoints[0].split(' ').slice(0, 3).join(' ').toLowerCase());

      let conversationHistory = [];
      let exchanges = 0;
      let customerInterested = false;

      // Initial sales message
      conversationHistory.push({
        speaker: 'Sales Agent',
        message: salesOpening,
        timestamp: new Date()
      });

      // Reduced exchanges for faster processing
      for (let i = 0; i < 3 && !customerInterested; i++) {
        const lastSalesMessage = conversationHistory[conversationHistory.length - 1].message;
        const customerResponse = await generateCustomerResponse(personaData, conversationHistory, lastSalesMessage);
        
        conversationHistory.push({
          speaker: 'Customer',
          message: customerResponse,
          timestamp: new Date()
        });

        // Check if customer is interested
        if (customerResponse.toLowerCase().includes('demo') || 
            customerResponse.toLowerCase().includes('meeting') || 
            customerResponse.toLowerCase().includes('tell me more') ||
            customerResponse.toLowerCase().includes('interested')) {
          customerInterested = true;
          break;
        }

        const salesResponse = await generateSalesResponse(personaData, conversationHistory, customerResponse);
        conversationHistory.push({
          speaker: 'Sales Agent',
          message: salesResponse,
          timestamp: new Date()
        });

        exchanges++;
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
        error: error.message
      };
    }
  };

  // Run batch conversations with parallel processing
  const runBatchConversations = async () => {
    if (!apiKey) {
      alert('Please enter your OpenRouter API key first');
      return;
    }

    setIsSimulating(true);
    setBatchProgress({ current: 0, total: conversationCount });
    setSimulationResults([]);

    const results = [];
    const batchSize = 8;
    
    for (let i = 0; i < conversationCount; i += batchSize) {
      const batch = [];
      const end = Math.min(i + batchSize, conversationCount);
      
      for (let j = i; j < end; j++) {
        batch.push(runSingleConversation(selectedPersona, selectedPitch, j + 1));
      }
      
      try {
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
        setSimulationResults(prev => [...prev, ...batchResults]);
        
        setBatchProgress({ current: end, total: conversationCount });
        
        if (end < conversationCount) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, error);
      }
    }

    setIsSimulating(false);
    setBatchProgress({ current: 0, total: 0 });
  };

  // Handle human practice message
  const handleHumanMessage = async (message) => {
    if (!apiKey) {
      alert('Please enter your OpenRouter API key first');
      return;
    }

    const persona = customerPersonas[selectedPersona];
    if (!persona) return;
    
    const newConv = [...conversation, { 
      speaker: 'Human Sales Rep', 
      message, 
      timestamp: new Date() 
    }];
    setConversation(newConv);
    
    try {
      const response = await generateCustomerResponse(persona, newConv.slice(0, -1), message);
      setConversation(prev => [...prev, { 
        speaker: 'Customer', 
        message: response, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      setConversation(prev => [...prev, { 
        speaker: 'Customer', 
        message: `Error: ${error.message}`, 
        timestamp: new Date() 
      }]);
    }
    
    setUserInput('');
  };

  const resetConversation = () => {
    setConversation([]);
    setIsSimulating(false);
  };

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  const getSuccessRate = () => {
    if (simulationResults.length === 0) return 0;
    const successes = simulationResults.filter(r => r.success).length;
    return Math.round((successes / simulationResults.length) * 100);
  };

  const getAverageExchanges = () => {
    if (simulationResults.length === 0) return 0;
    const total = simulationResults.reduce((sum, r) => sum + r.exchanges, 0);
    return Math.round(total / simulationResults.length * 10) / 10;
  };

  if (!personasLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading personas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Sales Training System</h1>
        <p className="text-gray-600">Professional Services Industry Focus - Practice first calls with AI customer agents</p>
        
        {/* API Configuration */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OpenRouter API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language Model</label>
            <select
              value={selectedLLM}
              onChange={(e) => setSelectedLLM(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {LLM_OPTIONS.map(llm => (
                <option key={llm.id} value={llm.id}>
                  {llm.name} ({llm.provider})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sales Offering</label>
            <select
              value={selectedOffering.id}
              onChange={(event) => setSelectedOfferingId(event.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(SALES_OFFERINGS).map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {offering.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {selectedOffering?.productBlurb}
            </p>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900 space-y-2">
          <div>
            <strong>Sales motion:</strong> {selectedOffering?.salesMotion}
          </div>
          <div>
            <strong>Target geography:</strong> {selectedOffering?.geography}
          </div>
          {selectedOffering?.extraNotes && (
            <div>
              <strong>Extra notes:</strong> {selectedOffering.extraNotes}
            </div>
          )}
        </div>

        <details className="mt-3 bg-gray-50 border border-gray-200 rounded-lg">
          <summary className="px-4 py-2 font-medium text-gray-700 cursor-pointer select-none">
            Meta prompt JSON preview
          </summary>
          <pre className="px-4 py-3 text-xs overflow-x-auto text-gray-600 whitespace-pre-wrap">
            {latestMetaPromptRef.current || metaPromptPreview}
          </pre>
        </details>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        {[
          { id: 'simulate', label: 'AI vs AI Simulation', icon: Zap },
          { id: 'practice', label: 'Human Practice', icon: MessageSquare },
          { id: 'personas', label: 'Customer Personas', icon: Users },
          { id: 'results', label: 'Results & Analytics', icon: BarChart3 }
        ].map(tab => {
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

      {/* Customer Personas Tab */}
      {activeTab === 'personas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(customerPersonas).map(([key, persona]) => (
            <div key={key} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{persona.role}</h3>
                  <p className="text-sm text-blue-600 font-medium">{persona.subIndustry}</p>
                  <p className="text-sm text-gray-600">{persona.company}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Personality</h4>
                  <p className="text-sm text-gray-600">{persona.personality}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Initial Stance</h4>
                  <p className="text-sm text-gray-600 italic">"{persona.initialStance}"</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 text-sm">Top Pain Points</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {persona.painPoints.slice(0, 2).map((pain, idx) => (
                      <li key={idx}>• {pain}</li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => {
                    setSelectedPersona(key);
                    setActiveTab('practice');
                    resetConversation();
                  }}
                  className="w-full mt-4 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Practice with this customer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simulation and other tabs would go here... */}
    </div>
  );
};

export default SalesTrainingSystem;
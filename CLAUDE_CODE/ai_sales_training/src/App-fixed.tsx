import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, BarChart3, Users, MessageSquare, Zap, Package } from 'lucide-react';
import { personaLoader } from './utils/personaLoader';
import ProductConfigManager from './components/ProductConfigManager';

// Load default product config
const defaultProductConfig = {
  "productName": "ProductivityPro Security Suite",
  "company": "ProductivityPro Inc.",
  "description": "Comprehensive productivity and security platform designed specifically for professional services firms",
  "valueProposition": "Reduce administrative overhead by 40% while maintaining enterprise-grade security and compliance"
};

const LLM_OPTIONS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' }
];

const SALES_PITCHES = {
  industryPainPoint: "Hi [Name], I'm calling because I've been working with other [subIndustry] who are struggling with [specific pain point]. I wanted to see if this is something you're dealing with as well.",
  valueProposition: "Hi [Name], I'm calling from [Company]. We help [subIndustry] like yours [specific value]. Do you have 30 seconds for me to explain why this might be relevant?"
};

const SalesTrainingSystem = () => {
  const [activeTab, setActiveTab] = useState('simulate');
  const [customerPersonas, setCustomerPersonas] = useState({});
  const [productConfig, setProductConfig] = useState(defaultProductConfig);
  const [selectedPersona, setSelectedPersona] = useState('law-managing-partner');
  const [selectedPitch, setSelectedPitch] = useState('industryPainPoint');
  const [selectedLLM, setSelectedLLM] = useState('anthropic/claude-3.5-sonnet');
  const [apiKey, setApiKey] = useState('');
  const [personasLoaded, setPersonasLoaded] = useState(false);

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const personas = await personaLoader.loadAllPersonas();
        setCustomerPersonas(personas);
        setPersonasLoaded(true);
      } catch (error) {
        console.error('Failed to load personas:', error);
        setPersonasLoaded(true); // Continue even if personas fail to load
      }
    };
    loadPersonas();
  }, []);

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
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        {[
          { id: 'product', label: 'Product Configuration', icon: Package },
          { id: 'personas', label: 'Customer Personas', icon: Users }
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

      {/* Product Configuration Tab */}
      {activeTab === 'product' && (
        <ProductConfigManager 
          productConfig={productConfig}
          onProductConfigChange={setProductConfig}
        />
      )}

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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesTrainingSystem;
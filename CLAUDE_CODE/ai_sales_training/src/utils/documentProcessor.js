// Document processor for extracting product information from uploaded files
export class DocumentProcessor {
  constructor() {
    this.supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint', // .ppt
      'text/plain', // .txt
      'text/markdown' // .md
    ];
  }

  // Check if file type is supported
  isSupported(file) {
    return this.supportedTypes.includes(file.type);
  }

  // Extract text content from uploaded file
  async extractContent(file) {
    try {
      const fileContent = await this.readFileAsArrayBuffer(file);
      
      switch (file.type) {
        case 'application/pdf':
          return await this.extractFromPDF(fileContent);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDocx(fileContent);
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          return await this.extractFromPptx(fileContent);
        case 'text/plain':
        case 'text/markdown':
          return await this.extractFromText(fileContent);
        default:
          throw new Error(`Unsupported file type: ${file.type}`);
      }
    } catch (error) {
      console.error('Error extracting content:', error);
      throw new Error(`Failed to extract content from ${file.name}: ${error.message}`);
    }
  }

  // Read file as array buffer
  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Extract text from PDF (would need pdf-parse or similar library in real implementation)
  async extractFromPDF(arrayBuffer) {
    // For demo purposes - in real implementation you'd use pdf-parse or PDF.js
    // This is a placeholder that would need a proper PDF parsing library
    return "PDF content extraction would require pdf-parse library. Please provide text summary of PDF content.";
  }

  // Extract text from DOCX files
  async extractFromDocx(arrayBuffer) {
    try {
      // For demo purposes - in real implementation you'd use mammoth.js or docx library
      // This would extract the actual text content from the DOCX file
      return "DOCX content extraction would require mammoth.js library. Please provide text summary of document content.";
    } catch (error) {
      throw new Error('Failed to extract DOCX content');
    }
  }

  // Extract text from PPTX files
  async extractFromPptx(arrayBuffer) {
    // For demo purposes - in real implementation you'd use a PPTX parsing library
    return "PPTX content extraction would require specialized library. Please provide text summary of presentation content.";
  }

  // Extract text from plain text files
  async extractFromText(arrayBuffer) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(arrayBuffer);
  }

  // Analyze extracted content and structure it for sales use
  analyzeProductContent(content, urls = []) {
    const analysis = {
      keyFeatures: this.extractFeatures(content),
      valuePropositions: this.extractValueProps(content),
      benefits: this.extractBenefits(content),
      pricing: this.extractPricing(content),
      competitors: this.extractCompetitors(content),
      targetMarkets: this.extractTargetMarkets(content),
      objectionHandlers: this.generateObjectionHandlers(content),
      urls: urls
    };

    return analysis;
  }

  // Extract key features from content
  extractFeatures(content) {
    const features = [];
    const featureKeywords = ['feature', 'capability', 'function', 'tool', 'module'];
    
    // Simple keyword-based extraction (in real implementation, use NLP)
    const sentences = content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (featureKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        features.push(sentence.trim());
      }
    });
    
    return features.slice(0, 10); // Limit to top 10
  }

  // Extract value propositions
  extractValueProps(content) {
    const valueProps = [];
    const valueKeywords = ['save', 'reduce', 'increase', 'improve', 'optimize', 'streamline'];
    
    const sentences = content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (valueKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        valueProps.push(sentence.trim());
      }
    });
    
    return valueProps.slice(0, 5);
  }

  // Extract benefits
  extractBenefits(content) {
    const benefits = [];
    const benefitKeywords = ['benefit', 'advantage', 'roi', 'return', 'efficiency', 'productivity'];
    
    const sentences = content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (benefitKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        benefits.push(sentence.trim());
      }
    });
    
    return benefits.slice(0, 8);
  }

  // Extract pricing information
  extractPricing(content) {
    const pricingInfo = [];
    const priceRegex = /\$[\d,]+(?:\.\d{2})?|\d+(?:\.\d{2})?\s*(?:per|\/)\s*(?:month|user|license)/gi;
    
    const matches = content.match(priceRegex);
    if (matches) {
      pricingInfo.push(...matches);
    }
    
    return pricingInfo;
  }

  // Extract competitor mentions
  extractCompetitors(content) {
    const competitors = [];
    const competitorKeywords = ['competitor', 'alternative', 'vs', 'compared to', 'versus'];
    
    const sentences = content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (competitorKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        competitors.push(sentence.trim());
      }
    });
    
    return competitors;
  }

  // Extract target markets
  extractTargetMarkets(content) {
    const markets = [];
    const marketKeywords = ['industry', 'sector', 'market', 'customer', 'client'];
    
    const sentences = content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (marketKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        markets.push(sentence.trim());
      }
    });
    
    return markets;
  }

  // Generate objection handlers based on content
  generateObjectionHandlers(content) {
    const handlers = {};
    
    // Standard objection categories with content-based responses
    if (content.toLowerCase().includes('price') || content.toLowerCase().includes('cost')) {
      handlers.price = "Based on our documentation, the ROI typically justifies the investment within the first quarter.";
    }
    
    if (content.toLowerCase().includes('security') || content.toLowerCase().includes('compliance')) {
      handlers.security = "Our security features are detailed in our documentation and meet enterprise-grade standards.";
    }
    
    if (content.toLowerCase().includes('integration') || content.toLowerCase().includes('api')) {
      handlers.integration = "As outlined in our materials, we offer comprehensive integration capabilities.";
    }
    
    return handlers;
  }

  // Fetch and analyze content from URLs
  async fetchUrlContent(url) {
    try {
      // Note: This would need to be implemented with a CORS proxy or backend service
      // as direct fetch to external URLs is often blocked by CORS
      const response = await fetch(url);
      const html = await response.text();
      
      // Extract text content from HTML (basic implementation)
      const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      return textContent;
    } catch (error) {
      console.error(`Failed to fetch content from ${url}:`, error);
      return `Unable to fetch content from ${url}. Please provide manual summary.`;
    }
  }
}

export const documentProcessor = new DocumentProcessor();
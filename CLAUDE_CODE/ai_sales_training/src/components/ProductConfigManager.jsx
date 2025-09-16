import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Link, Save, Plus, Trash2 } from 'lucide-react';
import { documentProcessor } from '../utils/documentProcessor';

const ProductConfigManager = ({ productConfig, onProductConfigChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [productUrls, setProductUrls] = useState(productConfig?.urls || []);
  const [newUrl, setNewUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setIsProcessing(true);
    setProcessingStatus('Processing uploaded files...');

    for (const file of files) {
      try {
        if (!documentProcessor.isSupported(file)) {
          alert(`File type not supported: ${file.name}`);
          continue;
        }

        setProcessingStatus(`Extracting content from ${file.name}...`);
        const extractedContent = await documentProcessor.extractContent(file);
        
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          content: extractedContent,
          uploadDate: new Date()
        };

        setUploadedFiles(prev => [...prev, fileData]);
        setProcessingStatus(`Processed ${file.name} successfully`);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        alert(`Failed to process ${file.name}: ${error.message}`);
      }
    }

    setIsProcessing(false);
    setProcessingStatus('');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add URL
  const addUrl = () => {
    if (newUrl.trim() && !productUrls.includes(newUrl.trim())) {
      setProductUrls([...productUrls, newUrl.trim()]);
      setNewUrl('');
    }
  };

  // Remove URL
  const removeUrl = (urlToRemove) => {
    setProductUrls(productUrls.filter(url => url !== urlToRemove));
  };

  // Remove uploaded file
  const removeFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  // Process all content and generate product configuration
  const generateProductConfig = async () => {
    setIsProcessing(true);
    setProcessingStatus('Analyzing uploaded content...');

    try {
      const allContent = uploadedFiles.map(file => file.content).join('\n\n');
      
      let urlContent = '';
      for (const url of productUrls) {
        try {
          setProcessingStatus(`Fetching content from ${url}...`);
          const content = await documentProcessor.fetchUrlContent(url);
          urlContent += content + '\n\n';
        } catch (error) {
          console.error(`Failed to fetch ${url}:`, error);
        }
      }

      const combinedContent = allContent + '\n\n' + urlContent;
      
      setProcessingStatus('Generating product configuration...');
      const analysis = documentProcessor.analyzeProductContent(combinedContent, productUrls);

      const enhancedConfig = {
        ...productConfig,
        ...analysis,
        lastUpdated: new Date(),
        sources: {
          files: uploadedFiles.map(f => ({ name: f.name, type: f.type })),
          urls: productUrls
        },
        rawContent: combinedContent
      };

      onProductConfigChange(enhancedConfig);
      setProcessingStatus('Product configuration updated successfully!');
      
      setTimeout(() => setProcessingStatus(''), 3000);
    } catch (error) {
      console.error('Error generating product config:', error);
      setProcessingStatus('Error generating configuration');
    }

    setIsProcessing(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Product/Service Configuration</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isEditing ? 'View Mode' : 'Edit Configuration'}
        </button>
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Current Product</h4>
            <p className="text-lg font-semibold">{productConfig?.productName || 'No product configured'}</p>
            <p className="text-gray-600">{productConfig?.description || 'No description available'}</p>
          </div>

          {productConfig?.keyFeatures && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Key Features</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {productConfig.keyFeatures.slice(0, 3).map((feature, idx) => (
                  <li key={idx}>{typeof feature === 'string' ? feature : feature.name}</li>
                ))}
              </ul>
            </div>
          )}

          {productConfig?.valueProposition && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Value Proposition</h4>
              <p className="text-sm text-gray-600">{productConfig.valueProposition}</p>
            </div>
          )}

          {productConfig?.sources && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Content Sources</h4>
              <div className="text-xs text-gray-500">
                {productConfig.sources.files?.length > 0 && (
                  <p>Files: {productConfig.sources.files.map(f => f.name).join(', ')}</p>
                )}
                {productConfig.sources.urls?.length > 0 && (
                  <p>URLs: {productConfig.sources.urls.length} source(s)</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Upload Product Documents
            </h4>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Click to upload product documents</p>
              <p className="text-xs text-gray-500 mt-1">
                Supports: PDF, DOC, DOCX, PPT, PPTX, TXT, MD
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-700 mb-2">Uploaded Files</h5>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
              <Link className="w-4 h-4 mr-2" />
              Product Website URLs
            </h4>
            
            <div className="flex space-x-2">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/product-page"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addUrl()}
              />
              <button
                onClick={addUrl}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {productUrls.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-700 mb-2">Added URLs</h5>
                <div className="space-y-2">
                  {productUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div className="flex items-center">
                        <Link className="w-4 h-4 text-green-500 mr-2" />
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate"
                        >
                          {url}
                        </a>
                      </div>
                      <button
                        onClick={() => removeUrl(url)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <button
              onClick={generateProductConfig}
              disabled={isProcessing || (uploadedFiles.length === 0 && productUrls.length === 0)}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Generate Product Configuration'}
            </button>
            
            {processingStatus && (
              <p className="mt-2 text-sm text-gray-600 text-center">{processingStatus}</p>
            )}
            
            <p className="mt-2 text-xs text-gray-500 text-center">
              This will analyze your documents and URLs to create a comprehensive product configuration for sales training
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductConfigManager;
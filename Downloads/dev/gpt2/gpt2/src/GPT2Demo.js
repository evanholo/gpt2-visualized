import React, { useState, useEffect } from 'react';

const ImprovedGPT2Demo = () => {
  // Expanded vocabulary for more interesting generations
  const vocabulary = [
    "the", "a", "an", "in", "on", "at", "to", "and", "or", "but", "for", "with", "by", "from", "about",
    "I", "you", "he", "she", "it", "we", "they", "this", "that", "these", "those", 
    "is", "are", "was", "were", "be", "being", "been", "can", "could", "will", "would", "should", "may", "might",
    "language", "model", "AI", "machine", "learning", "neural", "network", "deep", "computer", "data", "algorithm",
    "transformer", "attention", "weights", "layers", "tokens", "embeddings", "parameters", "matrix", "vector", "tensor",
    "generate", "text", "predict", "prediction", "probability", "output", "input", "process", "analyze", "compute",
    "word", "sentence", "context", "meaning", "understanding", "knowledge", "information", "pattern", "sequence", "representation",
    "training", "fine-tuning", "pre-training", "dataset", "corpus", "billion", "million", "large", "small", "complex",
    "using", "processing", "analyzing", "predicting", "calculating", "computing", "focusing", "attending", "looking", "examining",
    "each", "every", "some", "many", "few", "first", "last", "next", "previous", "current",
    "based", "structured", "designed", "created", "built", "developed", "implemented", "trained", "optimized", "configured"
  ];

  // Example special domain tokens to show coherent domain-specific outputs
  const domainTokens = {
    "technical": ["algorithm", "compute", "vector", "tensor", "parameters", "process", "representation", "implementation"],
    "descriptive": ["analyze", "understand", "examine", "process", "structure", "design", "identify", "represent"],
    "mathematical": ["calculate", "compute", "matrix", "vector", "tensor", "probability", "parameter", "optimize"]
  };

  // State for prompt
  const [prompt, setPrompt] = useState("The transformer model works by");
  
  // State for generated text
  const [generatedText, setGeneratedText] = useState([]);
  
  // State for token probabilities (to visualize)
  const [tokenProbabilities, setTokenProbabilities] = useState([]);
  
  // State for attention visualization
  const [attentionMatrix, setAttentionMatrix] = useState([]);
  
  // State for attention weights (with more dramatic effects)
  const [selfAttentionWeight, setSelfAttentionWeight] = useState(0.7);
  const [previousTokenWeight, setPreviousTokenWeight] = useState(0.5);
  const [contextWeight, setContextWeight] = useState(0.3);
  
  // State for domain bias (to make outputs more coherent in a theme)
  const [domainBias, setDomainBias] = useState("none");
  
  // State for temperature
  const [temperature, setTemperature] = useState(0.7);
  
  // State for whether to show visualizations
  const [showAttention, setShowAttention] = useState(true);
  const [showProbabilities, setShowProbabilities] = useState(true);
  
  // State for generation control
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState(300); // ms
  const [maxTokens, setMaxTokens] = useState(10);
  
  // Split the prompt into tokens (simplified)
  const tokenizeText = (text) => {
    return text.toLowerCase().split(/\s+/).filter(token => token.length > 0);
  };
  
  // Initialize the attention matrix when the prompt changes
  useEffect(() => {
    const tokens = tokenizeText(prompt);
    const newMatrix = [];
    
    // Create an empty attention matrix
    for (let i = 0; i < tokens.length; i++) {
      const row = [];
      for (let j = 0; j < tokens.length; j++) {
        // Default attention weights
        let weight = 0.1; // Base attention
        
        if (i === j) {
          // Self-attention - how much a token focuses on itself
          weight = selfAttentionWeight;
        } else if (j === i - 1) {
          // Previous token attention
          weight = previousTokenWeight;
        } else {
          // Other context tokens - inverse distance relationship
          weight = contextWeight / Math.max(1, Math.abs(i - j));
        }
        
        row.push(weight);
      }
      
      // Normalize the row
      const sum = row.reduce((acc, val) => acc + val, 0);
      newMatrix.push(row.map(val => val / sum));
    }
    
    setAttentionMatrix(newMatrix);
  }, [prompt, selfAttentionWeight, previousTokenWeight, contextWeight]);
  
  // Generate text based on the prompt and weights
  const generateText = () => {
    setGeneratedText([]);
    setTokenProbabilities([]);
    setGenerationStep(0);
    setIsGenerating(true);
  };
  
  // Stop generation
  const stopGeneration = () => {
    setIsGenerating(false);
  };
  
  // Perform token-by-token generation
  useEffect(() => {
    if (!isGenerating) return;
    
    // Get prompt tokens
    const promptTokens = tokenizeText(prompt);
    
    if (generationStep >= maxTokens) {
      // Stop after generating maximum tokens
      setIsGenerating(false);
      return;
    }
    
    // Generate the next token with improved weighting
    const generateNextToken = () => {
      const currentContext = [...promptTokens, ...generatedText];
      
      if (currentContext.length === 0) return { token: vocabulary[0], probs: [] };
      
      // Apply a more dramatic effect of weights on token probabilities
      const tokenProbs = vocabulary.map(token => {
        // Start with a much lower base probability so weight effects are more dramatic
        let prob = 0.001;
        
        // Boost for tokens in the context with amplified attention effects
        currentContext.forEach((contextToken, idx) => {
          if (idx >= currentContext.length - 3) { // Focus on recent context
            if (contextToken === token) {
              // Apply amplified attention weights
              const contextPos = Math.min(idx, attentionMatrix.length - 1);
              // Quadratic scaling for more dramatic effect
              const weightBoost = Math.pow(attentionMatrix[Math.min(contextPos, attentionMatrix.length - 1)][Math.min(contextPos, attentionMatrix.length - 1)], 2) * 3.0;
              prob += weightBoost;
            }
          }
        });
        
        // More significant boost for token pairs - bigram effects
        for (let i = 1; i < currentContext.length; i++) {
          // Get previous token and current token
          const prevToken = currentContext[i-1];
          const currToken = currentContext[i];
          
          // If this pattern appears in our context and the proposed token follows it elsewhere
          if (prevToken === currentContext[currentContext.length - 1] && currToken === token) {
            // This creates a stronger n-gram effect
            prob += previousTokenWeight * 2;
          }
        }
        
        // Domain bias - if token is in the selected domain, give it a boost
        if (domainBias !== "none" && domainTokens[domainBias]?.includes(token)) {
          prob += 0.3; // Significant boost for domain-specific tokens
        }
        
        // Apply temperature - more dramatic effect
        // Lower temperature = more deterministic (higher contrast between probabilities)
        // Higher temperature = more random (more even probabilities)
        return Math.pow(prob, 1 / Math.max(0.1, temperature));
      });
      
      // Normalize probabilities
      const totalProb = tokenProbs.reduce((sum, prob) => sum + prob, 0);
      const normalizedProbs = tokenProbs.map(prob => prob / totalProb);
      
      // Get top tokens for visualization
      const topTokens = vocabulary
        .map((token, idx) => ({ token, probability: normalizedProbs[idx] }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);
      
      // Sample from the distribution
      const rand = Math.random();
      let cumulativeProb = 0;
      let selectedToken = vocabulary[0];
      
      for (let i = 0; i < normalizedProbs.length; i++) {
        cumulativeProb += normalizedProbs[i];
        if (rand < cumulativeProb) {
          selectedToken = vocabulary[i];
          break;
        }
      }
      
      return { token: selectedToken, probs: topTokens };
    };
    
    // Update generated text with delay for visual effect
    const timer = setTimeout(() => {
      const result = generateNextToken();
      setGeneratedText(prev => [...prev, result.token]);
      setTokenProbabilities(prev => [...prev, result.probs]);
      setGenerationStep(prev => prev + 1);
    }, generationSpeed);
    
    return () => clearTimeout(timer);
  }, [
    isGenerating, 
    generationStep, 
    prompt, 
    generatedText, 
    attentionMatrix, 
    temperature, 
    vocabulary, 
    selfAttentionWeight, 
    previousTokenWeight, 
    contextWeight,
    domainBias,
    maxTokens,
    generationSpeed
  ]);
  
  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Interactive GPT-2 Demo</h2>
      
      {/* Prompt input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Prompt:</label>
        <div className="flex">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            rows={2}
            placeholder="Enter a prompt here..."
          />
          <button
            onClick={() => setPrompt("The transformer model works by")}
            className="ml-2 px-3 bg-gray-200 hover:bg-gray-300 rounded"
            title="Reset to default prompt"
          >
            ↺
          </button>
        </div>
      </div>
      
      {/* Control panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2 text-lg border-b pb-2">Attention Weights</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Self-Attention Weight:</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selfAttentionWeight}
                  onChange={(e) => setSelfAttentionWeight(parseFloat(e.target.value))}
                  className="w-full mr-2"
                />
                <span className="w-12 text-center bg-blue-50 px-2 py-1 rounded">{selfAttentionWeight.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">How much a token focuses on itself</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Previous Token Weight:</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={previousTokenWeight}
                  onChange={(e) => setPreviousTokenWeight(parseFloat(e.target.value))}
                  className="w-full mr-2"
                />
                <span className="w-12 text-center bg-blue-50 px-2 py-1 rounded">{previousTokenWeight.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">How much a token focuses on the previous token</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Context Weight:</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={contextWeight}
                  onChange={(e) => setContextWeight(parseFloat(e.target.value))}
                  className="w-full mr-2"
                />
                <span className="w-12 text-center bg-blue-50 px-2 py-1 rounded">{contextWeight.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500">How much a token focuses on distant context</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2 text-lg border-b pb-2">Generation Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Temperature:</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full mr-2"
                />
                <span className="w-12 text-center bg-blue-50 px-2 py-1 rounded">{temperature.toFixed(1)}</span>
              </div>
              <p className="text-xs text-gray-500">Low: deterministic, High: random</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Domain Bias:</label>
              <select
                value={domainBias}
                onChange={(e) => setDomainBias(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="none">None</option>
                <option value="technical">Technical</option>
                <option value="descriptive">Descriptive</option>
                <option value="mathematical">Mathematical</option>
              </select>
              <p className="text-xs text-gray-500">Biases generation toward specific domains</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Generation Speed:</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={generationSpeed}
                  onChange={(e) => setGenerationSpeed(parseInt(e.target.value))}
                  className="w-full mr-2"
                />
                <span className="w-12 text-center bg-blue-50 px-2 py-1 rounded">{generationSpeed}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Generation controls */}
      <div className="mb-6 flex space-x-4 items-center">
        <button
          onClick={isGenerating ? stopGeneration : generateText}
          className={`px-6 py-2 rounded font-medium shadow-sm ${
            isGenerating 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isGenerating ? "Stop Generation" : "Generate Text"}
        </button>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showAttention}
              onChange={(e) => setShowAttention(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show Attention</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showProbabilities}
              onChange={(e) => setShowProbabilities(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show Token Probabilities</span>
          </label>
        </div>
      </div>
      
      {/* Text output */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Generated Text:</h3>
        <div className="p-4 bg-white border border-gray-300 rounded shadow-inner min-h-20">
          <span className="text-gray-800">{prompt}</span>
          {generatedText.length > 0 && <span> </span>}
          <span className="text-green-600 font-medium">
            {generatedText.join(" ")}
          </span>
          {isGenerating && <span className="animate-pulse">▍</span>}
        </div>
      </div>
      
      {/* Token probability visualization */}
      {showProbabilities && tokenProbabilities.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Token Probabilities:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Position</th>
                  <th className="px-4 py-2 text-left">Selected Token</th>
                  <th className="px-4 py-2 text-left">Top 5 Candidates</th>
                </tr>
              </thead>
              <tbody>
                {tokenProbabilities.map((probs, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2 text-sm">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm font-medium">{generatedText[idx]}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        {probs.map((item, i) => (
                          <div 
                            key={i} 
                            className={`text-xs px-2 py-1 rounded ${
                              item.token === generatedText[idx]
                                ? "bg-green-100 border border-green-300"
                                : "bg-gray-100 border border-gray-200"
                            }`}
                            title={`Probability: ${(item.probability * 100).toFixed(2)}%`}
                          >
                            {item.token} <span className="text-gray-500">{(item.probability * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Attention visualization */}
      {showAttention && attentionMatrix.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Attention Matrix:</h3>
          <div className="overflow-x-auto bg-white border border-gray-300 rounded p-3">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-gray-500 font-medium text-sm">Token ↓ attends to →</th>
                  {tokenizeText(prompt).map((token, idx) => (
                    <th key={idx} className="px-2 py-1 text-xs font-medium">
                      {token}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokenizeText(prompt).map((token, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="px-2 py-1 text-xs font-medium">{token}</td>
                    {attentionMatrix[rowIdx]?.map((weight, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-2 py-1 text-center text-xs"
                        style={{
                          backgroundColor: `rgba(59, 130, 246, ${weight * 1.3})`,
                          color: weight > 0.4 ? 'white' : 'black'
                        }}
                      >
                        {weight.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            The table shows how much attention each token (rows) pays to other tokens (columns).
            Darker blue indicates higher attention.
          </p>
        </div>
      )}
      
      {/* Explanation */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
        <h3 className="font-bold mb-2 text-blue-800">How This Demo Works:</h3>
        <p className="mb-3">
          This interactive demo simulates a simplified version of GPT-2's attention mechanism. You can experiment 
          with different settings to see how they affect text generation:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="font-semibold">Attention Weights:</p>
            <ul className="list-disc ml-5 space-y-1 text-gray-700">
              <li><strong>Self-Attention:</strong> When high, tokens focus more on themselves (repetitive text)</li>
              <li><strong>Previous Token:</strong> When high, each token is heavily influenced by the one before it (more coherent sequences)</li>
              <li><strong>Context:</strong> When high, tokens consider broader context (more thematically consistent)</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold">Other Controls:</p>
            <ul className="list-disc ml-5 space-y-1 text-gray-700">
              <li><strong>Temperature:</strong> Low values create predictable outputs; high values create more creative/random outputs</li>
              <li><strong>Domain Bias:</strong> Biases the generation toward specific terminology</li>
              <li><strong>Generation Speed:</strong> Controls how fast tokens are generated</li>
            </ul>
          </div>
        </div>
        
        <p className="mt-3">
          In a real GPT-2 model, there are 12+ layers, each with multiple attention heads (768+ million parameters). 
          This demo illustrates the core concepts in a simplified, interactive form.
        </p>
      </div>
    </div>
  );
};

export default ImprovedGPT2Demo;
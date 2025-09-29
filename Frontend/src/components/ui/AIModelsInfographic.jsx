import React from 'react';
import './AIModelsInfographic.css';

const AIModelsInfographic = () => {
  const aiModels = [
    {
      id: 'chatgpt',
      name: 'ChatGPT 5',
      role: 'All Rounder Explainer',
      description: 'Great for questions, brainstorming, and clear step-by-step explanations.',
      icon: 'https://img.icons8.com/ios-filled/50/chatgpt.png',
      position: 'left',
      order: 1
    },
    {
      id: 'claude',
      name: 'Claude Sonnet 4',
      role: 'Co-Writing Master',
      description: 'Refines polished emails, essays, and scripts while keeping your style.',
      icon: 'https://img.icons8.com/ios-filled/50/claude-ai.png',
      position: 'left',
      order: 2
    },
    {
      id: 'gemini',
      name: 'Gemini 2.5 Pro',
      role: 'Long Context Master',
      description: 'Handles long documents and images, tracking full context and details.',
      icon: 'https://img.icons8.com/ios-filled/50/gemini-ai.png',
      position: 'right',
      order: 1
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      role: 'Reasoning Specialist',
      description: 'Excels at logic, math, and coding with clear, detailed solutions.',
      icon: 'https://img.icons8.com/ios-filled/50/deepseek.png',
      position: 'right',
      order: 2
    }
  ];

  return (
    <div className="ai-models-infographic">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold text-white mb-3">
            Pick the best characteristics of each AI model
          </h2>
        </div>

        <div className="ai-models-container">
          {/* Central Glowing Element */}
          <div className="central-element">
            <div className="central-icon">
              <img 
                src="https://img.icons8.com/ios-filled/100/ffffff/sparkling.png" 
                alt="Sparkling" 
                width="60"
                height="60"
                style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))' }}
              />
            </div>
          </div>

          {/* Left Column */}
          <div className="models-column left-column">
            {aiModels
              .filter(model => model.position === 'left')
              .sort((a, b) => a.order - b.order)
              .map((model) => (
                <div key={model.id} className="ai-model-card">
                  <div className="model-icon">
                    <img 
                      src={model.icon} 
                      alt={model.name}
                      width="24"
                      height="24"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))' }}
                    />
                  </div>
                  <div className="model-content">
                    <div className="model-name">{model.name}</div>
                    <div className="model-role">{model.role}</div>
                    <div className="model-description">{model.description}</div>
                  </div>
                  <div className="connection-line left-line"></div>
                </div>
              ))}
          </div>

          {/* Right Column */}
          <div className="models-column right-column">
            {aiModels
              .filter(model => model.position === 'right')
              .sort((a, b) => a.order - b.order)
              .map((model) => (
                <div key={model.id} className="ai-model-card">
                  <div className="model-icon">
                    <img 
                      src={model.icon} 
                      alt={model.name}
                      width="24"
                      height="24"
                      style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))' }}
                    />
                  </div>
                  <div className="model-content">
                    <div className="model-name">{model.name}</div>
                    <div className="model-role">{model.role}</div>
                    <div className="model-description">{model.description}</div>
                  </div>
                  <div className="connection-line right-line"></div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelsInfographic;

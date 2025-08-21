import React, { useState } from 'react';
import { Search, Plus, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
  tags: string[];
}

const promptTemplates: PromptTemplate[] = [
  {
    id: '1',
    title: 'Code Review Assistant',
    description: 'Analyze code for bugs, performance issues, and best practices',
    category: 'coding',
    template: 'Please review the following code and provide feedback on:\n1. Potential bugs or errors\n2. Performance optimizations\n3. Code style and best practices\n4. Security considerations\n\nCode:\n```\n[PASTE_CODE_HERE]\n```',
    tags: ['code-review', 'debugging', 'optimization']
  },
  {
    id: '2',
    title: 'Blog Post Writer',
    description: 'Create engaging blog posts with SEO optimization',
    category: 'writing',
    template: 'Write a comprehensive blog post about [TOPIC]. Include:\n- Engaging headline\n- Introduction hook\n- 3-5 main sections with subheadings\n- Practical examples or tips\n- Strong conclusion with call-to-action\n- SEO-friendly meta description\n\nTarget audience: [AUDIENCE]\nTone: [TONE]\nWord count: [WORD_COUNT]',
    tags: ['blog', 'seo', 'content-marketing']
  },
  {
    id: '3',
    title: 'Marketing Campaign Planner',
    description: 'Develop comprehensive marketing strategies',
    category: 'marketing',
    template: 'Create a marketing campaign plan for [PRODUCT/SERVICE]:\n\n1. Target Audience Analysis\n2. Key Messaging & Value Proposition\n3. Channel Strategy (social, email, paid ads, etc.)\n4. Content Calendar (4 weeks)\n5. Budget Allocation\n6. Success Metrics & KPIs\n7. Timeline & Milestones\n\nBudget: [BUDGET]\nDuration: [DURATION]\nGoals: [GOALS]',
    tags: ['marketing', 'strategy', 'campaigns']
  },
  {
    id: '4',
    title: 'UI/UX Design Critique',
    description: 'Analyze and improve user interface designs',
    category: 'design',
    template: 'Analyze this UI/UX design and provide detailed feedback:\n\n[DESIGN_DESCRIPTION_OR_IMAGE]\n\nPlease evaluate:\n1. Visual hierarchy and layout\n2. User experience flow\n3. Accessibility considerations\n4. Mobile responsiveness\n5. Brand consistency\n6. Usability improvements\n7. Modern design trends alignment\n\nProvide specific, actionable recommendations.',
    tags: ['ui', 'ux', 'design-review']
  },
  {
    id: '5',
    title: 'Data Analysis Helper',
    description: 'Interpret data and create insights',
    category: 'analysis',
    template: 'Analyze the following data and provide insights:\n\nData: [PASTE_DATA_HERE]\n\nPlease provide:\n1. Key trends and patterns\n2. Statistical summary\n3. Anomalies or outliers\n4. Business implications\n5. Recommendations for action\n6. Visualization suggestions\n\nContext: [BUSINESS_CONTEXT]',
    tags: ['data', 'analytics', 'insights']
  },
  {
    id: '6',
    title: 'Email Template Creator',
    description: 'Craft professional email templates',
    category: 'writing',
    template: 'Create a professional email template for [PURPOSE]:\n\nRecipient: [RECIPIENT_TYPE]\nTone: [PROFESSIONAL/FRIENDLY/FORMAL]\nGoal: [EMAIL_GOAL]\n\nInclude:\n- Compelling subject line\n- Personalized greeting\n- Clear value proposition\n- Call-to-action\n- Professional signature\n\nAdditional context: [CONTEXT]',
    tags: ['email', 'templates', 'communication']
  }
];

const categories = ['all', 'coding', 'writing', 'marketing', 'design', 'analysis'];

interface PromptLabProps {
  onInsertPrompt?: (prompt: string) => void;
}

export function PromptLab({ onInsertPrompt }: PromptLabProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = promptTemplates.filter(prompt => {
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleCopyPrompt = async (prompt: PromptTemplate) => {
    await navigator.clipboard.writeText(prompt.template);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertPrompt = (prompt: PromptTemplate) => {
    if (onInsertPrompt) {
      onInsertPrompt(prompt.template);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Prompt Lab
          </h2>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrompts.map(prompt => (
            <div
              key={prompt.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {prompt.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {prompt.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-3">
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-hidden">
                  {prompt.template.length > 200 
                    ? prompt.template.substring(0, 200) + '...'
                    : prompt.template
                  }
                </pre>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPrompt(prompt)}
                  className="flex-1"
                >
                  {copiedId === prompt.id ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleInsertPrompt(prompt)}
                  className="flex-1"
                >
                  Insert
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No prompts found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
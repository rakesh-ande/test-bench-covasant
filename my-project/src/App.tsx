// import React, { useState, useEffect } from 'react';
// import { 
//   Play, 
//   Settings, 
//   Database, 
//   Activity, 
//   Shield, 
//   Code, 
//   Lock, 
//   CheckCircle, 
//   Brain, 
//   AlertTriangle,
//   BarChart3,
//   Plus,
//   RefreshCw,
//   CheckCircle2,
//   Pencil,
//   ChevronLeft,
//   ChevronRight
// } from 'lucide-react';

// // Define TypeScript interfaces
// interface Agent {
//   id: string;
//   name: string;
//   type: string;
//   description: string;
//   role?: string;
//   backstory?: string;
//   system_prompt?: string;
//   endpoint?: string;
//   is_custom?: boolean;
// }

// interface TestCategory {
//   name: string;
//   description: string;
// }

// interface Model {
//   id: string;
//   name: string;
// }

// interface TestResults {
//   test_id: string;
//   status: 'running' | 'completed' | 'failed';
//   progress?: number;
//   agent_name?: string;
//   start_time?: string;
//   summary?: {
//     overall_performance?: {
//       average_score?: number;
//       average_response_time?: number;
//       average_cpu_usage?: number;
//       average_memory_usage?: number;
//     };
//     category_analysis?: Record<string, {
//       avg_score: number;
//       test_count: number;
//       avg_response_time: number;
//     }>;
//     recommendations?: string[];
//     strengths?: string[];
//     weaknesses?: string[];
//   };
//   results?: Array<{
//     category: string;
//     round: number;
//     prompt: string;
//     response: string;
//     response_time: number;
//     evaluation_score: number;
//     evaluation_feedback?: string;
//   }>;
// }

// const API_BASE = 'http://localhost:8000';

// const App: React.FC = () => {
//   const [currentTab, setCurrentTab] = useState<'agents' | 'configure' | 'results'>('agents');
//   const [agents, setAgents] = useState<Agent[]>([]);
//   const [tenant, setTenant] = useState<string>('aifabric');
//   const [bearerToken, setBearerToken] = useState<string>('');
//   const [pageNumber, setPageNumber] = useState<number>(1);
//   const [pageSize, setPageSize] = useState<number>(10);
//   const [loadingAgents, setLoadingAgents] = useState<boolean>(false);
//   // Registry is now required; no built-in list
//   const [testCategories, setTestCategories] = useState<Record<string, TestCategory>>({});
//   const [models, setModels] = useState<Model[]>([]);
//   const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
//   const [selectedModel, setSelectedModel] = useState<string>('gemini-pro');
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   const [testRounds, setTestRounds] = useState<number>(4);
//   const [agentDetails, setAgentDetails] = useState({
//     role: '',
//     backstory: '',
//     system_prompt: ''
//   });
//   const [testResults, setTestResults] = useState<Record<string, TestResults>>({});
//   const [activeTest, setActiveTest] = useState<string | null>(null);
//   const [customAgent, setCustomAgent] = useState({
//     id: '',
//     name: '',
//     type: '',
//     description: '',
//     role: '',
//     backstory: '',
//     system_prompt: '',
//     endpoint: ''
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     try {
//       setLoading(true);
//       await Promise.all([
//         fetchAgents(),
//         fetchTestCategories(),
//         fetchModels()
//       ]);
//     } catch (error) {
//       console.error('Error fetching initial data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAgents = async () => {
//     try {
//       setLoadingAgents(true);
//       console.log('fetchAgents called with:', { bearerToken: bearerToken ? 'present' : 'missing', tenant });
//       if (!bearerToken || !tenant) {
//         alert('Provide tenant and bearer token to load agents from registry.');
//         return;
//       }
//       const headers: HeadersInit = {
//         Authorization: bearerToken.trim().toLowerCase().startsWith('bearer ')
//           ? bearerToken.trim()
//           : `Bearer ${bearerToken.trim()}`,
//         'x-tenant': tenant,
//       };
//       console.log('Headers being sent:', headers);
//       const query = new URLSearchParams({ page_number: String(pageNumber), page_size: String(pageSize), is_deleted: 'false' });
//       console.log('Query params:', query.toString());
//       const response = await fetch(`${API_BASE}/agents?${query.toString()}`, { headers });
//       console.log('Response status:', response.status);
//       if (!response.ok) {
//         const text = await response.text();
//         console.error('Registry proxy error:', text);
//         alert(`Failed to load agents from registry: ${text}`);
//         return;
//       }
//       const data = await response.json();
//       console.log('Response data:', data);
//       setAgents(data.agents);
//     } catch (error) {
//       console.error('Error fetching agents:', error);
//       alert('Error fetching agents. Check token/tenant and try again.');
//     } finally {
//       setLoadingAgents(false);
//     }
//   };
//   const fetchTestCategories = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/test-categories`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       setTestCategories(data.categories || {});
//     } catch (error) {
//       console.error('Error fetching test categories:', error);
//     }
//   };

//   const fetchModels = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/models`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       setModels(data.models || []);
//     } catch (error) {
//       console.error('Error fetching models:', error);
//     }
//   };

//   const addCustomAgent = async () => {
//     try {
//       const newAgent = {
//         ...customAgent,
//         id: customAgent.id || customAgent.name.toLowerCase().replace(/\s+/g, '_'),
//         is_custom: true
//       };

//       const response = await fetch(`${API_BASE}/agents`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newAgent)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('Agent added:', data);
//       await fetchAgents();
//       setCustomAgent({
//         id: '', name: '', type: '', description: '', role: '',
//         backstory: '', system_prompt: '', endpoint: ''
//       });
//     } catch (error) {
//       console.error('Error adding custom agent:', error);
//       alert('Failed to add custom agent. Check console for details.');
//     }
//   };

//   const startTest = async () => {
//     if (!selectedAgent || selectedCategories.length === 0) {
//       alert('Please select an agent and at least one test category');
//       return;
//     }

//     try {
//       setLoading(true);
//       setCurrentTab('results');

//       const payload = {
//         agent_id: selectedAgent.id,
//         model_name: selectedModel,
//         categories: selectedCategories,
//         rounds: testRounds,
//         agent_details: agentDetails
//       };

//       const response = await fetch(`${API_BASE}/start-test`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       if (data.test_id) {
//         setActiveTest(data.test_id);
//         monitorTestProgress(data.test_id);
//       }
//     } catch (error) {
//       console.error('Error starting test:', error);
//       alert('Failed to start test. Check console for details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const monitorTestProgress = (testId: string) => {
//     const interval = setInterval(async () => {
//       try {
//         const response = await fetch(`${API_BASE}/test-status/${testId}`);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const testData = await response.json();
        
//         setTestResults(prev => ({
//           ...prev,
//           [testId]: {
//             test_id: testId,
//             status: testData.status,
//             progress: testData.progress || 0,
//             agent_name: testData.config?.agent_id,
//             start_time: testData.timestamp,
//             results: testData.responses?.map((r: any) => ({
//               category: r.category,
//               round: r.round,
//               prompt: r.prompt,
//               response: r.response,
//               response_time: r.metrics?.response_time,
//               evaluation_score: r.evaluation?.score,
//               evaluation_feedback: r.evaluation?.feedback
//             })),
//             summary: testData.evaluation?.summary
//           }
//         }));

//         if (testData.status === 'completed' || testData.status === 'failed') {
//           clearInterval(interval);
//         }
//       } catch (error) {
//         console.error('Error polling test status:', error);
//         clearInterval(interval);
//       }
//     }, 2000);
//   };

//   const getCategoryIcon = (category: string) => {
//     const icons: Record<string, React.ComponentType<{className?: string}>> = {
//       security: Shield,
//       coding: Code,
//       confidentiality: Lock,
//       integrity: CheckCircle,
//       inference: Brain,
//       toxicity: AlertTriangle,
//       consistency: BarChart3
//     };
//     return icons[category] || Activity;
//   };

//   const AgentCard: React.FC<{ agent: Agent; isSelected: boolean; onClick: (agent: Agent) => void }> = 
//     ({ agent, isSelected, onClick }) => (
//       <div
//         className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
//           isSelected 
//             ? 'border-blue-500 bg-blue-50 shadow-lg' 
//             : 'border-gray-200 bg-white hover:border-gray-300'
//         }`}
//         onClick={() => onClick(agent)}
//       >
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
//           {agent.is_custom && (
//             <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
//               Custom
//             </span>
//           )}
//         </div>
//         <p className="text-gray-600 mb-2">{agent.description}</p>
//         <div className="flex items-center justify-between">
//           <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
//             {agent.type}
//           </span>
//           {agent.endpoint && (
//             <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
//               Endpoint
//             </span>
//           )}
//         </div>
//       </div>
//     );

//   const TestCategoryCard: React.FC<{ 
//     category: string; 
//     categoryData: TestCategory; 
//     isSelected: boolean; 
//     onToggle: (category: string) => void; 
//   }> = ({ category, categoryData, isSelected, onToggle }) => {
//     const Icon = getCategoryIcon(category);
//     return (
//       <div
//         className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
//           isSelected 
//             ? 'border-blue-500 bg-blue-50' 
//             : 'border-gray-200 bg-white hover:border-gray-300'
//         }`}
//         onClick={() => onToggle(category)}
//       >
//         <div className="flex items-center mb-2">
//           <Icon className="w-5 h-5 mr-2 text-blue-600" />
//           <h4 className="font-medium text-gray-900">{categoryData.name}</h4>
//         </div>
//         <p className="text-sm text-gray-600">{categoryData.description}</p>
//       </div>
//     );
//   };

//   const TestResultsPanel: React.FC<{ testId: string; results: TestResults }> = ({ testId, results }) => {
//     if (!results) return null;

//     const { summary, results: detailedResults = [] } = results;

//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h3 className="text-xl font-bold text-gray-900">Test Results</h3>
//           <div className={`px-3 py-1 rounded-full text-sm font-medium ${
//             results.status === 'completed' ? 'bg-green-100 text-green-800' :
//             results.status === 'running' ? 'bg-blue-100 text-blue-800' :
//             'bg-red-100 text-red-800'
//           }`}>
//             {results.status}
//           </div>
//         </div>
//         <div className="text-sm text-gray-500">Test ID: {testId}</div>

//         {results.status === 'running' && (
//           <div className="bg-blue-50 p-4 rounded-lg">
//             <div className="flex items-center mb-2">
//               <RefreshCw className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
//               <span className="font-medium text-blue-900">Testing in Progress</span>
//             </div>
//             <div className="w-full bg-blue-200 rounded-full h-2">
//               <div 
//                 className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                 style={{ width: `${results.progress || 0}%` }}
//               ></div>
//             </div>
//             <p className="text-sm text-blue-700 mt-2">
//               Progress: {Math.round(results.progress || 0)}%
//             </p>
//           </div>
//         )}

//         {summary && (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <div className="bg-white border p-4 rounded-lg">
//                 <p className="text-gray-500 text-sm">Overall Score</p>
//                 <p className="text-2xl font-bold text-blue-600">
//                   {Math.round(summary.overall_performance?.average_score || 0)}%
//                 </p>
//               </div>
//               <div className="bg-white border p-4 rounded-lg">
//                 <p className="text-gray-500 text-sm">Avg Response Time</p>
//                 <p className="text-2xl font-bold text-green-600">
//                   {(summary.overall_performance?.average_response_time || 0).toFixed(2)}s
//                 </p>
//               </div>
//               <div className="bg-white border p-4 rounded-lg">
//                 <p className="text-gray-500 text-sm">CPU Usage</p>
//                 <p className="text-2xl font-bold text-purple-600">
//                   {(summary.overall_performance?.average_cpu_usage || 0).toFixed(1)}%
//                 </p>
//               </div>
//               <div className="bg-white border p-4 rounded-lg">
//                 <p className="text-gray-500 text-sm">Memory Usage</p>
//                 <p className="text-2xl font-bold text-orange-600">
//                   {(summary.overall_performance?.average_memory_usage || 0).toFixed(1)}%
//                 </p>
//               </div>
//             </div>

//             {summary?.recommendations && (
//               <div className="bg-white p-6 rounded-lg border">
//                 <h4 className="text-lg font-semibold mb-2 flex items-center text-gray-800">
//                   <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
//                   Recommendations
//                 </h4>
//                 <ul className="list-disc list-inside space-y-1 text-gray-600">
//                   {summary.recommendations.map((rec, index) => (
//                     <li key={index}>{rec}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {(summary?.strengths || summary?.weaknesses) && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {summary?.strengths && (
//                   <div className="bg-green-50 p-6 rounded-lg border border-green-200">
//                     <h4 className="text-lg font-semibold mb-2 text-green-800">Strengths</h4>
//                     <ul className="list-disc list-inside space-y-1 text-green-900">
//                       {summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
//                     </ul>
//                   </div>
//                 )}
//                 {summary?.weaknesses && (
//                   <div className="bg-red-50 p-6 rounded-lg border border-red-200">
//                     <h4 className="text-lg font-semibold mb-2 text-red-800">Weaknesses</h4>
//                     <ul className="list-disc list-inside space-y-1 text-red-900">
//                       {summary.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//             )}
//           </>
//         )}

//         {detailedResults.length > 0 && (
//           <div className="bg-white rounded-lg border">
//             <div className="p-4 border-b">
//               <h4 className="text-lg font-semibold">Detailed Test Log</h4>
//             </div>
//             <div className="max-h-96 overflow-y-auto">
//               {detailedResults.map((result, index) => (
//                 <div key={index} className="p-4 border-b last:border-b-0 hover:bg-gray-50 space-y-2">
//                   <div className="flex justify-between items-center">
//                     <div className="flex items-center gap-2">
//                       <span className="font-medium capitalize text-gray-800">{result.category}</span>
//                       <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
//                         Round {result.round}
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-4 text-sm">
//                       <span className='text-gray-500'>{result.response_time.toFixed(2)}s</span>
//                       <span className={`font-bold ${
//                         result.evaluation_score >= 80 ? 'text-green-600' : 
//                         result.evaluation_score >= 60 ? 'text-yellow-600' : 'text-red-600'
//                       }`}>
//                         {Math.round(result.evaluation_score)}%
//                       </span>
//                     </div>
//                   </div>
//                   <p className="text-sm text-gray-600"><strong>Prompt:</strong> {result.prompt}</p>
//                   <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
//                     <strong>Response:</strong> {result.response}
//                   </p>
//                   {result.evaluation_feedback && (
//                     <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
//                       <strong>Feedback:</strong> {result.evaluation_feedback}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">Agent Testing Suite</h1>
//               <p className="text-gray-500 mt-1">
//                 Comprehensive testing platform for AI agents with advanced evaluation metrics
//               </p>
//             </div>
//             <div className="flex items-center">
//               <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
//                 <Activity className="w-4 h-4 mr-2" />
//                 System Active
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
//           <nav className="flex space-x-2">
//             <button
//               onClick={() => setCurrentTab('agents')}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
//                 currentTab === 'agents' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               <Database className="w-5 h-5 mr-2" />
//               Agents
//             </button>
//             <button
//               onClick={() => setCurrentTab('configure')}
//               disabled={!selectedAgent}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
//                 currentTab === 'configure' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               } ${!selectedAgent ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <Settings className="w-5 h-5 mr-2" />
//               Configure Test
//             </button>
//             <button
//               onClick={() => setCurrentTab('results')}
//               className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
//                 currentTab === 'results' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               <BarChart3 className="w-5 h-5 mr-2" />
//               Results
//             </button>
//           </nav>
//         </div>

//         {/* Content */}
//         <div className="bg-white rounded-xl shadow-sm p-8">
//           {loading && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
//                 <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mr-4" />
//                 <span className="text-lg font-medium">Loading...</span>
//               </div>
//             </div>
//           )}

//           {currentTab === 'agents' && (
//             <div className="space-y-8">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-bold text-gray-800">Available Agents</h2>
//                 <button
//                   onClick={() => setCurrentTab('configure')}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
//                   disabled={!selectedAgent}
//                 >
//                   <Settings className="w-4 h-4 mr-2" />
//                   Configure Test
//                 </button>
//               </div>

//               {/* Registry Controls */}
//               <div className="bg-gray-50 p-4 rounded-lg border">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
//                   <input
//                     placeholder="Tenant (x-tenant)"
//                     value={tenant}
//                     onChange={(e) => setTenant(e.target.value)}
//                     className="w-full px-3 py-2 border rounded-lg"
//                   />
//                   <input
//                     placeholder="Bearer token"
//                     value={bearerToken}
//                     onChange={(e) => setBearerToken(e.target.value)}
//                     className="w-full px-3 py-2 border rounded-lg"
//                   />
//                   <input
//                     type="number"
//                     min={1}
//                     value={pageNumber}
//                     onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
//                     className="w-full px-3 py-2 border rounded-lg"
//                     placeholder="Page number"
//                   />
//                   <select
//                     value={pageSize}
//                     onChange={(e) => setPageSize(parseInt(e.target.value))}
//                     className="w-full px-3 py-2 border rounded-lg"
//                   >
//                     {[10,20,30,40,50].map(n => <option key={n} value={n}>{n} / page</option>)}
//                   </select>
//                 </div>
//                 <div className="mt-3 flex gap-3 items-center">
//                   <button 
//                     onClick={fetchAgents} 
//                     disabled={loadingAgents}
//                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
//                   >
//                     {loadingAgents ? (
//                       <>
//                         <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                         Loading...
//                       </>
//                     ) : (
//                       'Load Agents'
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {agents.length === 0 && !loadingAgents && (
//                   <div className="col-span-full text-center py-8 text-gray-500">
//                     No agents loaded. Enter tenant and token above, then click "Load Agents".
//                   </div>
//                 )}
//                 {agents.map(agent => (
//                   <AgentCard
//                     key={agent.id}
//                     agent={agent}
//                     isSelected={selectedAgent?.id === agent.id}
//                     onClick={setSelectedAgent}
//                   />
//                 ))}
//               </div>

//               <div className="border-t pt-8">
//                 <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
//                   <Plus className="w-5 h-5 mr-2" />
//                   Add Custom Agent
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <input 
//                     type="text" 
//                     placeholder="Agent Name" 
//                     className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                     value={customAgent.name} 
//                     onChange={(e) => setCustomAgent({...customAgent, name: e.target.value})} 
//                   />
//                   <input 
//                     type="text" 
//                     placeholder="Agent Type" 
//                     className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                     value={customAgent.type} 
//                     onChange={(e) => setCustomAgent({...customAgent, type: e.target.value})} 
//                   />
//                   <input 
//                     type="text" 
//                     placeholder="Agent Role" 
//                     className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                     value={customAgent.role} 
//                     onChange={(e) => setCustomAgent({...customAgent, role: e.target.value})} 
//                   />
//                   <input 
//                     type="url" 
//                     placeholder="Endpoint URL (optional)" 
//                     className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                     value={customAgent.endpoint} 
//                     onChange={(e) => setCustomAgent({...customAgent, endpoint: e.target.value})} 
//                   />
//                   <textarea 
//                     placeholder="Description" 
//                     rows={3} 
//                     className="md:col-span-2 w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 resize-none" 
//                     value={customAgent.description} 
//                     onChange={(e) => setCustomAgent({...customAgent, description: e.target.value})} 
//                   />
//                   <textarea 
//                     placeholder="Backstory" 
//                     rows={3} 
//                     className="md:col-span-2 w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 resize-none" 
//                     value={customAgent.backstory} 
//                     onChange={(e) => setCustomAgent({...customAgent, backstory: e.target.value})} 
//                   />
//                   <textarea 
//                     placeholder="System Prompt" 
//                     rows={4} 
//                     className="md:col-span-2 w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 resize-none" 
//                     value={customAgent.system_prompt} 
//                     onChange={(e) => setCustomAgent({...customAgent, system_prompt: e.target.value})} 
//                   />
//                 </div>
//                 <button
//                   onClick={addCustomAgent}
//                   disabled={!customAgent.name || !customAgent.description}
//                   className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
//                 >
//                   <Plus className="w-4 h-4 mr-2" />
//                   Add Agent
//                 </button>
//               </div>
//             </div>
//           )}

//           {currentTab === 'configure' && (
//             <div className="space-y-8">
//               <div className="flex items-center">
//                 <button 
//                   onClick={() => setCurrentTab('agents')} 
//                   className="mr-4 text-gray-600 hover:text-gray-900"
//                 >
//                   <ChevronLeft className="w-6 h-6" />
//                 </button>
//                 <h2 className="text-xl font-bold text-gray-800">Configure Test</h2>
//               </div>
              
//               <div>
//                 <h3 className="text-lg font-semibold mb-2 text-gray-700">Selected Agent</h3>
//                 {selectedAgent ? (
//                   <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
//                     <div>
//                       <h4 className="font-medium text-gray-800">{selectedAgent.name}</h4>
//                       <p className="text-sm text-gray-600">{selectedAgent.description}</p>
//                     </div>
//                     <button 
//                       onClick={() => setCurrentTab('agents')} 
//                       className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg text-sm"
//                     >
//                       Change
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
//                     <p className="text-gray-500 mb-4">No agent selected</p>
//                     <button 
//                       onClick={() => setCurrentTab('agents')} 
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//                     >
//                       Select Agent
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-2 text-gray-700">Select Model</h3>
//                 <select 
//                   value={selectedModel} 
//                   onChange={(e) => setSelectedModel(e.target.value)} 
//                   className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   {models.map(model => (
//                     <option key={model.id} value={model.id}>{model.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-2 text-gray-700">Test Categories</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {Object.entries(testCategories).map(([category, categoryData]) => (
//                     <TestCategoryCard 
//                       key={category} 
//                       category={category} 
//                       categoryData={categoryData} 
//                       isSelected={selectedCategories.includes(category)} 
//                       onToggle={(cat) => setSelectedCategories(prev => 
//                         prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
//                       )}
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-2 text-gray-700">Number of Test Rounds</h3>
//                 <input 
//                   type="range" 
//                   min="1" 
//                   max="10" 
//                   value={testRounds} 
//                   onChange={(e) => setTestRounds(parseInt(e.target.value))} 
//                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
//                 />
//                 <div className="flex justify-between text-sm text-gray-600 mt-2">
//                   <span>1</span>
//                   <span className="font-medium text-blue-600">{testRounds} Rounds</span>
//                   <span>10</span>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold mb-2 text-gray-700">Agent Details Override (Optional)</h3>
//                 <div className="space-y-4">
//                   <div className="relative w-full">
//                     <textarea 
//                       placeholder="Custom Role" 
//                       rows={2} 
//                       className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                       value={agentDetails.role} 
//                       onChange={(e) => setAgentDetails({...agentDetails, role: e.target.value})} 
//                     />
//                     <Pencil className="absolute bottom-3 right-3 w-4 h-4 text-gray-400 pointer-events-none" />
//                   </div>
//                   <div className="relative w-full">
//                     <textarea 
//                       placeholder="Custom Backstory" 
//                       rows={3} 
//                       className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                       value={agentDetails.backstory} 
//                       onChange={(e) => setAgentDetails({...agentDetails, backstory: e.target.value})} 
//                     />
//                     <Pencil className="absolute bottom-3 right-3 w-4 h-4 text-gray-400 pointer-events-none" />
//                   </div>
//                   <div className="relative w-full">
//                     <textarea 
//                       placeholder="Custom System Prompt" 
//                       rows={4} 
//                       className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                       value={agentDetails.system_prompt} 
//                       onChange={(e) => setAgentDetails({...agentDetails, system_prompt: e.target.value})} 
//                     />
//                     <Pencil className="absolute bottom-3 right-3 w-4 h-4 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-center pt-4 border-t">
//                 <button 
//                   onClick={startTest} 
//                   disabled={!selectedAgent || selectedCategories.length === 0 || loading}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
//                 >
//                   <Play className="w-5 h-5 mr-2" />
//                   Start Testing
//                 </button>
//               </div>
//             </div>
//           )}

//           {currentTab === 'results' && (
//             <div className="space-y-6">
//               <div className="flex items-center">
//                 <button 
//                   onClick={() => setCurrentTab('configure')} 
//                   className="mr-4 text-gray-600 hover:text-gray-900"
//                 >
//                   <ChevronLeft className="w-6 h-6" />
//                 </button>
//                 <h2 className="text-xl font-bold text-gray-800">Test Results</h2>
//               </div>

//               {activeTest && testResults[activeTest] ? (
//                 <TestResultsPanel testId={activeTest} results={testResults[activeTest]} />
//               ) : (
//                 <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
//                   <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Tests</h3>
//                   <p className="text-gray-500 mb-6">Start a new test to see results here.</p>
//                   <button 
//                     onClick={() => setCurrentTab('configure')} 
//                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
//                   >
//                     <Settings className="w-4 h-4 mr-2" />
//                     Configure Test
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;









import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Settings, 
  Database, 
  Activity, 
  Shield, 
  Code, 
  Lock, 
  CheckCircle, 
  Brain, 
  AlertTriangle,
  BarChart3,
  Plus,
  RefreshCw,
  CheckCircle2,
  Pencil
} from 'lucide-react';

// Define TypeScript interfaces for our data structures
interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  role?: string;
  backstory?: string;
  system_prompt?: string;
  endpoint?: string;
  is_custom?: boolean;
}

interface TestCategory {
  name: string;
  description:string;
}

interface Model {
  id: string;
  name: string;
}

interface TestResults {
  test_id: string;
  status: 'running' | 'completed' | 'failed';
  progress?: number;
  agent_name?: string;
  start_time?: string;
  summary?: {
    overall_performance?: {
      average_score?: number;
      average_response_time?: number;
      average_cpu_usage?: number;
      average_memory_usage?: number;
    };
    category_analysis?: Record<string, {
      avg_score: number;
      test_count: number;
      avg_response_time: number;
    }>;
    recommendations?: string[];
    strengths?: string[];
    weaknesses?: string[];
  };
  results?: Array<{
    category: string;
    round: number;
    prompt: string;
    response: string;
    response_time: number;
    evaluation_score: number;
    evaluation_feedback?: string;
  }>;
}

interface AgentDetails {
  role?: string;
  backstory?: string;
  system_prompt?: string;
}

// Reusable styled components to match the new UI
const CustomTextarea = ({ icon: Icon, ...props }: { icon?: any; [x: string]: any }) => (
    <div className="relative w-full">
        <textarea
            {...props}
            className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 resize-none"
        />
        {Icon && <Icon className="absolute bottom-3 right-3 w-4 h-4 text-gray-400 pointer-events-none" />}
    </div>
);

interface TestResultsPanelProps {
  testId: string;
  results: TestResults;
}

const TestResultsPanel: React.FC<TestResultsPanelProps> = ({ testId, results }) => {
  if (!results) return null;

  const { summary, results: detailedResults = [] } = results;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Test Results</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          results.status === 'completed' ? 'bg-green-100 text-green-800' :
          results.status === 'running' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {results.status}
        </div>
      </div>
      <div className="text-sm text-gray-500">Test ID: {testId}</div>

      {results.status === 'running' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <RefreshCw className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
            <span className="font-medium text-blue-900">Testing in Progress</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${results.progress || 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Progress: {Math.round(results.progress || 0)}%
          </p>
        </div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Overall Score</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(summary.overall_performance?.average_score || 0)}%</p>
            </div>
            <div className="bg-white border p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Avg Response Time</p>
                <p className="text-2xl font-bold text-green-600">{(summary.overall_performance?.average_response_time || 0).toFixed(2)}s</p>
            </div>
            <div className="bg-white border p-4 rounded-lg">
                <p className="text-gray-500 text-sm">CPU Usage</p>
                <p className="text-2xl font-bold text-purple-600">{(summary.overall_performance?.average_cpu_usage || 0).toFixed(1)}%</p>
            </div>
            <div className="bg-white border p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Memory Usage</p>
                <p className="text-2xl font-bold text-orange-600">{(summary.overall_performance?.average_memory_usage || 0).toFixed(1)}%</p>
            </div>
          </div>
          {summary?.recommendations && (
              <div className="bg-white p-6 rounded-lg border">
                  <h4 className="text-lg font-semibold mb-2 flex items-center text-gray-800">
                      <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                      Recommendations
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {summary.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                  </ul>
              </div>
          )}

          {(summary?.strengths || summary?.weaknesses) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary?.strengths && (
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="text-lg font-semibold mb-2 text-green-800">Strengths</h4>
                  <ul className="list-disc list-inside space-y-1 text-green-900">
                    {summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {summary?.weaknesses && (
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h4 className="text-lg font-semibold mb-2 text-red-800">Weaknesses</h4>
                  <ul className="list-disc list-inside space-y-1 text-red-900">
                    {summary.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {detailedResults.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h4 className="text-lg font-semibold">Detailed Test Log</h4>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {detailedResults.map((result, index) => (
              <div key={index} className="p-4 border-b last:border-b-0 hover:bg-gray-50 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <span className="font-medium capitalize text-gray-800">{result.category}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">Round {result.round}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                      <span className='text-gray-500'>{result.response_time.toFixed(2)}s</span>
                      <span className={`font-bold ${result.evaluation_score >= 80 ? 'text-green-600' : result.evaluation_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {Math.round(result.evaluation_score)}%
                      </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600"><strong>Prompt:</strong> {result.prompt}</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded"><strong>Response:</strong> {result.response}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'agents' | 'configure' | 'results'>('agents');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [testCategories, setTestCategories] = useState<Record<string, TestCategory>>({});
  const [models, setModels] = useState<Model[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-pro');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [testRounds, setTestRounds] = useState<number>(4);
  const [agentDetails, setAgentDetails] = useState<AgentDetails>({});
  const [testResults, setTestResults] = useState<Record<string, TestResults>>({});
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [customAgent, setCustomAgent] = useState<Omit<Agent, 'is_custom'>>({
    id: '',
    name: '',
    type: '',
    description: '',
    role: '',
    backstory: '',
    system_prompt: '',
    endpoint: ''
  });

  useEffect(() => {
    // Mock data fetching for demonstration without a backend
    fetchAgents();
    fetchTestCategories();
    fetchModels();
  }, []);

  const API_BASE = 'http://localhost:8000'; // This will be mocked

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_BASE}/agents`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAgents(data.agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchTestCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/test-categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTestCategories(data.categories);
    } catch (error) {
      console.error("Error fetching test categories:", error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch(`${API_BASE}/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const backendModels: Model[] = Array.isArray(data.models) ? data.models : [];
      setModels(backendModels);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const addCustomAgent = async () => {
    const newAgent = {
      ...customAgent,
      id: customAgent.id || customAgent.name.toLowerCase().replace(/\s+/g, '_'),
      is_custom: true
    };
    try {
      const response = await fetch(`${API_BASE}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Agent added successfully:", data);
      fetchAgents(); // Refresh the list of agents
      setCustomAgent({
        id: '', name: '', type: '', description: '', role: '',
        backstory: '', system_prompt: '', endpoint: ''
      });
    } catch (error) {
      console.error("Error adding custom agent:", error);
    }
  };

  const startTest = async () => {
    if (!selectedAgent || selectedCategories.length === 0) {
      console.error('Please select an agent and at least one test category');
      return;
    }

    setCurrentTab('results');

    // Prepare the payload for the backend
    const payload = {
      agent_id: selectedAgent.id,
      model_name: selectedModel,
      categories: selectedCategories,
      rounds: testRounds,
      agent_details: agentDetails,
    };

    try {
      const response = await fetch('http://localhost:8000/start-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.test_id) {
        setActiveTest(data.test_id);
        // Initialize test results with the test ID from backend
        setTestResults(prev => ({
          ...prev,
          [data.test_id]: {
            test_id: data.test_id,
            status: 'running',
            progress: 0,
            agent_name: selectedAgent.name,
            start_time: new Date().toISOString(),
            results: []
          }
        }));
        // Start polling for test progress
        monitorTestProgress(data.test_id);
      } else {
        throw new Error('Failed to start test');
      }
    } catch (err) {
      console.error('Error starting test:', err);
    }
  };

  const monitorTestProgress = (testId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/test-status/${testId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const testData = await response.json();
        
        setTestResults(prev => ({
          ...prev,
          [testId]: {
            test_id: testId,
            status: testData.status,
            progress: testData.progress || 0,
            agent_name: testData.agent_name,
            start_time: testData.start_time,
            results: testData.results || [],
            summary: testData.summary
          }
        }));

        if (testData.status === 'completed' || testData.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling test status:', err);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<{className?: string}>> = {
      security: Shield,
      coding: Code,
      confidentiality: Lock,
      integrity: CheckCircle,
      inference: Brain,
      toxicity: AlertTriangle,
      consistency: BarChart3
    };
    return icons[category] || Activity;
  };

  const AgentCard: React.FC<{ agent: Agent; isSelected: boolean; onClick: (agent: Agent) => void; }> = ({ agent, isSelected, onClick }) => (
    <div
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => onClick(agent)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
        {agent.is_custom && (
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
            Custom
          </span>
        )}
      </div>
      <p className="text-gray-600 mb-2">{agent.description}</p>
      <div className="text-sm text-gray-500">
        <span className="inline-block bg-gray-100 px-2 py-1 rounded">
          {agent.type}
        </span>
      </div>
    </div>
  );

  const TestCategoryCard: React.FC<{ category: string; categoryData: TestCategory; isSelected: boolean; onToggle: (category: string) => void; }> = ({ category, categoryData, isSelected, onToggle }) => {
    const Icon = getCategoryIcon(category);
    return (
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        onClick={() => onToggle(category)}
      >
        <div className="flex items-center mb-2">
          <Icon className="w-5 h-5 mr-2 text-blue-600" />
          <h4 className="font-medium text-gray-900">{categoryData.name}</h4>
        </div>
        <p className="text-sm text-gray-600">{categoryData.description}</p>
      </div>
    );
  };

  return (
    <>
    <style>{`
        :root {
          font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          font-weight: 400;
          color-scheme: light;
          color: #213547;
          background-color: #ffffff;
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        #root {
            padding: 2rem;
        }
        .btn-primary {
          background: linear-gradient(to right, #3b82f6, #2563eb);
          color: #fff;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
          transition: background 0.3s, box-shadow 0.3s;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(to right, #2563eb, #1d4ed8);
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.18);
        }
        .btn-primary:disabled {
          background: #d1d5db;
          color: #6b7280;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          border: 1px solid #d1d5db;
          transition: background 0.3s, color 0.3s;
          cursor: pointer;
        }
        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
          color: #1d4ed8;
        }
        .btn-secondary:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }
    `}</style>
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Agent Testing Suite
              </h1>
              <p className="text-gray-500 mt-1">
                Comprehensive testing platform for AI agents with advanced evaluation metrics
              </p>
            </div>
            <div className="flex items-center">
              <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <Activity className="w-4 h-4 mr-2" />
                System Active
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <nav className="flex space-x-2">
            {[
              { id: 'agents', label: 'Agents', icon: Database },
              { id: 'configure', label: 'Configure Test', icon: Settings },
              { id: 'results', label: 'Test Results', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as 'agents' | 'configure' | 'results')}
                  className={`btn-primary flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentTab === tab.id ? 'text-blue-500 bg-white' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-2 ${currentTab === tab.id ? 'text-blue-500' : 'text-white'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {currentTab === 'agents' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Available Agents</h2>
                <button
                  onClick={() => setCurrentTab('configure')}
                  className="btn-primary flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Test
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgent?.id === agent.id}
                    onClick={setSelectedAgent}
                  />
                ))}
              </div>

              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Custom Agent
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Agent Name" className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={customAgent.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomAgent({...customAgent, name: e.target.value})} />
                  <input type="text" placeholder="Agent Type" className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={customAgent.type} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomAgent({...customAgent, type: e.target.value})} />
                  <input type="text" placeholder="Agent Role" className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={customAgent.role} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomAgent({...customAgent, role: e.target.value})} />
                  <input type="url" placeholder="Endpoint URL (optional)" className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={customAgent.endpoint} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomAgent({...customAgent, endpoint: e.target.value})} />
                  <CustomTextarea  placeholder="Description" rows={3} value={customAgent.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomAgent({...customAgent, description: e.target.value})} className="md:col-span-2 w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 resize-none" />
                  <CustomTextarea placeholder="Backstory" rows={3} value={customAgent.backstory} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomAgent({...customAgent, backstory: e.target.value})} className="md:col-span-2 w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 resize-none" />
                  <CustomTextarea placeholder="System Prompt" rows={4} value={customAgent.system_prompt} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomAgent({...customAgent, system_prompt: e.target.value})} className="md:col-span-2 w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300 resize-none" />
                </div>
                <button
                  onClick={addCustomAgent}
                  disabled={!customAgent.name || !customAgent.description}
                  className="btn-primary mt-4 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent
                </button>
              </div>
            </div>
          )}

          {currentTab === 'configure' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-800">Configure Test</h2>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Selected Agent</h3>
                {selectedAgent ? (
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                    <div>
                      <h4 className="font-medium text-gray-800">{selectedAgent.name}</h4>
                      <p className="text-sm text-gray-600">{selectedAgent.description}</p>
                    </div>
                    <button onClick={() => setCurrentTab('agents')} className="btn-secondary">Change</button>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500 mb-4">No agent selected</p>
                    <button onClick={() => setCurrentTab('agents')} className="btn-primary">Select Agent</button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Select Model</h3>
                <select value={selectedModel} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedModel(e.target.value)} className="w-full px-4 py-2 border bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Test Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(testCategories).map(([category, categoryData]) => (
                    <TestCategoryCard key={category} category={category} categoryData={categoryData} isSelected={selectedCategories.includes(category)} onToggle={(cat) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}/>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Number of Test Rounds</h3>
                <input type="range" min="1" max="10" value={testRounds} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestRounds(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>1</span>
                  <span className="font-medium text-blue-600">{testRounds} Rounds</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Agent Details Override (Optional)</h3>
                <div className="space-y-4">
                  <CustomTextarea placeholder="Custom Role" rows={2} value={agentDetails.role || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAgentDetails({...agentDetails, role: e.target.value})} icon={Pencil} />
                  <CustomTextarea placeholder="Custom Backstory" rows={3} value={agentDetails.backstory || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAgentDetails({...agentDetails, backstory: e.target.value})} icon={Pencil} />
                  <CustomTextarea placeholder="Custom System Prompt" rows={4} value={agentDetails.system_prompt || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAgentDetails({...agentDetails, system_prompt: e.target.value})} icon={Pencil} />
                </div>
              </div>

              <div className="flex justify-center pt-4 border-t">
                <button onClick={startTest} disabled={!selectedAgent || selectedCategories.length === 0} className="btn-primary text-lg font-semibold flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Start Testing
                </button>
              </div>
            </div>
          )}

          {currentTab === 'results' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Test Results</h2>
                <button onClick={() => setCurrentTab('configure')} className="btn-primary flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  New Test
                </button>
              </div>

              {activeTest && testResults[activeTest] ? (
                <TestResultsPanel testId={activeTest} results={testResults[activeTest]} />
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Tests</h3>
                  <p className="text-gray-500 mb-6">Start a new test to see results here.</p>
                  <button onClick={() => setCurrentTab('configure')} className="btn-primary flex items-center mx-auto">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Test
                  </button>
                </div>
              )}
              
              {/* Previous Test Results can be listed here if needed */}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default App;

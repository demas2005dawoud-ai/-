
import React, { useState } from 'react';
import { AppState } from '../types';
import { getSmartAnalysis } from '../services/gemini';

interface Props {
  state: AppState;
}

const GeminiAssistant: React.FC<Props> = ({ state }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q) return;
    setLoading(true);
    try {
      const result = await getSmartAnalysis(state, q);
      setResponse(result || 'عذراً، حدث خطأ ما.');
    } catch (e) {
      setResponse('تعذر الاتصال بالمساعد الذكي حالياً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border space-y-6">
      <h3 className="text-2xl font-black text-indigo-700">المساعد الذكي (Gemini AI) 🤖</h3>
      <div className="flex gap-2">
        <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="اسأل عن مستوى طالب أو تحليل للفصل..." className="flex-grow p-4 rounded-xl border outline-none" />
        <button onClick={()=>handleAsk()} disabled={loading} className="bg-indigo-600 text-white px-8 rounded-xl font-black shadow-lg">اسأل</button>
      </div>
      {response && (
        <div className="p-6 bg-indigo-50 rounded-2xl border-r-4 border-indigo-600 whitespace-pre-wrap leading-relaxed animate-in fade-in">
          {response}
        </div>
      )}
    </div>
  );
};

export default GeminiAssistant;

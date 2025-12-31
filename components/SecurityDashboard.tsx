
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

export const SecurityDashboard: React.FC = () => {
  const [tip, setTip] = useState<string>("Initializing secure protocols...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTip = async () => {
      setLoading(true);
      const advice = await geminiService.getSecurityAdvice("end-to-end encryption and metadata privacy");
      setTip(advice);
      setLoading(false);
    };
    fetchTip();
  }, []);

  return (
    <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2 text-indigo-400">
        <i className="fas fa-shield-halved text-xs"></i>
        <span className="text-[10px] uppercase tracking-widest font-bold">Cipher Intelligence</span>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed italic">
        {loading ? (
          <span className="flex items-center gap-2">
            <i className="fas fa-circle-notch animate-spin"></i>
            Scanning for vulnerabilities...
          </span>
        ) : (
          `"${tip}"`
        )}
      </p>
    </div>
  );
};

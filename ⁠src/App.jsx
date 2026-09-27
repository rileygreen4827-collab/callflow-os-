import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client using standard environment variables or fallback structure
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mlkgcaagxfkzfjxgzcm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RruR7GjA_EMvtnuxVtagNw_ddvTjr4b';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  // Timer effect for simulated active Twilio call
  useEffect(() => {
    let timer;
    if (isCalling) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching leads:', error.message);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
    if (!error) {
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    }
  };

  const totalLeads = leads.length;
  const connectedLeads = leads.filter(l => l.status === 'connected').length;
  const successRate = totalLeads > 0 ? Math.round((connectedLeads / totalLeads) * 100) : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'in_progress': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'busy': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'no_answer': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            C
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">CallFlow OS</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Live RLS Secured
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Pipeline Leads</p>
              <h3 className="text-3xl font-bold text-white mt-1">{totalLeads}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xl font-bold border border-indigo-500/30">
              📁
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-sm font-medium text-slate-400">Connected Calls</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-1">{connectedLeads}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/30">
              📞
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-sm font-medium text-slate-400">Conversion Success</p>
              <h3 className="text-3xl font-bold text-white mt-1">{successRate}%</h3>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" className="text-slate-800" fill="transparent" />
                <circle 
                  cx="28" cy="28" r="24" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  className="text-indigo-500 transition-all duration-1000 ease-out" 
                  fill="transparent" 
                  strokeDasharray={150.7}
                  strokeDashoffset={150.7 - (150.7 * successRate) / 100} 
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-semibold text-indigo-300">{successRate}%</span>
            </div>
          </div>
        </div>

        {isCalling && selectedLead && (
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between animate-pulse">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl shadow-lg">
                🎙️
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Twilio Voice Active: {selectedLead.business_name || 'Prospect'}</h4>
                <p className="text-indigo-300 text-sm">Duration: {Math.floor(callDuration / 60)}m {callDuration % 60}s — Secure Line Open</p>
              </div>
            </div>
            <button 
              onClick={() => setIsCalling(false)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl shadow-lg shadow-rose-600/30 transition-all"
            >
              End Call & Log
            </button>
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 md:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Organization Leads</h2>
              <p className="text-xs text-slate-400">Manage statuses, trigger Twilio calls, and track call notes.</p>
            </div>
            <button 
              onClick={fetchLeads}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition-all"
            >
              Refresh Leads
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading secure enterprise leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No leads found in this organization. Insert your first lead via Supabase SQL or CSV import!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/40">
                    <th className="p-4">Business / Lead</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-medium text-white">
                        {lead.business_name || 'Unnamed Business'}
                        <div className="text-xs text-slate-400">{lead.contact_name || 'No contact name'}</div>
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-xs">{lead.phone || 'No phone'}</td>
                      <td className="p-4">
                        <select
                          value={lead.status || 'uncalled'}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border focus:outline-none cursor-pointer ${getStatusColor(lead.status)}`}
                        >
                          <option value="uncalled" className="bg-slate-900 text-slate-300">Uncalled</option>
                          <option value="in_progress" className="bg-slate-900 text-amber-400">In Progress</option>
                          <option value="connected" className="bg-slate-900 text-emerald-400">Connected</option>
                          <option value="busy" className="bg-slate-900 text-rose-400">Busy</option>
                          <option value="no_answer" className="bg-slate-900 text-purple-400">No Answer</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsCalling(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs shadow-md shadow-indigo-600/20 transition-all"
                        >
                          Call via Twilio
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

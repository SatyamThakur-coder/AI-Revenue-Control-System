import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Target, Users, Shield, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [target, setTarget] = useState(2500000);
  const [team, setTeam] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get('/settings');
        if (res.data.success) {
          setTarget(res.data.data.organization.monthlyTarget);
          setTeam(res.data.data.teamMembers);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiClient.put('/settings/target', { monthlyTarget: Number(target) });
      setMessage('Monthly revenue target updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update target:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-indigo-400" />
          Business Configuration & Team Settings
        </h2>
        <p className="text-xs text-slate-400">Configure monthly targets, view organization members, and review role permissions</p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          {message}
        </div>
      )}

      {/* Target Setting Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Monthly Revenue Target</h3>
            <p className="text-xs text-slate-400">Set the target revenue benchmark used in dashboard KPI progress calculations</p>
          </div>
        </div>

        <form onSubmit={handleUpdateTarget} className="flex items-center space-x-3 max-w-md pt-2">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs flex items-center">
            <span className="text-slate-500 font-bold mr-2">₹</span>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="bg-transparent border-none outline-none text-white w-full font-bold text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving || user?.role !== 'OWNER'}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save Target
          </button>
        </form>
        {user?.role !== 'OWNER' && (
          <p className="text-[11px] text-amber-400">Only organization OWNER can update the monthly revenue target.</p>
        )}
      </div>

      {/* Team Members List */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Organization Team Members</h3>
            <p className="text-xs text-slate-400">User accounts belonging to {user?.organization.name}</p>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {team.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{m.name}</p>
                <p className="text-[11px] text-slate-400">{m.email}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                m.role === 'OWNER' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                m.role === 'MANAGER' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-slate-800 text-slate-300'
              }`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

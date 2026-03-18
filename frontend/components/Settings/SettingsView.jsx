import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

export const SettingsView = ({ onSettingsUpdate }) => {
  const [threshold, setThreshold] = useState(70);
  const [instructionsText, setInstructionsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await api.getSettings();
      setThreshold(settings.ai_score_threshold || 70);
      setInstructionsText(settings.instructions_text || '');
      setError(null);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings. Using default threshold of 70.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (threshold < 0 || threshold > 100) {
      setError('Threshold must be between 0 and 100');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await api.updateSettings({ 
        ai_score_threshold: threshold,
        instructions_text: instructionsText 
      });
      setSuccess(true);
      
      // Reload settings from server to ensure we have the latest value
      await loadSettings();
      
      // Notify parent component to refresh stats
      if (onSettingsUpdate) {
        onSettingsUpdate();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">AI Score Settings</h2>
            <p className="text-sm text-slate-500">Configure the passing threshold for AI-scored resumes</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-red-800">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <div className="w-5 h-5 flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-emerald-800">Settings saved successfully!</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              AI Score Passing Threshold (%)
            </label>
            <p className="text-xs text-slate-500 mb-4">
              Resumes with an AI score equal to or above this threshold will be marked as "Qualified".
              Current threshold: <span className="font-bold text-indigo-600">{threshold}%</span>
            </p>
            
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="w-20">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={threshold}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setThreshold(Math.max(0, Math.min(100, value)));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>0-{threshold - 1}% - Below Threshold</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span>{threshold}%+ - Qualified</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Instructions Text for Applicants
              </label>
              <p className="text-xs text-slate-500 mb-4">
                These instructions will be considered when evaluating applicants who don't have much experience but know the tools, and also for those with no skills. This helps guide the AI scoring process.
              </p>
              <textarea
                value={instructionsText}
                onChange={(e) => setInstructionsText(e.target.value)}
                rows={6}
                placeholder="Example: Consider applicants who may not have extensive experience but demonstrate knowledge of the required tools. Also consider candidates with no skills but show potential and willingness to learn..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">How it works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>The AI Score threshold determines which resumes are automatically marked as "Qualified".</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>When a resume is analyzed, it receives an AI score from 0-100 based on skills match and experience.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>Resumes with scores equal to or above your threshold will appear in the "AI Shortlisted" filter.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>You can adjust this threshold anytime based on your hiring standards.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};



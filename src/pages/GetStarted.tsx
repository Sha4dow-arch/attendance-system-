import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function GetStarted() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl border border-slate-200 p-12 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Welcome to Attendance PRO</h1>
        <p className="text-slate-500 mb-8">Centralized attendance, course management, and audit logs for institutions. Get started by signing in or creating an account.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all">
            Get Started
            <ArrowRight size={16} />
          </Link>

          <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all">
            Create Account
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-6">Need admin access? Contact your system administrator or use a dev admin code during registration for testing.</p>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface SimplePageProps {
  title: string;
  content: string;
  isRtl: boolean;
}

export default function SimplePage({ title, content, isRtl }: SimplePageProps) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-500">
      <Link 
        to="/"
        className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest mb-8"
      >
        <ArrowLeft size={18} className="rtl:rotate-180" />
        {isRtl ? 'חזרה לדף הבית' : 'Back to Home'}
      </Link>
      
      <div className="bg-white rounded-[3rem] border border-gray-100 p-12 shadow-xl space-y-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{title}</h1>
        <div className="prose prose-lg max-w-none text-gray-500 font-medium leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}

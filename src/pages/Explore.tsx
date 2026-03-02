import React, { useState } from 'react';
import { Search as SearchIcon, MapPin, Filter, Star, Briefcase, ArrowRight, X, ChevronDown } from 'lucide-react';

interface ExploreProps {
  isRtl: boolean;
}

export default function Explore({ isRtl }: ExploreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Search Header */}
      <div className="space-y-6">
        <h1 className="text-4xl font-black text-black tracking-tight">Search SkillLink</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Trade / Specialty"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="City / Radius"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border ${
              isFilterOpen ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Collapsible Filters */}
        {isFilterOpen && (
          <div className="p-8 bg-gray-50 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-top duration-200">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Minimum Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all">
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Availability</label>
              <select className="w-full p-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-black focus:ring-2 focus:ring-black transition-all">
                <option>Any Availability</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Weekends</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</label>
              <div className="flex p-1 bg-white border border-gray-100 rounded-xl">
                <button className="flex-1 py-2 rounded-lg font-bold text-xs bg-black text-white">Mentor</button>
                <button className="flex-1 py-2 rounded-lg font-bold text-xs text-gray-400 hover:text-black">Apprentice</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-2xl font-black text-black">Results</h2>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">0 Results</span>
        </div>

        {/* Empty Search State */}
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center space-y-8 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <SearchIcon className="text-gray-200" size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-black tracking-tight">No results found.</h2>
            <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
              Try adjusting your filters or search terms to find the perfect match in the SkillLink community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

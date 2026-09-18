import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import searchAnim from '../assets/search-anim.png';

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/categories?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="bg-white flex-1 flex flex-col items-center pt-16 md:pt-24 px-4 pb-20">
      <h1 className="text-3xl font-serif text-text-main mb-8 tracking-wide">Search</h1>
      
      <form onSubmit={handleSearch} className="w-full max-w-lg relative">
        <input 
          type="text" 
          placeholder="Search" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full pl-6 pr-14 py-4 rounded-full border border-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base placeholder-gray-500 shadow-sm transition-all"
        />
        <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-800 hover:text-primary transition-colors">
          <Search className="h-6 w-6" />
        </button>
      </form>

      <div className="mt-auto pt-16 w-full max-w-lg flex flex-col items-center">
        <img src={searchAnim} alt="Gifting Studio" className="w-full h-auto object-contain" />
      </div>
    </div>
  );
};

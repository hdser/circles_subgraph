import SearchBar from '../components/search/SearchBar';
import { GitBranch, Search, Users, BarChart3, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <GitBranch className="h-16 w-16 text-circles-purple" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Circles Path Explorer
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore and visualize token transfer paths in the Circles V2 network
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-16">
        <SearchBar />
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="card text-center">
          <Search className="h-12 w-12 text-circles-purple mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Transaction Analysis</h3>
          <p className="text-gray-600">
            Visualize all transfer paths within a single transaction using interactive Sankey diagrams
          </p>
        </div>

        <div className="card text-center">
          <Users className="h-12 w-12 text-circles-green mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Address Explorer</h3>
          <p className="text-gray-600">
            Track all incoming and outgoing transfers for any address in the Circles network
          </p>
        </div>

        <div className="card text-center">
          <BarChart3 className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Path Insights</h3>
          <p className="text-gray-600">
            Understand complex circular transfers and multi-hop payment flows with detailed breakdowns
          </p>
        </div>

        <Link to="/chat" className="card text-center hover:shadow-lg transition-shadow cursor-pointer">
          <MessageCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
          <p className="text-gray-600">
            Chat with our AI to explore transfers, understand patterns, and learn about Circles
          </p>
        </Link>
      </div>
    </div>
  );
}
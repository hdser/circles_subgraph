import { Link } from 'react-router-dom';
import { GitBranch } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <GitBranch className="h-8 w-8 text-circles-purple" />
            <h1 className="text-xl font-bold text-gray-900">
              <h1 className="text-xl font-semibold">
                <span style={{ color: 'hsl(244.67 47.87% 36.86% / 1)' }}>Circles</span>
                {' '}
                <span style={{ color: 'hsl(8.09 68.78% 59.8% / 1)' }}>PathExplorer</span>
                </h1>
            </h1>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <a
              href="https://github.com/aboutcircles"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://aboutcircles.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Circles
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
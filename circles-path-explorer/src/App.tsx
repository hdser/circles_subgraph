import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import { client } from './services/graphql/client';
import { SearchProvider } from './contexts/SearchContext';
import { FilterProvider } from './contexts/FilterContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import TransactionView from './pages/TransactionView';
import AddressView from './pages/AddressView';

function App() {
  return (
    <ApolloProvider client={client}>
      <SearchProvider>
        <FilterProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tx/:hash" element={<TransactionView />} />
                <Route path="/address/:address" element={<AddressView />} />
              </Routes>
            </Layout>
            <Toaster position="bottom-right" />
          </BrowserRouter>
        </FilterProvider>
      </SearchProvider>
    </ApolloProvider>
  );
}

export default App;
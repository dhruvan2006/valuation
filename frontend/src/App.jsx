import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Leverage from './pages/Leverage';
import Valuation from './pages/Valuation';
import ScrollBackToTop from './components/ScrollBackToTop';
import OptimalLeverage from './pages/OptimalLeverage';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <BrowserRouter className='bg-black md:px-32'>
      <Navbar />
      <div className='mt-20' />
      <ScrollBackToTop />
      <Routes>
        <Route path="/" element={<Valuation />} />
        <Route path="/optimal" element={<OptimalLeverage />} />
        <Route path="/leverage" element={<Leverage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

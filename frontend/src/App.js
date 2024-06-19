import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Leverage from './pages/Leverage';
import Valuation from './pages/Valuation';
import ScrollBackToTop from './components/ScrollBackToTop';
import OptimalLeverage from './pages/OptimalLeverage';
import NotFound from './pages/NotFound';

function App() {
  
  return (
    <BrowserRouter className='bg-black md:px-32'>
      <Navbar />
      <div className='mt-24' />
      <ScrollBackToTop />
      <Routes>
        <Route path="/" element={<Leverage />} />
        <Route path="/optimal" element={<OptimalLeverage />} />
        <Route path="/valuation" element={<Valuation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

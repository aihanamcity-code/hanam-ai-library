import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MasterGallery from './components/MasterGallery';
import { BoardProvider } from './context/BoardContext';
import EmployeeBoardPage from './pages/EmployeeBoardPage';

function App() {
  return (
    <BoardProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="notice" element={<MasterGallery />} />
            <Route path="policy-analysis" element={<MasterGallery />} />
            <Route path="tip-bank" element={<MasterGallery />} />
            <Route path="card-news" element={<MasterGallery />} />
            <Route path="board" element={<EmployeeBoardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </BoardProvider>
  );
}

export default App;

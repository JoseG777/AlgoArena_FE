import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/HomePage';
import NotHomePage from './views/NotHomePage';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/test" element={<NotHomePage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

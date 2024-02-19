import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/pages/HomePage/Home'
import Footer from './components/pages/Footer/Footer';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element = {<Home/>} />
        
        {/* other routes can be added here */}
      </Routes>
      <Footer /> {/* This places the Footer outside the Routes but still within the Router */}
    </Router>
  );
}

export default App;

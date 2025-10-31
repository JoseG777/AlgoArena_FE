import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/HomePage';
import NotHomePage from './views/NotHomePage';
import SignUp from './views/SignUp';
import SignIn from './views/SignIn';
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from './components/PublicOnlyRoute';
import AuthRoom from './views/AuthRoom';
import Rooms from './views/Rooms';
import './App.css'
import TriviaPage from './views/TriviaPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicOnlyRoute to="/test">
            <HomePage/>
          </PublicOnlyRoute>
          }/>

        <Route path="sign-up" element={
          <PublicOnlyRoute to="/test">
            <SignUp/>
          </PublicOnlyRoute>
          }/>

        <Route path="sign-in" element={
          <PublicOnlyRoute to="/test">
            <SignIn/>
          </PublicOnlyRoute>
          }/>

        {/* Protected Routes */}
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <NotHomePage/>
            </ProtectedRoute>
          }
        />

        <Route
          path="auth-room"
          element={
            <ProtectedRoute>
              <AuthRoom/>
            </ProtectedRoute>
          }
        />

        <Route path="/room-test" element={<Rooms/>}/>

        <Route path="/trivia" element={<TriviaPage/>} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App

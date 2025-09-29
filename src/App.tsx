import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/HomePage';
import NotHomePage from './views/NotHomePage';
import SignUp from './views/SignUp';
import SignIn from './views/SignIn';
import MonacoEditor from './views/MonacoEditor';
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from './components/PublicOnlyRoute';
import './App.css'

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
        <Route path="monaco-editor" element={<MonacoEditor />} />

        {/* Protected Routes */}
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <NotHomePage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App

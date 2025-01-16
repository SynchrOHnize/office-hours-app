import LandingPage from './components/landing-page.tsx';
import { Dashboard } from './pages/dashboard.tsx';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster.tsx';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import NavBar from './components/navbar.tsx';
import Footer from './components/footer.tsx';

const App = () => {
  return (
    <>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={
            <>
              <SignedOut>
                <LandingPage />
              </SignedOut>
              <SignedIn>
                <Navigate to="/dashboard" />
              </SignedIn>
            </>
          } />
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <NavBar />
                  <Dashboard />
                  <Footer />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/" />
                </SignedOut>
              </>
            } />
          <Route
            path="*"
            element={
              <>
                <SignedOut>
                  <Navigate to="/" />
                </SignedOut>
                <SignedIn>
                  <Navigate to="/dashboard" />
                </SignedIn>
              </>
            }
          />
        </Routes>
      </Router>
    </>
  );
};

export default App;

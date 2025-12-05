// This file is no longer used - the app now uses the LandingPage component
// Keeping for backwards compatibility
import { Navigate } from 'react-router-dom';

function Home() {
  return <Navigate to="/" replace />;
}

export default Home;

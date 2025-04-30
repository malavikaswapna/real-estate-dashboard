import React, { useState, useEffect } from 'react';
import './App.css';
import RealEstateMarketDashboard from './components/RealEstateDashboard';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the dashboard data from the JSON file
    fetch('/dashboard_data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">
          <h1>Loading Real Estate Dashboard...</h1>
          <p>Please wait while we load the data.</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h1>Error Loading Dashboard</h1>
          <p>{error}</p>
          <p>Please make sure dashboard_data.json is in the public folder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {dashboardData ? (
        <RealEstateMarketDashboard dashboardData={dashboardData} />
      ) : (
        <div className="error-message">
          <h1>No Data Available</h1>
          <p>Unable to load dashboard data.</p>
        </div>
      )}
    </div>
  );
}

export default App;
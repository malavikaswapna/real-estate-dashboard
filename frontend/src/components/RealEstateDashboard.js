import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import styles from './RealEstateDashboard.module.css';

const RealEstateMarketDashboard = ({ dashboardData }) => {
  // State management
  const [data, setData] = useState({
    summary: { totalProperties: 0, avgPrice: 0, avgPricePerSqFt: 0, avgDaysOnMarket: 0 },
    cityComparison: [],
    propertyTypeComparison: [],
    predictionModel: { metrics: {}, featureImportance: [], scenarios: [] },
    marketTrends: []
  });
  const [selectedCity, setSelectedCity] = useState('All');
  const [predictionInputs, setPredictionInputs] = useState({
    city: 'San Francisco',
    propertyType: 'Condo',
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    propertyAge: 10
  });
  const [predictedPrice, setPredictedPrice] = useState(0);
  const [activeTab, setActiveTab] = useState('market-overview');

  // Load data from props when component mounts
  useEffect(() => {
    if (dashboardData) {
      setData(dashboardData);
      
      // Make an initial prediction
      const cityData = dashboardData.cityComparison.find(city => city.city === 'San Francisco');
      const typeData = dashboardData.propertyTypeComparison.find(type => type.type === 'Condo');
      
      if (cityData && typeData) {
        calculatePrediction({
          city: 'San Francisco',
          propertyType: 'Condo',
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 1200,
          propertyAge: 10
        });
      }
    }
  }, [dashboardData]);

  // Calculate price prediction based on inputs
  const calculatePrediction = (inputs) => {
    // Find relevant data
    const cityData = data.cityComparison.find(city => city.city === inputs.city);
    const typeData = data.propertyTypeComparison.find(type => type.type === inputs.propertyType);
    
    if (cityData && typeData) {
      // Start with city average price
      let estimatedPrice = cityData.avgPrice;
      
      // Adjust based on property type
      const typePriceRatio = typeData.avgPrice / data.summary.avgPrice;
      estimatedPrice = estimatedPrice * typePriceRatio;
      
      // Adjust based on square footage
      const avgSqFt = 1500; // Approximate average
      const sqFtRatio = inputs.squareFeet / avgSqFt;
      estimatedPrice = estimatedPrice * sqFtRatio;
      
      // Adjust for bedrooms/bathrooms
      const bedroomFactor = 1 + ((inputs.bedrooms - 2) * 0.1);
      const bathroomFactor = 1 + ((inputs.bathrooms - 2) * 0.05);
      estimatedPrice = estimatedPrice * bedroomFactor * bathroomFactor;
      
      // Age adjustment
      const ageFactor = Math.max(0.8, 1 - (inputs.propertyAge / 100));
      estimatedPrice = estimatedPrice * ageFactor;
      
      setPredictedPrice(Math.round(estimatedPrice));
    }
  };

  // Handle prediction input changes
  const handlePredictionInputChange = (field, value) => {
    const updatedInputs = { ...predictionInputs, [field]: value };
    setPredictionInputs(updatedInputs);
    calculatePrediction(updatedInputs);
  };

  // Format functions
  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  const formatPercent = (value) => `${value}%`;

  // Colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const cityColors = {
    'New York': '#FF8042',
    'San Francisco': '#0088FE',
    'Chicago': '#00C49F',
    'Los Angeles': '#FFBB28',
    'Miami': '#8884d8'
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Real Estate Market Analysis Dashboard</h1>
        <p className={styles.dashboardSubtitle}>Interactive analytics and insights for real estate investors and stakeholders</p>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'market-overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('market-overview')}
        >
          Market Overview
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'city-comparison' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('city-comparison')}
        >
          City Comparison
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'property-analysis' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('property-analysis')}
        >
          Property Analysis
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'price-prediction' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('price-prediction')}
        >
          Price Prediction
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'investment-insights' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('investment-insights')}
        >
          Investment Insights
        </button>
      </div>

      {/* Main Dashboard Content */}
      <div>
        {/* Market Overview Tab */}
        {activeTab === 'market-overview' && (
          <>
            {/* Summary Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3 className={styles.statTitle}>Total Properties</h3>
                <p className={styles.statValue}>{data.summary.totalProperties.toLocaleString()}</p>
              </div>
              <div className={styles.statCard}>
                <h3 className={styles.statTitle}>Average Price</h3>
                <p className={styles.statValue}>{formatCurrency(data.summary.avgPrice)}</p>
              </div>
              <div className={styles.statCard}>
                <h3 className={styles.statTitle}>Avg Price / Sq Ft</h3>
                <p className={styles.statValue}>{formatCurrency(data.summary.avgPricePerSqFt)}</p>
              </div>
              <div className={styles.statCard}>
                <h3 className={styles.statTitle}>Avg Days on Market</h3>
                <p className={styles.statValue}>{data.summary.avgDaysOnMarket} days</p>
              </div>
            </div>

            {/* City Price Comparison */}
            <div className={styles.chartContainer}>
              <h2 className={styles.chartTitle}>Average Property Price by City</h2>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.cityComparison}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Average Price']} />
                    <Legend />
                    <Bar dataKey="avgPrice" name="Average Price" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Price per Sq Ft and Days on Market Comparison */}
            <div className={styles.statsGrid}>
              <div className={styles.chartContainer}>
                <h2 className={styles.chartTitle}>Price Per Square Foot by City</h2>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.cityComparison}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Price / Sq Ft']} />
                      <Bar dataKey="avgPricePerSqFt" name="Price per Sq Ft" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className={styles.chartContainer}>
                <h2 className={styles.chartTitle}>Avg Days on Market by City</h2>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.cityComparison}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgDaysOnMarket" name="Days on Market" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Property Type Analysis */}
            <div className={styles.chartContainer}>
              <h2 className={styles.chartTitle}>Property Type Comparison</h2>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.propertyTypeComparison}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="type" width={100} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Average Price']} />
                    <Legend />
                    <Bar dataKey="avgPrice" name="Average Price" fill="#8884d8" />
                    <Bar dataKey="avgPricePerSqFt" name="Price per Sq Ft" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* City Comparison Tab */}
        {activeTab === 'city-comparison' && (
          <>
            <div className={styles.chartContainer}>
              <h2 className={styles.chartTitle}>City Market Comparison</h2>
              <select 
                className={styles.citySelect}
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="All">All Cities</option>
                {data.cityComparison.map(city => (
                  <option key={city.city} value={city.city}>{city.city}</option>
                ))}
              </select>
              
              <div className={styles.statsGrid}>
                <div style={{ height: 300 }}>
                  <h3 className={styles.chartTitle}>Price Growth Rate</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={selectedCity === 'All' 
                        ? data.marketTrends 
                        : data.marketTrends.filter(item => item.city === selectedCity)
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Annual Price Growth']} />
                      <Bar dataKey="priceGrowth" name="Annual Price Growth" fill="#0088FE">
                        {data.marketTrends.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={cityColors[entry.city] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ height: 300 }}>
                  <h3 className={styles.chartTitle}>Affordability Index</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={selectedCity === 'All' 
                        ? data.marketTrends 
                        : data.marketTrends.filter(item => item.city === selectedCity)
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}`, 'Affordability Index (higher is better)']} />
                      <Bar dataKey="affordabilityIndex" name="Affordability" fill="#00C49F">
                        {data.marketTrends.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={cityColors[entry.city] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className={styles.statsGrid}>
                <div style={{ height: 300 }}>
                  <h3 className={styles.chartTitle}>Inventory Change</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={selectedCity === 'All' 
                        ? data.marketTrends 
                        : data.marketTrends.filter(item => item.city === selectedCity)
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Inventory Change']} />
                      <Bar dataKey="inventoryChange" name="Inventory Change" fill="#FFBB28">
                        {data.marketTrends.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={cityColors[entry.city] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ height: 300 }}>
                  <h3 className={styles.chartTitle}>Days on Market Trend</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={selectedCity === 'All' 
                        ? data.marketTrends 
                        : data.marketTrends.filter(item => item.city === selectedCity)
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Days on Market Change']} />
                      <Bar dataKey="daysOnMarketTrend" name="DOM Change" fill="#FF8042">
                        {data.marketTrends.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={cityColors[entry.city] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Property Analysis Tab */}
        {activeTab === 'property-analysis' && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.chartContainer}>
                <h2 className={styles.chartTitle}>Property Type Distribution</h2>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.propertyTypeComparison}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({type, percent}) => `${type}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.propertyTypeComparison.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} properties`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className={styles.chartContainer}>
                <h2 className={styles.chartTitle}>Days on Market by Property Type</h2>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.propertyTypeComparison}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} days`, 'Days on Market']} />
                      <Legend />
                      <Line type="monotone" dataKey="avgDaysOnMarket" name="Days on Market" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className={styles.chartContainer}>
              <h2 className={styles.chartTitle}>Property Price by City and Type</h2>
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.cityComparison.flatMap(city => 
                      data.propertyTypeComparison.map(type => ({
                        cityType: `${city.city} - ${type.type}`,
                        avgPrice: Math.round(city.avgPrice * (type.avgPrice / data.summary.avgPrice))
                      }))
                    )}
                    margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cityType" angle={-45} textAnchor="end" height={100} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`$${parseInt(value).toLocaleString()}`, 'Estimated Average Price']} />
                    <Bar dataKey="avgPrice" name="Estimated Avg Price" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Price Prediction Tab */}
        {activeTab === 'price-prediction' && (
          <>
            <div className={styles.predictionContainer}>
              <div className={styles.predictionForm}>
                <h2 className={styles.chartTitle}>Property Price Predictor</h2>
                <p>Use the form below to predict property prices based on features:</p>
                
                <div className={styles.formGroup}>
                  <label htmlFor="city-input">City</label>
                  <select 
                    id="city-input"
                    className={styles.formSelect}
                    value={predictionInputs.city}
                    onChange={(e) => handlePredictionInputChange('city', e.target.value)}
                  >
                    {data.cityComparison.map(city => (
                      <option key={city.city} value={city.city}>{city.city}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="property-type-input">Property Type</label>
                  <select 
                    id="property-type-input"
                    className={styles.formSelect}
                    value={predictionInputs.propertyType}
                    onChange={(e) => handlePredictionInputChange('propertyType', e.target.value)}
                  >
                    {data.propertyTypeComparison.map(type => (
                      <option key={type.type} value={type.type}>{type.type}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="bedrooms-input">Bedrooms</label>
                  <input 
                    id="bedrooms-input"
                    type="number" 
                    className={styles.formInput}
                    value={predictionInputs.bedrooms}
                    onChange={(e) => handlePredictionInputChange('bedrooms', parseInt(e.target.value))}
                    min="0" 
                    max="10"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="bathrooms-input">Bathrooms</label>
                  <input 
                    id="bathrooms-input"
                    type="number" 
                    className={styles.formInput}
                    value={predictionInputs.bathrooms}
                    onChange={(e) => handlePredictionInputChange('bathrooms', parseFloat(e.target.value))}
                    min="0" 
                    max="10" 
                    step="0.5"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="sqft-input">Square Feet</label>
                  <input 
                    id="sqft-input"
                    type="number" 
                    className={styles.formInput}
                    value={predictionInputs.squareFeet}
                    onChange={(e) => handlePredictionInputChange('squareFeet', parseInt(e.target.value))}
                    min="100" 
                    max="10000"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="age-input">Property Age (years)</label>
                  <input 
                    id="age-input"
                    type="number" 
                    className={styles.formInput}
                    value={predictionInputs.propertyAge}
                    onChange={(e) => handlePredictionInputChange('propertyAge', parseInt(e.target.value))}
                    min="0" 
                    max="150"
                  />
                </div>
              </div>
              
              <div className={styles.predictionResult}>
                <h2 className={styles.chartTitle}>Predicted Price</h2>
                <div className={styles.predictedPrice}>
                  {formatCurrency(predictedPrice)}
                </div>
                
                <div className={styles.modelMetrics}>
                  <h3 className={styles.chartTitle}>Model Performance</h3>
                  <p><span className={styles.metricTitle}>R² Score:</span> {data.predictionModel?.metrics?.rSquared?.toFixed(2) || 0}</p>
                  <p><span className={styles.metricTitle}>RMSE:</span> {formatCurrency(data.predictionModel?.metrics?.rmse || 0)}</p>
                </div>
              </div>
            </div>
            
            <div className={styles.statsGrid}>
              <div className={styles.chartContainer}>
                <h2 className={styles.chartTitle}>Feature Importance</h2>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.predictionModel?.featureImportance || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="feature" width={150} />
                      <Tooltip formatter={(value) => [`${value}`, 'Importance Score']} />
                      <Bar dataKey="importance" name="Importance" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className={styles.chartContainer}>
                <h2 className={styles.chartTitle}>Sample Price Predictions</h2>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Scenario</th>
                        <th>City</th>
                        <th>Type</th>
                        <th>Beds/Baths</th>
                        <th>Sq Ft</th>
                        <th>Predicted Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.predictionModel?.scenarios?.map((scenario, index) => (
                        <tr key={index} className={index % 2 === 0 ? styles.evenRow : ""}>
                          <td>{scenario.name}</td>
                          <td>{scenario.city}</td>
                          <td>{scenario.propertyType}</td>
                          <td>{scenario.bedrooms}/{scenario.bathrooms}</td>
                          <td>{scenario.squareFeet.toLocaleString()}</td>
                          <td className={styles.metricValue}>{formatCurrency(scenario.predictedPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Investment Insights Tab */}
        {activeTab === 'investment-insights' && (
          <>
            <div className={styles.chartContainer}>
              <h2 className={styles.chartTitle}>Investment Opportunity Score</h2>
              <p>Comparative analysis of investment potential across cities based on price growth, affordability, and market dynamics.</p>
              
              <div style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={150} data={data.marketTrends}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="city" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Price Growth" dataKey="priceGrowth" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
                    <Radar name="Affordability" dataKey="affordabilityIndex" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.5} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className={styles.statsGrid}>
              <div className={styles.chartContainer}>
                <h2 className={styles.chartTitle}>Price Growth vs. Affordability</h2>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.marketTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="priceGrowth" name="Price Growth %" stroke="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="affordabilityIndex" name="Affordability" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className={styles.chartContainer}>
                <h2 className={styles.chartTitle}>City Investment Recommendation</h2>
                <div className={styles.insightCard}>
                  <h3 className={styles.insightTitle}>Top Investment Pick</h3>
                  <p>Based on our analysis of price growth, affordability, and market dynamics, the top city for real estate investment is:</p>
                  <p className={styles.predictedPrice}>
                    {data.marketTrends
                      .sort((a, b) => 
                        (parseFloat(b.priceGrowth) * 2 + parseFloat(b.affordabilityIndex)) - 
                        (parseFloat(a.priceGrowth) * 2 + parseFloat(a.affordabilityIndex))
                      )[0]?.city || 'Loading...'}
                  </p>
                  <p>
                    Price Growth: {data.marketTrends
                      .sort((a, b) => 
                        (parseFloat(b.priceGrowth) * 2 + parseFloat(b.affordabilityIndex)) - 
                        (parseFloat(a.priceGrowth) * 2 + parseFloat(a.affordabilityIndex))
                      )[0]?.priceGrowth || '0'}% | 
                    Affordability Index: {data.marketTrends
                      .sort((a, b) => 
                        (parseFloat(b.priceGrowth) * 2 + parseFloat(b.affordabilityIndex)) - 
                        (parseFloat(a.priceGrowth) * 2 + parseFloat(a.affordabilityIndex))
                      )[0]?.affordabilityIndex || '0'}
                  </p>
                </div>
                
                <h3 className={styles.chartTitle}>Investment Strategy Recommendations</h3>
                <ul className={styles.strategyList}>
                  <li>Focus on properties in neighborhoods with below-average days on market and above-average price growth.</li>
                  <li>Consider {data.propertyTypeComparison.sort((a, b) => b.avgPricePerSqFt - a.avgPricePerSqFt)[0]?.type || 'Loading...'} properties for highest price per square foot returns.</li>
                  <li>For long-term holds, prioritize cities with strong price growth and moderate affordability.</li>
                  <li>Short-term flips may perform better in markets with high sales volume trends and shorter days on market.</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className={styles.footer}>
        <p>Real Estate Market Analysis Dashboard | Data Analytics Portfolio Project</p>
      </div>
    </div>
  );
};

export default RealEstateMarketDashboard;
# Real Estate Market Analysis - Fixed Data Processing Script
# This script generates and analyzes real estate data without requiring external database connections

import os
import random
from datetime import datetime, timedelta

# Try to import required packages
try:
    import numpy as np
    import pandas as pd
    import matplotlib.pyplot as plt
    import seaborn as sns
    from sklearn.model_selection import train_test_split
    from sklearn.linear_model import LinearRegression
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.metrics import mean_squared_error, r2_score
except ImportError as e:
    print(f"Error: Could not import required package: {e}")
    print("Please install the missing package with:")
    print("  pip3 install numpy pandas matplotlib seaborn scikit-learn")
    exit(1)

print("Real Estate Market Analysis - Data Processing and Analysis")
print("=" * 65)

# Step 1: Generate synthetic real estate data
def generate_real_estate_data(num_properties=1000):
    """Generate synthetic real estate data"""
    print(f"Generating synthetic dataset with {num_properties} properties...")
    
    # Cities with neighborhoods
    cities = {
        "New York": ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"],
        "San Francisco": ["Mission District", "SoMa", "Pacific Heights", "Marina", "Noe Valley"],
        "Chicago": ["Loop", "Lincoln Park", "Wicker Park", "Hyde Park", "River North"],
        "Los Angeles": ["Downtown", "Hollywood", "Venice", "Silver Lake", "Beverly Hills"],
        "Miami": ["Downtown", "South Beach", "Brickell", "Wynwood", "Coconut Grove"]
    }
    
    property_types = ["Apartment", "Condo", "House", "Townhouse", "Duplex"]
    
    data = []
    today = datetime.now()
    one_year_ago = today - timedelta(days=365)
    
    # Base prices by city (approximate median home prices)
    city_prices = {
        "New York": 800000,
        "San Francisco": 900000,
        "Chicago": 350000,
        "Los Angeles": 700000,
        "Miami": 450000
    }
    
    # Multipliers by property type
    property_multipliers = {
        "Apartment": 0.8,
        "Condo": 1.0,
        "House": 1.5,
        "Townhouse": 1.2,
        "Duplex": 1.3
    }
    
    for i in range(1, num_properties + 1):
        # Select random city and neighborhood
        city = random.choice(list(cities.keys()))
        neighborhood = random.choice(cities[city])
        
        # Select random property type
        property_type = random.choice(property_types)
        
        # Determine bedrooms (0-5)
        bedrooms = random.randint(0, 5)
        
        # Calculate price based on city, property type, and bedrooms
        base_price = city_prices[city]
        type_multiplier = property_multipliers[property_type]
        bedroom_multiplier = 1 + (bedrooms * 0.15)
        
        # Add randomness to price
        price = round(base_price * type_multiplier * bedroom_multiplier * random.uniform(0.85, 1.15))
        
        # Calculate square footage based on property type and bedrooms
        base_sqft = 600 if property_type in ["Apartment", "Condo"] else 1200
        square_feet = round((base_sqft + (bedrooms * 250)) * random.uniform(0.9, 1.1))
        
        # Calculate price per square foot
        price_per_sqft = round(price / square_feet)
        
        # Generate random year built (1920-2023)
        year_built = random.randint(1920, 2023)
        
        # Newer buildings in certain cities
        if city in ["Miami", "San Francisco"]:
            year_built = max(1960, year_built)
        
        # Generate random listing date in past year
        days_ago = random.randint(0, 364)
        listing_date = (today - timedelta(days=days_ago)).strftime("%Y-%m-%d")
        
        # Random days on market (more recent listings have fewer days)
        days_on_market = round(days_ago * random.uniform(0.1, 1.0))
        
        # Random coordinates (just for visualization)
        # These are approximate centers of each city with some randomness
        city_coordinates = {
            "New York": (40.7128, -74.0060),
            "San Francisco": (37.7749, -122.4194),
            "Chicago": (41.8781, -87.6298),
            "Los Angeles": (34.0522, -118.2437),
            "Miami": (25.7617, -80.1918)
        }
        
        base_lat, base_lng = city_coordinates[city]
        latitude = base_lat + random.uniform(-0.05, 0.05)
        longitude = base_lng + random.uniform(-0.05, 0.05)
        
        # Add property to dataset
        data.append({
            "id": i,
            "city": city,
            "neighborhood": neighborhood,
            "property_type": property_type,
            "bedrooms": bedrooms,
            "bathrooms": random.randint(1, bedrooms + 1),
            "square_feet": square_feet,
            "price": price,
            "year_built": year_built,
            "days_on_market": days_on_market,
            "latitude": latitude,
            "longitude": longitude,
            "listing_date": listing_date,
            "price_per_sqft": price_per_sqft
        })
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    return df

# Step 2: Clean and prepare data
def clean_and_prepare_data(df):
    """Clean and prepare data for analysis"""
    print("Cleaning and preparing data...")
    
    # Calculate property age
    current_year = datetime.now().year
    df['property_age'] = current_year - df['year_built']
    
    # Create price tier categories
    def assign_price_tier(price):
        if price < 500000:
            return 'Budget'
        elif price < 1000000:
            return 'Mid-Range'
        else:
            return 'Luxury'
    
    df['price_tier'] = df['price'].apply(assign_price_tier)
    
    # Remove outliers using IQR method
    def remove_outliers(data, field):
        Q1 = data[field].quantile(0.25)
        Q3 = data[field].quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        filtered_data = data[(data[field] >= lower_bound) & (data[field] <= upper_bound)]
        print(f"Removed {len(data) - len(filtered_data)} outliers for {field}")
        return filtered_data
    
    # Remove outliers from price and square footage
    df = remove_outliers(df, 'price')
    df = remove_outliers(df, 'square_feet')
    
    print(f"Data cleaning complete. {len(df)} properties remaining.")
    return df

# Step 3: Perform exploratory data analysis
def perform_eda(df):
    """Perform exploratory data analysis"""
    print("Performing exploratory data analysis...")
    
    # Overall statistics
    print("\nOverall Market Statistics:")
    print(f"Total properties: {len(df)}")
    print(f"Average price: ${df['price'].mean():.2f}")
    print(f"Average price per sq ft: ${df['price_per_sqft'].mean():.2f}")
    print(f"Average days on market: {df['days_on_market'].mean():.1f}")
    
    # City statistics
    print("\nStatistics by City:")
    city_stats = df.groupby('city').agg({
        'price': ['count', 'mean', 'median'],
        'price_per_sqft': 'mean',
        'days_on_market': 'mean'
    })
    print(city_stats)
    
    # Property type statistics
    print("\nStatistics by Property Type:")
    type_stats = df.groupby('property_type').agg({
        'price': ['count', 'mean', 'median'],
        'price_per_sqft': 'mean',
        'days_on_market': 'mean'
    })
    print(type_stats)
    
    # Correlation analysis
    print("\nPrice Correlation with Features:")
    numeric_columns = ['bedrooms', 'bathrooms', 'square_feet', 'property_age', 
                       'days_on_market', 'price_per_sqft', 'price']
    correlation = df[numeric_columns].corr()['price'].sort_values(ascending=False)
    print(correlation)
    
    # Create visualization directory
    os.makedirs('visualizations', exist_ok=True)
    
    # Create some visualizations
    plt.figure(figsize=(10, 6))
    sns.barplot(x='city', y='price', data=df)
    plt.title('Average Price by City')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('visualizations/price_by_city.png')
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x='property_type', y='price', data=df)
    plt.title('Average Price by Property Type')
    plt.tight_layout()
    plt.savefig('visualizations/price_by_type.png')
    
    plt.figure(figsize=(10, 6))
    sns.scatterplot(x='square_feet', y='price', hue='city', data=df)
    plt.title('Price vs Square Feet by City')
    plt.tight_layout()
    plt.savefig('visualizations/price_vs_sqft.png')
    
    print("Visualizations saved to 'visualizations' directory")
    return correlation

# Step 4: Build price prediction model
def build_price_prediction_model(df):
    """Build a machine learning model to predict property prices"""
    print("Building property price prediction model...")
    
    # Define features and target
    X = df[['bedrooms', 'bathrooms', 'square_feet', 'property_age']]
    y = df['price']
    
    # Create dummy variables for city and property type
    city_dummies = pd.get_dummies(df['city'], prefix='city')
    type_dummies = pd.get_dummies(df['property_type'], prefix='type')
    
    # Combine all features
    X = pd.concat([X, city_dummies, type_dummies], axis=1)
    
    # Split into training and testing sets (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Training set size: {len(X_train)}, Testing set size: {len(X_test)}")
    
    # Train linear regression model
    linear_model = LinearRegression()
    linear_model.fit(X_train, y_train)
    
    # Evaluate linear model
    y_pred_linear = linear_model.predict(X_test)
    linear_rmse = np.sqrt(mean_squared_error(y_test, y_pred_linear))
    linear_r2 = r2_score(y_test, y_pred_linear)
    
    print(f"Linear Regression Results:")
    print(f"RMSE: ${linear_rmse:.2f}")
    print(f"R² Score: {linear_r2:.4f}")
    
    # Train random forest model
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    
    # Evaluate random forest model
    y_pred_rf = rf_model.predict(X_test)
    rf_rmse = np.sqrt(mean_squared_error(y_test, y_pred_rf))
    rf_r2 = r2_score(y_test, y_pred_rf)
    
    print(f"Random Forest Results:")
    print(f"RMSE: ${rf_rmse:.2f}")
    print(f"R² Score: {rf_r2:.4f}")
    
    # Get feature importance from random forest
    feature_importance = pd.DataFrame({
        'Feature': X.columns,
        'Importance': rf_model.feature_importances_
    }).sort_values('Importance', ascending=False)
    
    print("\nTop 10 Most Important Features:")
    print(feature_importance.head(10))
    
    # Save feature importance visualization
    plt.figure(figsize=(12, 6))
    sns.barplot(x='Importance', y='Feature', data=feature_importance.head(10))
    plt.title('Feature Importance for Property Price Prediction')
    plt.tight_layout()
    plt.savefig('visualizations/feature_importance.png')
    
    # Choose the better model
    if rf_r2 > linear_r2:
        print("\nRandom Forest model performs better and will be used for predictions")
        final_model = rf_model
        model_metrics = {
            "rmse": int(rf_rmse),
            "rSquared": float(rf_r2)
        }
    else:
        print("\nLinear Regression model performs better and will be used for predictions")
        final_model = linear_model
        model_metrics = {
            "rmse": int(linear_rmse),
            "rSquared": float(linear_r2)
        }
    
    return final_model, X.columns, feature_importance, model_metrics

# Step 5: Generate dashboard data file
def generate_dashboard_data(df, model, feature_names, feature_importance, model_metrics):
    """Generate data for the dashboard"""
    print("Generating dashboard data...")
    
    # Calculate city metrics
    city_metrics = []
    for city in df['city'].unique():
        city_data = df[df['city'] == city]
        
        # Simulate price growth (would come from time series data in real app)
        price_growth = round(random.uniform(1, 8), 1)
        inventory_change = round(random.uniform(-15, 10), 1)
        dom_trend = round(random.uniform(-20, 15), 1)
        sales_trend = round(random.uniform(-10, 15), 1)
        
        city_metrics.append({
            "city": city,
            "count": len(city_data),
            "avgPrice": int(city_data['price'].mean()),
            "avgPricePerSqFt": int(city_data['price_per_sqft'].mean()),
            "avgDaysOnMarket": int(city_data['days_on_market'].mean()),
            "priceGrowth": price_growth,
            "inventoryChange": inventory_change,
            "daysOnMarketTrend": dom_trend,
            "salesVolumeTrend": sales_trend,
            "affordabilityIndex": round(100 - ((city_data['price'].mean() / 1000000) * 50), 1)
        })
    
    # Calculate property type metrics
    property_metrics = []
    for prop_type in df['property_type'].unique():
        type_data = df[df['property_type'] == prop_type]
        
        property_metrics.append({
            "type": prop_type,
            "count": len(type_data),
            "avgPrice": int(type_data['price'].mean()),
            "avgPricePerSqFt": int(type_data['price_per_sqft'].mean()),
            "avgDaysOnMarket": int(type_data['days_on_market'].mean())
        })
    
    # Generate sample predictions
    prediction_samples = [
        {
            "name": "Luxury SF Condo",
            "city": "San Francisco",
            "propertyType": "Condo",
            "bedrooms": 3,
            "bathrooms": 2,
            "squareFeet": 1800,
            "propertyAge": 5
        },
        {
            "name": "Mid-range Chicago House",
            "city": "Chicago",
            "propertyType": "House", 
            "bedrooms": 4,
            "bathrooms": 2,
            "squareFeet": 2200,
            "propertyAge": 30
        },
        {
            "name": "NYC Studio Apartment",
            "city": "New York",
            "propertyType": "Apartment",
            "bedrooms": 0,
            "bathrooms": 1,
            "squareFeet": 500,
            "propertyAge": 15
        }
    ]
    
    # Make predictions for samples
    for sample in prediction_samples:
        # Create input features for prediction
        pred_features = pd.DataFrame({
            'bedrooms': [sample['bedrooms']],
            'bathrooms': [sample['bathrooms']],
            'square_feet': [sample['squareFeet']],
            'property_age': [sample['propertyAge']]
        })
        
        # Add dummy variables for city and property type
        for city in df['city'].unique():
            pred_features[f'city_{city}'] = 1 if sample['city'] == city else 0
            
        for prop_type in df['property_type'].unique():
            pred_features[f'type_{prop_type}'] = 1 if sample['propertyType'] == prop_type else 0
        
        # Ensure the feature columns are in the same order as the training data
        columns_to_use = [col for col in feature_names if col in pred_features.columns]
        pred_features = pred_features[columns_to_use]
        
        # Fill any missing columns with zeros
        for col in feature_names:
            if col not in pred_features.columns:
                pred_features[col] = 0
                
        # Reorder columns to match the training data
        pred_features = pred_features[feature_names]
                
        # Make prediction
        try:
            price_prediction = model.predict(pred_features)[0]
            sample['predictedPrice'] = int(price_prediction)
        except Exception as e:
            print(f"Warning: Could not predict price for {sample['name']}: {e}")
            sample['predictedPrice'] = int(df['price'].mean())  # Fallback to mean price
    
    # Create dashboard data object
    dashboard_data = {
        "summary": {
            "totalProperties": len(df),
            "avgPrice": int(df['price'].mean()),
            "avgPricePerSqFt": int(df['price_per_sqft'].mean()),
            "avgDaysOnMarket": int(df['days_on_market'].mean())
        },
        "cityComparison": city_metrics,
        "propertyTypeComparison": property_metrics,
        "predictionModel": {
            "metrics": model_metrics,
            "featureImportance": [
                {"feature": row['Feature'], "importance": int(row['Importance'] * 100)}
                for _, row in feature_importance.head(8).iterrows()
            ],
            "scenarios": prediction_samples
        },
        "marketTrends": city_metrics
    }
    
    # Save to JSON file for the dashboard
    import json
    with open('dashboard_data.json', 'w') as f:
        json.dump(dashboard_data, f, indent=2)
    
    print("Dashboard data saved to 'dashboard_data.json'")
    
    # Print sample predictions
    print("\nSample Price Predictions:")
    for sample in prediction_samples:
        print(f"{sample['name']}: ${sample['predictedPrice']:,}")

# Main function
def main():
    # Step 1: Generate data
    df = generate_real_estate_data(1000)
    
    # Step 2: Clean and prepare data
    df_cleaned = clean_and_prepare_data(df)
    
    # Step 3: Perform exploratory data analysis
    correlation = perform_eda(df_cleaned)
    
    # Step 4: Build price prediction model
    model, feature_names, feature_importance, model_metrics = build_price_prediction_model(df_cleaned)
    
    # Step 5: Generate dashboard data
    generate_dashboard_data(df_cleaned, model, feature_names, feature_importance, model_metrics)
    
    print("\nReal Estate Market Analysis complete!")
    print("You can now use the dashboard_data.json file with the React dashboard.")

if __name__ == "__main__":
    main()
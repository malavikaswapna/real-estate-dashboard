-- Real Estate Market Analysis - Database Schema
-- This script creates the necessary tables to store real estate data for analysis

-- Create the database
CREATE DATABASE IF NOT EXISTS real_estate_market;
USE real_estate_market;

-- Cities table
CREATE TABLE cities (
    city_id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(50) NOT NULL,
    state VARCHAR(2) NOT NULL,
    population INT,
    median_income DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Neighborhoods table
CREATE TABLE neighborhoods (
    neighborhood_id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    neighborhood_name VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10),
    median_price_per_sqft DECIMAL(10, 2),
    avg_days_on_market INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(city_id)
);

-- Property Types table
CREATE TABLE property_types (
    property_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    neighborhood_id INT NOT NULL,
    property_type_id INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    bedrooms INT,
    bathrooms DECIMAL(3, 1),
    square_feet INT,
    year_built INT,
    list_price DECIMAL(12, 2),
    price_per_sqft DECIMAL(8, 2),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    listing_date DATE,
    days_on_market INT,
    status ENUM('Active', 'Pending', 'Sold', 'Expired', 'Withdrawn') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(city_id),
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(neighborhood_id),
    FOREIGN KEY (property_type_id) REFERENCES property_types(property_type_id)
);

-- Property Sales table
CREATE TABLE property_sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    sale_price DECIMAL(12, 2) NOT NULL,
    sale_date DATE NOT NULL,
    days_on_market INT,
    seller_concession DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id)
);

-- Market Metrics table (for storing historical market data)
CREATE TABLE market_metrics (
    metric_id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    neighborhood_id INT,
    property_type_id INT,
    metric_date DATE NOT NULL,
    avg_price DECIMAL(12, 2),
    median_price DECIMAL(12, 2),
    avg_price_per_sqft DECIMAL(8, 2),
    avg_days_on_market INT,
    inventory_count INT,
    new_listings INT,
    closed_sales INT,
    price_growth_pct DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(city_id),
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(neighborhood_id),
    FOREIGN KEY (property_type_id) REFERENCES property_types(property_type_id)
);

-- Insert sample data
-- Cities
INSERT INTO cities (city_name, state, population, median_income) VALUES
('New York', 'NY', 8336817, 68400.00),
('San Francisco', 'CA', 874961, 119136.00),
('Chicago', 'IL', 2746388, 62097.00),
('Los Angeles', 'CA', 3979576, 65290.00),
('Miami', 'FL', 467963, 43860.00);

-- Property Types
INSERT INTO property_types (type_name) VALUES
('Apartment'),
('Condo'),
('House'),
('Townhouse'),
('Duplex');
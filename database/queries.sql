-- Real Estate Market Analysis - SQL Queries
-- These queries would power the dashboard and provide the necessary analytics

-- 1. Dashboard Summary Statistics
SELECT 
    COUNT(*) AS total_properties,
    ROUND(AVG(list_price), 2) AS avg_price,
    ROUND(AVG(price_per_sqft), 2) AS avg_price_per_sqft,
    ROUND(AVG(days_on_market), 0) AS avg_days_on_market
FROM properties
WHERE status IN ('Active', 'Pending');

-- 2. City Comparison
SELECT 
    c.city_name,
    COUNT(p.property_id) AS property_count,
    ROUND(AVG(p.list_price), 2) AS avg_price,
    ROUND(AVG(p.price_per_sqft), 2) AS avg_price_per_sqft,
    ROUND(AVG(p.days_on_market), 0) AS avg_days_on_market,
    ROUND(AVG(m.price_growth_pct), 1) AS price_growth,
    -- Calculate affordability index (example formula)
    ROUND(100 - ((AVG(p.list_price) / 1000000) * 50), 1) AS affordability_index
FROM 
    properties p
JOIN 
    cities c ON p.city_id = c.city_id
LEFT JOIN 
    market_metrics m ON p.city_id = m.city_id AND m.neighborhood_id IS NULL AND m.property_type_id IS NULL
WHERE 
    p.status IN ('Active', 'Pending')
    AND m.metric_date = (SELECT MAX(metric_date) FROM market_metrics)
GROUP BY 
    c.city_id, c.city_name;

-- 3. Property Type Statistics
SELECT 
    pt.type_name,
    COUNT(p.property_id) AS property_count,
    ROUND(AVG(p.list_price), 2) AS avg_price,
    ROUND(AVG(p.price_per_sqft), 2) AS avg_price_per_sqft,
    ROUND(AVG(p.days_on_market), 0) AS avg_days_on_market
FROM 
    properties p
JOIN 
    property_types pt ON p.property_type_id = pt.property_type_id
WHERE 
    p.status IN ('Active', 'Pending')
GROUP BY 
    pt.property_type_id, pt.type_name;

-- 4. Neighborhood Analysis
SELECT 
    c.city_name,
    n.neighborhood_name,
    COUNT(p.property_id) AS property_count,
    ROUND(AVG(p.list_price), 2) AS avg_price,
    ROUND(AVG(p.price_per_sqft), 2) AS avg_price_per_sqft,
    ROUND(AVG(p.days_on_market), 0) AS avg_days_on_market,
    -- Calculate investment score
    ROUND(
        (AVG(p.price_per_sqft) / 100) * 
        (1 / (AVG(p.days_on_market) / 30 + 0.5)) * 100
    ) AS investment_score
FROM 
    properties p
JOIN 
    neighborhoods n ON p.neighborhood_id = n.neighborhood_id
JOIN 
    cities c ON p.city_id = c.city_id
WHERE 
    p.status IN ('Active', 'Pending')
GROUP BY 
    c.city_id, c.city_name, n.neighborhood_id, n.neighborhood_name
ORDER BY 
    investment_score DESC;

-- 5. Price Distribution
SELECT 
    CASE 
        WHEN list_price < 500000 THEN 'Under $500k'
        WHEN list_price < 750000 THEN '$500k-$750k'
        WHEN list_price < 1000000 THEN '$750k-$1M'
        WHEN list_price < 1500000 THEN '$1M-$1.5M'
        WHEN list_price < 2000000 THEN '$1.5M-$2M'
        ELSE 'Over $2M'
    END AS price_range,
    COUNT(*) AS property_count
FROM 
    properties
WHERE 
    status IN ('Active', 'Pending')
GROUP BY 
    price_range
ORDER BY 
    FIELD(
        price_range, 
        'Under $500k', 
        '$500k-$750k', 
        '$750k-$1M', 
        '$1M-$1.5M', 
        '$1.5M-$2M', 
        'Over $2M'
    );

-- 6. Price per Square Foot by Bedrooms
SELECT 
    bedrooms,
    ROUND(AVG(price_per_sqft), 2) AS avg_price_per_sqft
FROM 
    properties
WHERE 
    status IN ('Active', 'Pending')
    AND bedrooms BETWEEN 0 AND 5
GROUP BY 
    bedrooms
ORDER BY 
    bedrooms;

-- 7. Property Age Analysis
SELECT 
    CASE 
        WHEN (YEAR(CURRENT_DATE()) - year_built) < 10 THEN 'Less than 10 years'
        WHEN (YEAR(CURRENT_DATE()) - year_built) < 30 THEN '10-30 years'
        WHEN (YEAR(CURRENT_DATE()) - year_built) < 50 THEN '31-50 years'
        WHEN (YEAR(CURRENT_DATE()) - year_built) < 75 THEN '51-75 years'
        ELSE 'Over 75 years'
    END AS age_range,
    COUNT(*) AS property_count,
    ROUND(AVG(list_price), 2) AS avg_price
FROM 
    properties
WHERE 
    status IN ('Active', 'Pending')
GROUP BY 
    age_range
ORDER BY 
    FIELD(
        age_range, 
        'Less than 10 years', 
        '10-30 years', 
        '31-50 years', 
        '51-75 years', 
        'Over 75 years'
    );

-- 8. Market Trends by City
SELECT 
    c.city_name,
    m.price_growth_pct AS price_growth,
    -- Calculate inventory change as a percentage
    (m.inventory_count - previous_m.inventory_count) / previous_m.inventory_count * 100 AS inventory_change,
    -- Calculate days on market trend as a percentage change
    (m.avg_days_on_market - previous_m.avg_days_on_market) / previous_m.avg_days_on_market * 100 AS days_on_market_trend,
    -- Calculate sales volume trend as a percentage change
    (m.closed_sales - previous_m.closed_sales) / previous_m.closed_sales * 100 AS sales_volume_trend,
    -- Calculate affordability index
    100 - ((m.avg_price / 1000000) * 50) AS affordability_index
FROM 
    market_metrics m
JOIN 
    cities c ON m.city_id = c.city_id
JOIN 
    market_metrics previous_m ON m.city_id = previous_m.city_id 
    AND previous_m.metric_date = DATE_SUB(m.metric_date, INTERVAL 1 MONTH)
    AND previous_m.neighborhood_id IS NULL 
    AND previous_m.property_type_id IS NULL
WHERE 
    m.neighborhood_id IS NULL 
    AND m.property_type_id IS NULL
    AND m.metric_date = (SELECT MAX(metric_date) FROM market_metrics)
ORDER BY 
    c.city_name;

-- 9. Historical Price Trends
SELECT 
    c.city_name,
    DATE_FORMAT(m.metric_date, '%Y-%m') AS month_year,
    m.avg_price,
    m.avg_price_per_sqft
FROM 
    market_metrics m
JOIN 
    cities c ON m.city_id = c.city_id
WHERE 
    m.neighborhood_id IS NULL 
    AND m.property_type_id IS NULL
    AND m.metric_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 24 MONTH)
ORDER BY 
    c.city_name, m.metric_date;

-- 10. Feature Correlation with Price (this would typically be handled in your application code)
-- But here's an example of how you might calculate some basic correlations in SQL
-- Note: This is a simplified approximation as true correlation calculation is more complex

-- For square feet and price
SELECT 
    (
        COUNT(*) * SUM(square_feet * list_price) - SUM(square_feet) * SUM(list_price)
    ) / 
    (
        SQRT(COUNT(*) * SUM(square_feet * square_feet) - SUM(square_feet) * SUM(square_feet)) *
        SQRT(COUNT(*) * SUM(list_price * list_price) - SUM(list_price) * SUM(list_price))
    ) AS sqft_price_correlation
FROM 
    properties
WHERE 
    status IN ('Active', 'Pending', 'Sold');

-- For bedrooms and price
SELECT 
    (
        COUNT(*) * SUM(bedrooms * list_price) - SUM(bedrooms) * SUM(list_price)
    ) / 
    (
        SQRT(COUNT(*) * SUM(bedrooms * bedrooms) - SUM(bedrooms) * SUM(bedrooms)) *
        SQRT(COUNT(*) * SUM(list_price * list_price) - SUM(list_price) * SUM(list_price))
    ) AS bedroom_price_correlation
FROM 
    properties
WHERE 
    status IN ('Active', 'Pending', 'Sold');

-- 11. Price Prediction Data Extraction (for model training)
-- This would extract the data needed to train a price prediction model
SELECT 
    p.square_feet,
    p.bedrooms,
    p.bathrooms,
    (YEAR(CURRENT_DATE()) - p.year_built) AS property_age,
    c.city_name,
    pt.type_name,
    ps.sale_price AS actual_price
FROM 
    property_sales ps
JOIN 
    properties p ON ps.property_id = p.property_id
JOIN 
    cities c ON p.city_id = c.city_id
JOIN 
    property_types pt ON p.property_type_id = pt.property_type_id
WHERE 
    ps.sale_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
ORDER BY 
    ps.sale_date DESC;
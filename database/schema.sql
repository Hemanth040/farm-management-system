-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('farmer', 'supervisor', 'worker')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farmers Table
CREATE TABLE farmers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    land_size DECIMAL(10,2),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reminders Table
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    crop_id INTEGER REFERENCES crops(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crops Table
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id),
    name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    sowing_date DATE,
    expected_harvest_date DATE,
    area DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'growing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities Table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id),
    crop_id INTEGER REFERENCES crops(id),
    type VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'planned',
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources Table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id),
    type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    threshold DECIMAL(10,2),
    last_updated DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workers Table
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    wage_type VARCHAR(50),
    daily_wage DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES workers(id),
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    hours_worked DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(worker_id, date)
);

-- Financial Transactions Table
CREATE TABLE financial_transactions (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    crop_id INTEGER REFERENCES crops(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Table
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id),
    crop_id INTEGER REFERENCES crops(id),
    buyer_name VARCHAR(255),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    price_per_unit DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    sale_date DATE,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disease Database Table
CREATE TABLE diseases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    crop VARCHAR(100),
    symptoms TEXT,
    causes TEXT,
    treatment TEXT,
    prevention TEXT,
    organic_alternatives TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather Alerts Table
CREATE TABLE weather_alerts (
    id SERIAL PRIMARY KEY,
    region VARCHAR(255),
    alert_type VARCHAR(100),
    severity VARCHAR(50),
    message TEXT,
    valid_from TIMESTAMP,
    valid_to TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Government Schemes Table
CREATE TABLE government_schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    eligibility TEXT,
    benefits TEXT,
    deadline DATE,
    application_link VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    file_url VARCHAR(500),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
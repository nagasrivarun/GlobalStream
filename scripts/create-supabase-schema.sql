-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, price, features, is_popular) VALUES
('Basic', 'Basic streaming plan', 9.99, ARRAY['HD Quality', '1 Device', 'Limited Content'], false),
('Standard', 'Standard streaming plan', 15.99, ARRAY['Full HD Quality', '2 Devices', 'Full Content Library'], true),
('Premium', 'Premium streaming plan', 21.99, ARRAY['4K Quality', '4 Devices', 'Full Content + Exclusives'], false)
ON CONFLICT DO NOTHING;

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  hashed_password TEXT,
  role VARCHAR(50) DEFAULT 'USER',
  subscription_status VARCHAR(50) DEFAULT 'FREE',
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- MOVIE, SHOW, SPORT
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  release_year INTEGER,
  duration INTEGER, -- in minutes
  maturity_rating VARCHAR(10),
  featured BOOLEAN DEFAULT false,
  trending BOOLEAN DEFAULT false,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_content table (watchlist)
CREATE TABLE IF NOT EXISTS user_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  progress DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

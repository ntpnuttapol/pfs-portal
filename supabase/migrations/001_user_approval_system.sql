-- User Approval & Role Assignment System
-- Run this in Supabase SQL Editor

-- 1. Add status column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'suspended'));

-- 2. Create user_requests table (for tracking signup requests)
CREATE TABLE IF NOT EXISTS user_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL, -- Store temporarily for approval
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES profiles(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_system_roles table (role per system)
CREATE TABLE IF NOT EXISTS user_system_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    system_id VARCHAR(50) NOT NULL, -- 'moldshop', 'polyfoam', 'booking', etc.
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer', 'none')),
    granted_by UUID REFERENCES profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, system_id)
);

-- 4. Enable RLS
ALTER TABLE user_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_system_roles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for user_requests
CREATE POLICY "user_requests_select_admin" 
ON user_requests FOR SELECT 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "user_requests_insert_public" 
ON user_requests FOR INSERT 
TO PUBLIC WITH CHECK (true);

CREATE POLICY "user_requests_update_admin" 
ON user_requests FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 6. RLS Policies for user_system_roles
CREATE POLICY "user_system_roles_select_own" 
ON user_system_roles FOR SELECT 
USING (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "user_system_roles_insert_admin" 
ON user_system_roles FOR INSERT 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "user_system_roles_update_admin" 
ON user_system_roles FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "user_system_roles_delete_admin" 
ON user_system_roles FOR DELETE 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 7. Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_system_roles_updated_at 
BEFORE UPDATE ON user_system_roles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert default system roles for existing active users (give 'viewer' to all systems)
INSERT INTO user_system_roles (user_id, system_id, role)
SELECT p.id, 'moldshop', 'viewer'
FROM profiles p
WHERE p.status = 'active' OR p.status IS NULL
ON CONFLICT (user_id, system_id) DO NOTHING;

INSERT INTO user_system_roles (user_id, system_id, role)
SELECT p.id, 'polyfoam', 'viewer'
FROM profiles p
WHERE p.status = 'active' OR p.status IS NULL
ON CONFLICT (user_id, system_id) DO NOTHING;

INSERT INTO user_system_roles (user_id, system_id, role)
SELECT p.id, 'booking', 'viewer'
FROM profiles p
WHERE p.status = 'active' OR p.status IS NULL
ON CONFLICT (user_id, system_id) DO NOTHING;

INSERT INTO user_system_roles (user_id, system_id, role)
SELECT p.id, 'moneytrack', 'viewer'
FROM profiles p
WHERE p.status = 'active' OR p.status IS NULL
ON CONFLICT (user_id, system_id) DO NOTHING;

-- 9. Set existing users to active
UPDATE profiles SET status = 'active' WHERE status IS NULL;

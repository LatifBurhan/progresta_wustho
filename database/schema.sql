-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create divisions table
CREATE TABLE divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Karyawan', 'PM', 'CEO')) DEFAULT 'Karyawan',
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    status_pending BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    client VARCHAR(200) NOT NULL,
    status_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_assignments table
CREATE TABLE project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- Create reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(20) CHECK (location IN ('Al-Wustho', 'WFA', 'Client Site')) NOT NULL,
    period VARCHAR(10) CHECK (period IN ('08-10', '10-12', '13-15', '15-17')) NOT NULL,
    future_plan TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create report_details table
CREATE TABLE report_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    progress TEXT NOT NULL,
    issues TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_division_id ON users(division_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status_pending ON users(status_pending);
CREATE INDEX idx_project_assignments_user_id ON project_assignments(user_id);
CREATE INDEX idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_report_details_report_id ON report_details(report_id);
CREATE INDEX idx_report_details_project_id ON report_details(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON divisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_details ENABLE ROW LEVEL SECURITY;
-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "PM and CEO can view all users" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('PM', 'CEO')
        AND u.status_pending = FALSE
    )
);
CREATE POLICY "PM can update user roles and divisions" ON users FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'PM'
        AND u.status_pending = FALSE
    )
);

-- RLS Policies for divisions table
CREATE POLICY "All authenticated users can view divisions" ON divisions FOR SELECT TO authenticated;
CREATE POLICY "PM can manage divisions" ON divisions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'PM'
        AND u.status_pending = FALSE
    )
);

-- RLS Policies for projects table
CREATE POLICY "All authenticated users can view active projects" ON projects FOR SELECT USING (status_active = TRUE);
CREATE POLICY "PM can manage projects" ON projects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'PM'
        AND u.status_pending = FALSE
    )
);

-- RLS Policies for project_assignments table
CREATE POLICY "Users can view their own assignments" ON project_assignments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "PM and CEO can view all assignments" ON project_assignments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('PM', 'CEO')
        AND u.status_pending = FALSE
    )
);
CREATE POLICY "PM can manage assignments" ON project_assignments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'PM'
        AND u.status_pending = FALSE
    )
);
-- RLS Policies for reports table
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view reports from their division" ON reports FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u1, users u2 
        WHERE u1.id = auth.uid() 
        AND u2.id = reports.user_id
        AND u1.division_id = u2.division_id
        AND u1.status_pending = FALSE
    )
);
CREATE POLICY "PM and CEO can view all reports" ON reports FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('PM', 'CEO')
        AND u.status_pending = FALSE
    )
);
CREATE POLICY "Users can manage their own reports" ON reports FOR ALL USING (user_id = auth.uid());

-- RLS Policies for report_details table
CREATE POLICY "Users can view report details for accessible reports" ON report_details FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM reports r 
        WHERE r.id = report_details.report_id
        AND (
            r.user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM users u1, users u2 
                WHERE u1.id = auth.uid() 
                AND u2.id = r.user_id
                AND (
                    u1.role IN ('PM', 'CEO') OR
                    u1.division_id = u2.division_id
                )
                AND u1.status_pending = FALSE
            )
        )
    )
);
CREATE POLICY "Users can manage report details for their own reports" ON report_details FOR ALL USING (
    EXISTS (
        SELECT 1 FROM reports r 
        WHERE r.id = report_details.report_id 
        AND r.user_id = auth.uid()
    )
);

-- Insert default divisions
INSERT INTO divisions (name) VALUES 
    ('Web Development'),
    ('Mobile Development'),
    ('UI/UX Design'),
    ('AI Team'),
    ('Management');

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
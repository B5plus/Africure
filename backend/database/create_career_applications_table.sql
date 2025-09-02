-- Create Career Applications Table
-- This table stores all career application submissions from the website

CREATE TABLE IF NOT EXISTS "Career_Applications" (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    experience VARCHAR(10) NOT NULL,
    qualification VARCHAR(20) NOT NULL,
    cover_letter TEXT,
    resume_url TEXT,
    resume_file_name VARCHAR(255),
    consent_given BOOLEAN NOT NULL DEFAULT false,
    application_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    application_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_career_applications_email ON "Career_Applications"(email);
CREATE INDEX IF NOT EXISTS idx_career_applications_position ON "Career_Applications"(position);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON "Career_Applications"(application_status);
CREATE INDEX IF NOT EXISTS idx_career_applications_date ON "Career_Applications"(application_date);

-- Add comments for documentation
COMMENT ON TABLE "Career_Applications" IS 'Stores career application submissions from the Africure Pharma website';
COMMENT ON COLUMN "Career_Applications".id IS 'Unique identifier for each application';
COMMENT ON COLUMN "Career_Applications".full_name IS 'Applicant full name';
COMMENT ON COLUMN "Career_Applications".email IS 'Applicant email address';
COMMENT ON COLUMN "Career_Applications".phone IS 'Applicant phone number';
COMMENT ON COLUMN "Career_Applications".location IS 'Applicant current location';
COMMENT ON COLUMN "Career_Applications".position IS 'Position applied for';
COMMENT ON COLUMN "Career_Applications".experience IS 'Years of experience range';
COMMENT ON COLUMN "Career_Applications".qualification IS 'Highest qualification';
COMMENT ON COLUMN "Career_Applications".cover_letter IS 'Optional cover letter text';
COMMENT ON COLUMN "Career_Applications".resume_url IS 'URL to uploaded resume file';
COMMENT ON COLUMN "Career_Applications".resume_file_name IS 'Original filename of uploaded resume';
COMMENT ON COLUMN "Career_Applications".consent_given IS 'Whether applicant gave consent for data processing';
COMMENT ON COLUMN "Career_Applications".application_status IS 'Current status: pending, reviewing, shortlisted, interviewed, hired, rejected';
COMMENT ON COLUMN "Career_Applications".admin_notes IS 'Internal notes for HR team';
COMMENT ON COLUMN "Career_Applications".application_date IS 'When the application was submitted';
COMMENT ON COLUMN "Career_Applications".updated_at IS 'Last update timestamp';
COMMENT ON COLUMN "Career_Applications".created_at IS 'Record creation timestamp';

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_career_applications_updated_at 
    BEFORE UPDATE ON "Career_Applications" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for resume files (if not exists)
-- Note: This needs to be run in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('career-applications', 'career-applications', false);

-- Set up Row Level Security (RLS) policies
ALTER TABLE "Career_Applications" ENABLE ROW LEVEL SECURITY;

-- Policy for public insert (anyone can submit applications)
CREATE POLICY "Anyone can submit career applications" ON "Career_Applications"
    FOR INSERT WITH CHECK (true);

-- Policy for admin read (authenticated users can read all applications)
-- Note: Adjust this based on your authentication setup
CREATE POLICY "Authenticated users can read applications" ON "Career_Applications"
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for admin update (authenticated users can update applications)
CREATE POLICY "Authenticated users can update applications" ON "Career_Applications"
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant necessary permissions
-- Note: Adjust these based on your specific needs
GRANT SELECT, INSERT ON "Career_Applications" TO anon;
GRANT ALL ON "Career_Applications" TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE "Career_Applications_id_seq" TO anon;
GRANT USAGE, SELECT ON SEQUENCE "Career_Applications_id_seq" TO authenticated;

-- Create a function to insert career applications that bypasses RLS
CREATE OR REPLACE FUNCTION insert_career_application(application_data jsonb)
RETURNS TABLE(
    id integer,
    full_name varchar(100),
    email varchar(255),
    position varchar(50),
    application_status varchar(20),
    application_date timestamp with time zone
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO "Career_Applications" (
        full_name, email, phone, location, position, experience,
        qualification, cover_letter, resume_url, resume_file_name,
        consent_given, application_status, application_date
    )
    VALUES (
        (application_data->>'full_name')::varchar(100),
        (application_data->>'email')::varchar(255),
        (application_data->>'phone')::varchar(20),
        (application_data->>'location')::varchar(100),
        (application_data->>'position')::varchar(50),
        (application_data->>'experience')::varchar(10),
        (application_data->>'qualification')::varchar(20),
        (application_data->>'cover_letter')::text,
        (application_data->>'resume_url')::text,
        (application_data->>'resume_file_name')::varchar(255),
        (application_data->>'consent_given')::boolean,
        (application_data->>'application_status')::varchar(20),
        (application_data->>'application_date')::timestamp with time zone
    )
    RETURNING
        "Career_Applications".id,
        "Career_Applications".full_name,
        "Career_Applications".email,
        "Career_Applications".position,
        "Career_Applications".application_status,
        "Career_Applications".application_date;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION insert_career_application(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION insert_career_application(jsonb) TO authenticated;

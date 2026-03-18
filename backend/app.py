from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import os
import psycopg2
from psycopg2 import Error, extras
import uuid
from werkzeug.utils import secure_filename
from datetime import date, datetime, timezone, timedelta, time
from io import BytesIO
from workflow.resume_analyzer_workflow import run_analyzer_workflow
from workflow.resume_scorer_workflow import run_scorer_workflow
from r2_storage import r2_storage

load_dotenv()

app = Flask(__name__)
CORS(app)

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create uploads directory only if R2 is not configured (local storage fallback)
if not r2_storage.is_configured():
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    print("📁 R2 not configured - using local uploads folder")
else:
    print("☁️  R2 configured - using cloud storage")

# Temp directory for processing files from R2
import tempfile
TEMP_DIR = tempfile.gettempdir()

def get_file_path(resume_path):
    """
    Get file path or content from R2 or local storage
    Returns the local file path if file exists locally or can be downloaded from R2
    """
    if not resume_path:
        return None
    
    # Try R2 first if configured
    if r2_storage.is_configured():
        if r2_storage.file_exists(resume_path):
            # Download from R2 to system temp directory for processing (not uploads folder)
            result = r2_storage.download_file(resume_path)
            if result['success']:
                temp_path = os.path.join(TEMP_DIR, f"r2_temp_{resume_path}")
                with open(temp_path, 'wb') as f:
                    f.write(result['data'])
                return temp_path
    
    # Fallback to local storage (only if R2 not configured)
    local_path = os.path.join(UPLOAD_FOLDER, resume_path)
    if os.path.exists(local_path):
        return local_path
    
    return None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'postgres'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgrespassword'),
    'database': os.getenv('DB_NAME', 'recruitments_db'),
    'port': os.getenv('DB_PORT', '5432')
}

def get_db_connection():
    """Create and return database connection"""
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return None

def init_database():
    """Initialize database tables"""
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        
        # Create users table first (needed for foreign keys)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                company_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create jobs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                title VARCHAR(255) NOT NULL,
                department VARCHAR(100),
                location VARCHAR(255),
                type VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Active',
                description TEXT,
                experience_level VARCHAR(50),
                salary_range VARCHAR(100),
                required_skills TEXT,
                application_deadline DATE,
                special_instructions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Create index for jobs.user_id
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id)")
        
        # Create applicants table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS applicants (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                job_id VARCHAR(36),
                job_title VARCHAR(255),
                date_applied DATE,
                ai_score INTEGER DEFAULT 0,
                status VARCHAR(100) DEFAULT 'Pending Analysis',
                resume_name VARCHAR(255),
                resume_path TEXT,
                cover_letter TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Create index for applicants.user_id
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_applicants_user_id ON applicants(user_id)")
        
        # Add user_id column to existing tables if they don't have it
        try:
            cursor.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_id VARCHAR(36)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id)")
            cursor.execute("""
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'jobs_user_id_fkey'
                    ) THEN
                        ALTER TABLE jobs ADD CONSTRAINT jobs_user_id_fkey 
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
                    END IF;
                END $$;
            """)
        except Exception as e:
            print(f"Note: {e}")
        
        try:
            cursor.execute("ALTER TABLE applicants ADD COLUMN IF NOT EXISTS user_id VARCHAR(36)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_applicants_user_id ON applicants(user_id)")
            cursor.execute("""
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'applicants_user_id_fkey'
                    ) THEN
                        ALTER TABLE applicants ADD CONSTRAINT applicants_user_id_fkey 
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
                    END IF;
                END $$;
            """)
        except Exception as e:
            print(f"Note: {e}")
        
        # Create settings table for user-specific configurations
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL UNIQUE,
                ai_score_threshold INTEGER DEFAULT 70,
                instructions_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Add instructions_text column if it doesn't exist (for existing databases)
        cursor.execute("""
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'settings' AND column_name = 'instructions_text'
                ) THEN
                    ALTER TABLE settings ADD COLUMN instructions_text TEXT;
                END IF;
            END $$;
        """)
        
        # Create index for settings.user_id
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id)")
        
        # Create trigger function for updated_at (PostgreSQL equivalent of ON UPDATE CURRENT_TIMESTAMP)
        cursor.execute("""
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        """)
        
        # Create triggers for updated_at
        cursor.execute("""
            DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
            CREATE TRIGGER update_jobs_updated_at
            BEFORE UPDATE ON jobs
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        """)
        
        cursor.execute("""
            DROP TRIGGER IF EXISTS update_applicants_updated_at ON applicants;
            CREATE TRIGGER update_applicants_updated_at
            BEFORE UPDATE ON applicants
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        """)
        
        cursor.execute("""
            DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
            CREATE TRIGGER update_settings_updated_at
            BEFORE UPDATE ON settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        """)
        
        connection.commit()
        print("Database tables initialized successfully")
    except Error as e:
        print(f"Error initializing database: {e}")
    finally:
        if connection:
            cursor.close()
            connection.close()

# Initialize database on startup
init_database()

# Health check
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Backend is running'})

# Helper function to get user_id from request
def get_user_id():
    user_id = request.headers.get('X-User-ID')
    if not user_id:
        # Try to get from JSON body
        if request.is_json:
            user_id = request.json.get('user_id')
    
    # Log for debugging multi-tenancy issues
    if not user_id:
        print(f"⚠️ WARNING: No user_id found in request headers or body")
        print(f"   Headers: {dict(request.headers)}")
        if request.is_json:
            print(f"   Body keys: {list(request.json.keys()) if request.json else 'None'}")
    
    return user_id

# Helper function to get AI score threshold for a user (default: 70)
def get_ai_score_threshold(user_id):
    """Get the AI score threshold for a user, defaulting to 70 if not set."""
    if not user_id:
        return 70
    
    connection = get_db_connection()
    if not connection:
        return 70
    
    try:
        cursor = connection.cursor()
        cursor.execute('SELECT ai_score_threshold FROM settings WHERE user_id = %s', (user_id,))
        result = cursor.fetchone()
        
        if result:
            cursor.close()
            connection.close()
            return result[0]
        else:
            # Create default settings for user if doesn't exist
            cursor.close()
            try:
                insert_cursor = connection.cursor()
                insert_cursor.execute("""
                    INSERT INTO settings (id, user_id, ai_score_threshold, instructions_text)
                    VALUES (%s, %s, %s, %s)
                """, (str(uuid.uuid4()), user_id, 70, ''))
                connection.commit()
                insert_cursor.close()
                connection.close()
            except Exception as e:
                print(f"Error creating default settings: {e}")
                connection.close()
            return 70
    except Exception as e:
        print(f"Error getting AI score threshold: {e}")
        if connection:
            cursor.close()
            connection.close()
        return 70

# Helper function to get instructions text for a user (default: empty string)
def get_instructions_text(user_id):
    """Get the instructions text for a user, defaulting to empty string if not set."""
    if not user_id:
        return ''
    
    connection = get_db_connection()
    if not connection:
        return ''
    
    try:
        cursor = connection.cursor()
        cursor.execute('SELECT instructions_text FROM settings WHERE user_id = %s', (user_id,))
        result = cursor.fetchone()
        
        if result:
            instructions = result[0] if result[0] else ''
            cursor.close()
            connection.close()
            return instructions
        else:
            # Create default settings for user if doesn't exist
            cursor.close()
            try:
                insert_cursor = connection.cursor()
                insert_cursor.execute("""
                    INSERT INTO settings (id, user_id, ai_score_threshold, instructions_text)
                    VALUES (%s, %s, %s, %s)
                """, (str(uuid.uuid4()), user_id, 70, ''))
                connection.commit()
                insert_cursor.close()
                connection.close()
            except Exception as e:
                print(f"Error creating default settings: {e}")
                connection.close()
            return ''
    except Error as e:
        print(f"Error getting instructions text: {e}")
        if connection:
            cursor.close()
            connection.close()
        return ''

# Jobs Routes
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT * FROM jobs WHERE user_id = %s ORDER BY created_at DESC', (user_id,))
        jobs = cursor.fetchall()
        return jsonify(jobs)
    except Error as e:
        return jsonify({'error': 'Failed to fetch jobs'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    # Public endpoint - no user_id required for viewing job details
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT * FROM jobs WHERE id = %s', (job_id,))
        job = cursor.fetchone()
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        return jsonify(job)
    except Error as e:
        return jsonify({'error': 'Failed to fetch job'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/jobs', methods=['POST'])
def create_job():
    data = request.json
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        job_id = str(uuid.uuid4())
        
        insert_cursor = connection.cursor()
        insert_cursor.execute("""
            INSERT INTO jobs (id, user_id, title, department, location, type, status, description, 
                           experience_level, salary_range, required_skills, application_deadline, special_instructions)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            job_id,
            user_id,
            data.get('title'),
            data.get('department', ''),
            data.get('location'),
            data.get('type'),
            data.get('status', 'Active'),
            data.get('description', ''),
            data.get('experience_level', ''),
            data.get('salary_range', ''),
            data.get('required_skills', ''),
            data.get('application_deadline') or None,
            data.get('special_instructions', '')
        ))
        
        connection.commit()
        insert_cursor.close()
        
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT * FROM jobs WHERE id = %s', (job_id,))
        new_job = cursor.fetchone()
        return jsonify(new_job), 201
    except Error as e:
        return jsonify({'error': 'Failed to create job'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/jobs/<job_id>', methods=['PUT'])
def update_job(job_id):
    data = request.json
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        # Verify job belongs to user
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT user_id FROM jobs WHERE id = %s', (job_id,))
        job = cursor.fetchone()
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        if job['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        update_cursor = connection.cursor()
        update_cursor.execute("""
            UPDATE jobs SET 
                title = %s, department = %s, location = %s, type = %s, status = %s,
                description = %s, experience_level = %s, salary_range = %s, 
                required_skills = %s, application_deadline = %s, special_instructions = %s
            WHERE id = %s AND user_id = %s
        """, (
            data.get('title'),
            data.get('department', ''),
            data.get('location'),
            data.get('type'),
            data.get('status'),
            data.get('description', ''),
            data.get('experience_level', ''),
            data.get('salary_range', ''),
            data.get('required_skills', ''),
            data.get('application_deadline') or None,
            data.get('special_instructions', ''),
            job_id,
            user_id
        ))
        
        connection.commit()
        update_cursor.close()
        
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT * FROM jobs WHERE id = %s', (job_id,))
        updated_job = cursor.fetchone()
        return jsonify(updated_job)
    except Error as e:
        return jsonify({'error': 'Failed to update job'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/jobs/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        cursor.execute('DELETE FROM jobs WHERE id = %s AND user_id = %s', (job_id, user_id))
        connection.commit()
        if cursor.rowcount == 0:
            return jsonify({'error': 'Job not found or unauthorized'}), 404
        return jsonify({'message': 'Job deleted successfully'})
    except Error as e:
        return jsonify({'error': 'Failed to delete job'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

# Applicants Routes
@app.route('/api/applicants', methods=['GET'])
def get_applicants():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    filter_type = request.args.get('filter')
    position = request.args.get('position')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        
        # For "total" and "shortlisted" filters, fetch ALL applicants first (including "New")
        # so we can update their statuses before filtering
        # For "new" filter, only fetch "New" status applicants
        query = 'SELECT * FROM applicants WHERE user_id = %s'
        params = [user_id]
        
        initial_conditions = []
        if filter_type == 'new':
            # "New Applicants" filter: Fetch applicants created today (current calendar day)
            # Use date_applied field (DATE type) for more accurate date comparison
            # This avoids timezone issues with TIMESTAMP
            today = date.today()
            initial_conditions.append('date_applied >= %s')
            params.append(today)
            print(f"🔍 DEBUG: Filtering for date_applied >= {today}")
        
        # Position filter (applies to all filters)
        if position and position != 'All Positions':
            initial_conditions.append('job_title = %s')
            params.append(position)
        
        if initial_conditions:
            query += ' AND ' + ' AND '.join(initial_conditions)
        
        query += ' ORDER BY date_applied DESC'
        
        print(f"🔍 DEBUG: Filter type: {filter_type}, User ID: {user_id}")
        print(f"🔍 DEBUG: Initial Query: {query}")
        print(f"🔍 DEBUG: Params: {params}")
        if filter_type == 'new':
            print(f"🔍 DEBUG: Filtering for date_applied >= today")
        
        cursor.execute(query, params)
        applicants = cursor.fetchall()
        
        print(f"🔍 DEBUG: Raw fetchall result count: {len(applicants)}")
        
        # Convert RealDictRow to dict for JSON serialization
        applicants = [dict(applicant) for applicant in applicants]
        
        print(f"🔍 Filter: {filter_type}, Found {len(applicants)} applicants before status update")
        if applicants:
            print(f"   Sample applicant: {applicants[0].get('name', 'N/A')} - Status: {applicants[0].get('status', 'N/A')} - AI Score: {applicants[0].get('ai_score', 0)}")
        else:
            print(f"   ⚠️ No applicants found!")
        
        # Auto-update status for each applicant based on their AI score
        # BUT: Skip status updates entirely for "new" filter to keep applicants as "New"
        # For "total" and "shortlisted" filters, update statuses so applicants appear in those tabs
        update_cursor = connection.cursor()
        updated_count = 0
        threshold = get_ai_score_threshold(user_id)
        # Check if user has custom instructions configured.
        # If instructions are empty, we treat low AI scores as "Not Qualified"
        # instead of "Needs Review".
        instructions_text = get_instructions_text(user_id)
        has_custom_instructions = bool(instructions_text and instructions_text.strip())
        
        # Always update statuses for all filters (including "new")
        # This ensures applicants appear in multiple tabs if they qualify
        # "New Applicants" tab shows recently applied (based on created_at), not status
        print(f"📊 Auto-updating applicant statuses (Threshold: {threshold}%)")
        
        # Calculate start of today in UTC (for "New Applicants" filter logic)
        now_utc = datetime.now(timezone.utc)
        start_of_today_utc = datetime.combine(now_utc.date(), time.min).replace(tzinfo=timezone.utc)
        
        # Update statuses for all applicants (regardless of filter)
        if filter_type != 'new':
            
            for applicant in applicants:
                ai_score = applicant.get('ai_score', 0) or 0
                current_status = applicant.get('status', 'New')
                created_at = applicant.get('created_at')
                
                # Update status based on AI score for all applicants
                # Note: "New Applicants" tab shows applicants based on created_at (today's applicants)
                # not based on status, so we can update status and they'll still appear in "New Applicants" tab
                # if they were created today
                
                # Determine what status should be based on AI score with clear logic
                # If there are custom instructions, any positive score below the threshold
                # becomes "Needs Review" (para alam mong i-review yung borderline cases).
                # Kapag walang instructions, low scores should simply be "Not Qualified".
                if ai_score > 0:
                    if ai_score >= 90:
                        expected_status = 'Highly Qualified'  # Excellent match (90-100): Top candidate, meets all requirements
                    elif ai_score >= threshold:
                        expected_status = 'Qualified'  # Good match (threshold-89): Meets requirements, good fit
                    else:
                        expected_status = 'Needs Review' if has_custom_instructions else 'Not Qualified'
                else:
                    # If no AI score yet (not analyzed) or 0 score, set to "Not Qualified" or "Pending Analysis"
                    expected_status = 'Not Qualified'
                
                # Only update auto-assigned statuses (don't overwrite manual statuses)
                # Auto-statuses: 'Pending Analysis', 'Qualified', 'Highly Qualified', 'Needs Review', 'Not Qualified'
                # Manual statuses: 'Shortlisted', 'Rejected', 'Hired' (these are set by HR manually)
                manual_statuses = ['Shortlisted', 'Rejected', 'Hired']
                
                # Update if:
                # 1. Current status is NOT a manual status (can be auto-updated)
                # 2. Expected status is different from current status
                # Note: We already skipped "New" applicants within 24 hours above
                if current_status not in manual_statuses and current_status != expected_status:
                    update_cursor.execute(
                        'UPDATE applicants SET status = %s WHERE id = %s',
                        (expected_status, applicant['id'])
                    )
                    applicant['status'] = expected_status
                    updated_count += 1
                    print(f"✅ Auto-updated status for applicant {applicant.get('name', applicant['id'])}: '{current_status}' → '{expected_status}' (AI Score: {ai_score}%, Threshold: {threshold}%)")
            
            if updated_count > 0:
                connection.commit()
                print(f"📊 Auto-updated {updated_count} applicant status(es) based on AI scores")
            else:
                print(f"📊 No status updates needed")
        
        update_cursor.close()
        
        # Now apply filter logic AFTER status updates
        # This ensures that applicants with updated statuses are included in the results
        filtered_applicants = []
        threshold = get_ai_score_threshold(user_id)
        
        for applicant in applicants:
            current_status = applicant.get('status', 'New')
            ai_score = applicant.get('ai_score', 0) or 0
            
            if filter_type == 'new':
                # "New Applicants" filter: Show applicants created today
                # Note: We already filtered by created_at >= start_of_today_utc in the SQL query,
                # so all applicants here should already be from today
                # Just add them all (no need to filter again)
                filtered_applicants.append(applicant)
            elif filter_type == 'shortlisted':
                # "Qualified Applicants" filter:
                # 1) AI score >= threshold (normal qualified)
                # 2) Qualified / Highly Qualified / Shortlisted statuses
                # 3) (Optional) Needs Review BUT has any AI score > 0 (meaning: low score but has some skills / analysis).
                #    This only applies when the user has custom instructions configured.
                is_qualified_status = current_status in ['Qualified', 'Highly Qualified', 'Shortlisted']
                is_needs_review_with_ai = has_custom_instructions and current_status == 'Needs Review' and ai_score > 0
                if ai_score >= threshold or is_qualified_status or is_needs_review_with_ai:
                    filtered_applicants.append(applicant)
            elif filter_type == 'total':
                # "Total Applicants" filter: Show all applicants (no status filter)
                filtered_applicants.append(applicant)
            else:
                # Default: Show all applicants
                filtered_applicants.append(applicant)
        
        print(f"✅ After filtering: {len(filtered_applicants)} applicants (from {len(applicants)} total)")
        if filtered_applicants:
            print(f"   Sample filtered applicant: {filtered_applicants[0].get('name', 'N/A')} - Status: {filtered_applicants[0].get('status', 'N/A')} - AI Score: {filtered_applicants[0].get('ai_score', 0)} - Created: {filtered_applicants[0].get('created_at', 'N/A')}")
        elif filter_type == 'new' and applicants:
            # Debug: Show why applicants were filtered out
            print(f"   ⚠️ Debug: {len(applicants)} applicants fetched but none passed 24-hour filter")
            for idx, app in enumerate(applicants[:3]):  # Show first 3
                created_at = app.get('created_at')
                print(f"      Applicant {idx+1}: {app.get('name', 'N/A')} - Created: {created_at}")
                if created_at:
                    try:
                        if isinstance(created_at, str):
                            created_datetime = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                            if created_datetime.tzinfo is None:
                                created_datetime = created_datetime.replace(tzinfo=timezone.utc)
                        else:
                            created_datetime = created_at
                            if created_datetime and created_datetime.tzinfo is None:
                                created_datetime = created_datetime.replace(tzinfo=timezone.utc)
                        hours_ago = (datetime.now(timezone.utc) - created_datetime).total_seconds() / 3600
                        print(f"         Hours ago: {hours_ago:.2f}, Within 24h: {hours_ago <= 24}")
                    except Exception as e:
                        print(f"         Error parsing date: {e}")
        
        return jsonify(filtered_applicants)
    except Error as e:
        return jsonify({'error': 'Failed to fetch applicants'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/applicants/stats', methods=['GET'])
def get_applicant_stats():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        
        # Total Applicants: All applicants (no status filter)
        cursor.execute("SELECT COUNT(*) as count FROM applicants WHERE user_id = %s", (user_id,))
        total = cursor.fetchone()[0]
        
        # New Applicants: Count applicants created today (current calendar day)
        # Use date_applied field (DATE type) for more accurate date comparison
        today = date.today()
        print(f"🔍 DEBUG Stats: Counting applicants with date_applied >= {today}")
        cursor.execute("SELECT COUNT(*) as count FROM applicants WHERE user_id = %s AND date_applied >= %s", (user_id, today))
        new_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) as count FROM applicants WHERE user_id = %s AND status IN ('Shortlisted', 'Qualified', 'Highly Qualified')", (user_id,))
        shortlisted = cursor.fetchone()[0]
        
        # AI Shortlisted: Count applicants with AI score >= threshold (configurable)
        # OR qualified statuses. Optionally include "Needs Review" with AI score > 0
        # only when the user has custom instructions configured (same behaviour as listing).
        threshold = get_ai_score_threshold(user_id)
        instructions_text = get_instructions_text(user_id)
        has_custom_instructions = bool(instructions_text and instructions_text.strip())

        if has_custom_instructions:
            cursor.execute("""
                SELECT COUNT(*) as count FROM applicants 
                WHERE user_id = %s 
                AND (ai_score >= %s 
                     OR status IN ('Qualified', 'Highly Qualified', 'Shortlisted')
                     OR (status = 'Needs Review' AND ai_score > 0))
            """, (user_id, threshold))
        else:
            cursor.execute("""
                SELECT COUNT(*) as count FROM applicants 
                WHERE user_id = %s 
                AND (ai_score >= %s 
                     OR status IN ('Qualified', 'Highly Qualified', 'Shortlisted'))
            """, (user_id, threshold))

        ai_shortlisted = cursor.fetchone()[0]
        
        return jsonify({
            'total': total,
            'new': new_count,
            'shortlisted': shortlisted,
            'ai_shortlisted': ai_shortlisted,
            'ai_score_threshold': threshold
        })
    except Error as e:
        return jsonify({'error': 'Failed to fetch stats'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/applicants/<applicant_id>', methods=['GET'])
def get_applicant(applicant_id):
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT * FROM applicants WHERE id = %s', (applicant_id,))
        applicant = cursor.fetchone()
        if not applicant:
            return jsonify({'error': 'Applicant not found'}), 404
        
        # Get AI score breakdown if available (re-analyze if needed)
        if applicant.get('resume_path') and applicant.get('job_id'):
            try:
                # Try to get job details for re-analysis
                cursor.execute('SELECT description, required_skills FROM jobs WHERE id = %s', (applicant.get('job_id'),))
                job = cursor.fetchone()
                if job:
                    # Re-analyze to get breakdown
                    full_resume_path = get_file_path(applicant['resume_path'])
                    if full_resume_path:
                        analyzer_result = run_analyzer_workflow(
                            resume_path=full_resume_path,
                            job_id=applicant.get('job_id'),
                            job_description=job.get('description', '') or '',
                            job_requirements=job.get('required_skills', '') or ''
                        )
                        
                        if analyzer_result.get('analysis_result'):
                            # Get instructions_text from settings
                            instructions_text = get_instructions_text(applicant.get('user_id'))
                            scorer_result = run_scorer_workflow(
                                resume_analysis=analyzer_result['analysis_result'],
                                job_description=job.get('description', '') or '',
                                job_requirements=job.get('required_skills', '') or '',
                                job_id=applicant.get('job_id'),
                                instructions_text=instructions_text
                            )
                            
                            try:
                                import json
                                score_breakdown = json.loads(scorer_result.get('score_result', '{}')) if isinstance(scorer_result.get('score_result'), str) else scorer_result.get('score_result', {})
                                applicant['ai_score_breakdown'] = score_breakdown
                                applicant['resume_analysis'] = json.loads(analyzer_result.get('analysis_result', '{}')) if isinstance(analyzer_result.get('analysis_result'), str) else analyzer_result.get('analysis_result', {})
                            except Exception as e:
                                print(f"⚠️  Error parsing score breakdown: {str(e)}")
            except Exception as e:
                print(f"⚠️  Could not get score breakdown: {str(e)}")
        
        return jsonify(applicant)
    except Error as e:
        return jsonify({'error': 'Failed to fetch applicant'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/applicants', methods=['POST'])
def create_applicant():
    data = request.json
    # Get user_id from job_id (for public applications)
    user_id = data.get('user_id')
    if not user_id and data.get('job_id'):
        # Get user_id from job
        connection = get_db_connection()
        if connection:
            try:
                cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
                cursor.execute('SELECT user_id FROM jobs WHERE id = %s', (data.get('job_id'),))
                job = cursor.fetchone()
                if job:
                    user_id = job['user_id']
                cursor.close()
                connection.close()
            except:
                pass
    
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        # Get job details if job_id is provided
        job_description = ''
        job_requirements = ''
        job_id = data.get('job_id')
        
        if job_id:
            cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
            cursor.execute('SELECT description, required_skills FROM jobs WHERE id = %s', (job_id,))
            job = cursor.fetchone()
            if job:
                job_description = job.get('description', '') or ''
                job_requirements = job.get('required_skills', '') or ''
            cursor.close()
        
        # Initialize AI score
        ai_score = data.get('ai_score', 0)
        resume_path = data.get('resume_path', '')
        
        # Debug logging
        print(f"\n🔍 DEBUG: Creating applicant")
        print(f"   resume_path: {resume_path}")
        print(f"   job_id: {job_id}")
        print(f"   job_requirements: {job_requirements[:50] if job_requirements else 'None'}...")
        
        # Run AI analysis if resume is provided
        if resume_path and job_id:
            try:
                print(f"\n🤖 Starting AI Analysis for resume: {resume_path}")
                print(f"   Job ID: {job_id}")
                print(f"   Job Requirements: {job_requirements[:100] if job_requirements else 'None'}...")
                
                # Step 1: Run Resume Analyzer Workflow
                # resume_path is just filename (e.g., "uuid.pdf"), get from R2 or local
                full_resume_path = get_file_path(resume_path)
                if not full_resume_path:
                    print(f"❌ ERROR: Resume file not found: {resume_path}")
                    print(f"   Looking in: R2 or {UPLOAD_FOLDER}")
                    ai_score = 30  # Default base score
                else:
                    print(f"✅ Resume file found: {full_resume_path}")
                    # Pass the full absolute path to workflow
                    analyzer_result = run_analyzer_workflow(
                        resume_path=full_resume_path,  # Full absolute path
                        job_id=job_id,
                        job_description=job_description,
                        job_requirements=job_requirements
                    )
                    
                    print(f"📊 Analyzer Result: {analyzer_result.get('step', 'unknown')}")
                    print(f"   Has analysis_result: {bool(analyzer_result.get('analysis_result'))}")
                    
                    # Step 2: Run Resume Scorer Workflow if analysis succeeded
                    if analyzer_result.get('analysis_result'):
                        # Get instructions_text from settings
                        instructions_text = get_instructions_text(user_id)
                        scorer_result = run_scorer_workflow(
                            resume_analysis=analyzer_result['analysis_result'],
                            job_description=job_description,
                            job_requirements=job_requirements,
                            job_id=job_id,
                            instructions_text=instructions_text
                        )
                        
                        # Extract AI score and detailed breakdown
                        ai_score = scorer_result.get('ai_score', 0)
                        score_breakdown = scorer_result.get('score_result', '{}')
                        print(f"✅ AI Analysis Complete - Score: {ai_score}/100")
                        
                        # Store detailed breakdown in analysis_result for later retrieval
                        try:
                            import json
                            breakdown_data = json.loads(score_breakdown) if isinstance(score_breakdown, str) else score_breakdown
                            analyzer_result['score_breakdown'] = breakdown_data
                        except:
                            pass
                    else:
                        print("⚠️  Warning: Resume analysis returned no results, using default score")
                        print(f"   Extracted text length: {len(analyzer_result.get('extracted_text', ''))}")
                        print(f"   Analyzer step: {analyzer_result.get('step', 'unknown')}")
                        ai_score = 30  # Default base score
            except Exception as e:
                import traceback
                print(f"❌ ERROR during AI analysis: {str(e)}")
                print(f"   Traceback: {traceback.format_exc()}")
                # Continue with default score if AI analysis fails
                ai_score = 30  # Default base score
        else:
            if not resume_path:
                print("⚠️  No resume_path provided, skipping AI analysis")
            if not job_id:
                print("⚠️  No job_id provided, skipping AI analysis")
            ai_score = data.get('ai_score', 30)  # Default base score
        
        print(f"📝 Final AI Score to save: {ai_score}")
        
        # New applicants start with "Pending Analysis" status until AI analysis completes
        final_status = data.get('status') or 'Pending Analysis'
        
        insert_cursor = connection.cursor()
        applicant_id = str(uuid.uuid4())
        
        # Store score breakdown as JSON in cover_letter or create new field
        # For now, we'll store it in a JSON format that we can retrieve
        score_breakdown_json = ''
        if 'analyzer_result' in locals() and analyzer_result.get('score_breakdown'):
            import json
            score_breakdown_json = json.dumps(analyzer_result.get('score_breakdown', {}))
        
        # Use current date with proper timezone
        current_date = datetime.now(timezone.utc).date()
        
        insert_cursor.execute("""
            INSERT INTO applicants (id, user_id, name, email, phone, job_id, job_title, date_applied, 
                                  ai_score, status, resume_name, resume_path, cover_letter)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            applicant_id,
            user_id,
            data.get('name'),
            data.get('email'),
            data.get('phone', ''),
            data.get('job_id'),
            data.get('job_title'),
            current_date,
            ai_score,
            final_status,
            data.get('resume_name', ''),
            resume_path,
            data.get('cover_letter', '')
        ))
        
        connection.commit()
        insert_cursor.close()
        
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT * FROM applicants WHERE id = %s', (applicant_id,))
        new_applicant = cursor.fetchone()
        return jsonify(new_applicant), 201
    except Error as e:
        return jsonify({'error': 'Failed to create applicant'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/applicants/<applicant_id>', methods=['PUT'])
def update_applicant(applicant_id):
    data = request.json
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        # Verify applicant belongs to user
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT user_id FROM applicants WHERE id = %s', (applicant_id,))
        applicant = cursor.fetchone()
        if not applicant:
            return jsonify({'error': 'Applicant not found'}), 404
        if applicant['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        update_cursor = connection.cursor()
        
        update_cursor.execute("""
            UPDATE applicants SET 
                name = %s, email = %s, phone = %s, job_id = %s, job_title = %s,
                status = %s, ai_score = %s, resume_name = %s, resume_path = %s, cover_letter = %s
            WHERE id = %s AND user_id = %s
        """, (
            data.get('name'),
            data.get('email'),
            data.get('phone', ''),
            data.get('job_id'),
            data.get('job_title'),
            data.get('status'),
            data.get('ai_score', 0),
            data.get('resume_name', ''),
            data.get('resume_path', ''),
            data.get('cover_letter', ''),
            applicant_id,
            user_id
        ))
        
        connection.commit()
        update_cursor.close()
        
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT * FROM applicants WHERE id = %s', (applicant_id,))
        updated_applicant = cursor.fetchone()
        return jsonify(updated_applicant)
    except Error as e:
        return jsonify({'error': 'Failed to update applicant'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/applicants/<applicant_id>', methods=['DELETE'])
def delete_applicant(applicant_id):
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        # Get resume path before deleting
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT resume_path FROM applicants WHERE id = %s AND user_id = %s', (applicant_id, user_id))
        applicant = cursor.fetchone()
        
        if not applicant:
            return jsonify({'error': 'Applicant not found or unauthorized'}), 404
        
        # Delete file if exists (from R2 or local)
        if applicant.get('resume_path'):
            resume_path = applicant['resume_path']
            # Try deleting from R2 first
            if r2_storage.is_configured():
                r2_storage.delete_file(resume_path)
            # Also try deleting from local storage
            local_path = os.path.join(UPLOAD_FOLDER, resume_path)
            if os.path.exists(local_path):
                os.remove(local_path)
        
        # Delete applicant
        cursor.execute('DELETE FROM applicants WHERE id = %s AND user_id = %s', (applicant_id, user_id))
        connection.commit()
        return jsonify({'message': 'Applicant deleted successfully'})
    except Error as e:
        return jsonify({'error': 'Failed to delete applicant'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

# Auth Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        
        # Check if email already exists
        cursor.execute('SELECT * FROM users WHERE email = %s', (data.get('email'),))
        if cursor.fetchone():
            return jsonify({'error': 'Email already registered'}), 400
        
        user_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO users (id, company_name, email, password, company_type)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            user_id,
            data.get('company_name'),
            data.get('email'),
            data.get('password'),
            data.get('company_type', '')
        ))
        
        connection.commit()
        return jsonify({'message': 'Registration successful', 'userId': user_id}), 201
    except Error as e:
        return jsonify({'error': 'Failed to register'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT * FROM users WHERE email = %s AND password = %s', 
                      (data.get('email'), data.get('password')))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        return jsonify({'message': 'Login successful', 'user': user})
    except Error as e:
        return jsonify({'error': 'Failed to login'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

# File Upload Route
@app.route('/api/upload/resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['resume']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only PDF and DOCX files are allowed'}), 400
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return jsonify({'error': 'File size exceeds 5MB limit'}), 400
    
    try:
        # Generate unique filename
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        # Determine content type
        content_types = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'doc': 'application/msword'
        }
        content_type = content_types.get(file_ext, 'application/octet-stream')
        
        # Upload to R2 if configured, otherwise save locally
        if r2_storage.is_configured():
            result = r2_storage.upload_file(file, unique_filename, content_type)
            if result['success']:
                print(f"☁️  File uploaded to R2: {unique_filename}")
                return jsonify({
                    'message': 'File uploaded successfully to R2',
                    'filename': filename,
                    'file_path': unique_filename,
                    'url': result.get('url', '')
                }), 200
            else:
                # R2 is configured but upload failed - return error, no local fallback
                print(f"❌ R2 upload failed: {result.get('error')}")
                return jsonify({
                    'error': f"Failed to upload to cloud storage: {result.get('error')}"
                }), 500
        else:
            # Save locally only if R2 is not configured
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
            file.save(file_path)
            print(f"📁 File saved locally: {unique_filename}")
            return jsonify({
                'message': 'File uploaded successfully',
                'filename': filename,
                'file_path': unique_filename
            }), 200
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        return jsonify({'error': f'Failed to upload file: {str(e)}'}), 500

# Resume Download/View Route
@app.route('/api/resume/<file_path>', methods=['GET'])
def get_resume(file_path):
    # Security: prevent directory traversal
    file_path = secure_filename(file_path)
    
    # Determine MIME type
    ext = file_path.rsplit('.', 1)[1].lower() if '.' in file_path else ''
    mime_types = {
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword'
    }
    mime_type = mime_types.get(ext, 'application/octet-stream')
    
    # Try R2 first if configured
    if r2_storage.is_configured():
        result = r2_storage.download_file(file_path)
        if result['success']:
            return send_file(
                BytesIO(result['data']),
                mimetype=mime_type,
                as_attachment=False,
                download_name=file_path
            )
        # Fallback to local if not found in R2
        print(f"⚠️ File not found in R2: {file_path}, trying local storage")
    
    # Fallback to local storage
    full_path = os.path.join(UPLOAD_FOLDER, file_path)
    if not os.path.exists(full_path):
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(full_path, mimetype=mime_type, as_attachment=False)

# Re-analyze existing applicant
@app.route('/api/applicants/<applicant_id>/reanalyze', methods=['POST'])
def reanalyze_applicant(applicant_id):
    """Re-analyze and re-score an existing applicant's resume."""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        # Get applicant details
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT * FROM applicants WHERE id = %s', (applicant_id,))
        applicant = cursor.fetchone()
        
        if not applicant:
            return jsonify({'error': 'Applicant not found'}), 404
        
        resume_path = applicant.get('resume_path')
        job_id = applicant.get('job_id')
        
        if not resume_path or not job_id:
            return jsonify({'error': 'Resume or job information missing'}), 400
        
        # Get job details
        cursor.execute('SELECT description, required_skills FROM jobs WHERE id = %s', (job_id,))
        job = cursor.fetchone()
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        job_description = job.get('description', '') or ''
        job_requirements = job.get('required_skills', '') or ''
        
        # Run AI analysis
        full_resume_path = get_file_path(resume_path)
        if not full_resume_path:
            return jsonify({'error': 'Resume file not found'}), 404
        
        print(f"\n🔄 Re-analyzing applicant {applicant_id}")
        analyzer_result = run_analyzer_workflow(
            resume_path=full_resume_path,
            job_id=job_id,
            job_description=job_description,
            job_requirements=job_requirements
        )
        
        if not analyzer_result.get('analysis_result'):
            return jsonify({
                'error': 'Resume analysis failed',
                'analyzer_result': analyzer_result
            }), 500
        
        # Run scorer workflow
        user_id = applicant.get('user_id')
        # Get instructions_text from settings
        instructions_text = get_instructions_text(user_id) if user_id else ''
        has_custom_instructions = bool(instructions_text and instructions_text.strip())
        scorer_result = run_scorer_workflow(
            resume_analysis=analyzer_result['analysis_result'],
            job_description=job_description,
            job_requirements=job_requirements,
            job_id=job_id,
            instructions_text=instructions_text
        )
        
        ai_score = scorer_result.get('ai_score', 0)
        
        # Auto-update status based on new AI score
        # Status updates immediately based on AI score (no 24-hour delay)
        threshold = get_ai_score_threshold(user_id) if user_id else 70
        current_status = applicant.get('status', 'New')
        
        # Determine status based on AI score with clear logic
        # If there are custom instructions, any positive score below the threshold
        # becomes "Needs Review" (para alam mong i-review yung borderline cases).
        # Kapag walang instructions, low scores should simply be "Not Qualified".
        if ai_score > 0:
            if ai_score >= 90:
                new_status = 'Highly Qualified'  # Excellent match (90-100): Top candidate, meets all requirements
            elif ai_score >= threshold:
                new_status = 'Qualified'  # Good match (threshold-89): Meets requirements, good fit
            else:
                new_status = 'Needs Review' if has_custom_instructions else 'Not Qualified'
        else:
            # If no AI score yet (not analyzed) or 0 score, mark as Not Qualified
            new_status = 'Not Qualified'
        
        # Only update if current status is NOT a manual status
        manual_statuses = ['Shortlisted', 'Rejected', 'Hired']
        if current_status in manual_statuses:
            # Keep manual statuses unchanged
            new_status = current_status
        
        # Update applicant with new score and status
        update_cursor = connection.cursor()
        update_cursor.execute(
            'UPDATE applicants SET ai_score = %s, status = %s WHERE id = %s',
            (ai_score, new_status, applicant_id)
        )
        connection.commit()
        update_cursor.close()
        
        return jsonify({
            'success': True,
            'ai_score': ai_score,
            'status': new_status,
            'message': 'Applicant re-analyzed successfully'
        }), 200
        
    except Exception as e:
        import traceback
        print(f"❌ Error re-analyzing: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f'Re-analysis failed: {str(e)}'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

# AI Resume Analysis Endpoint
@app.route('/api/ai/analyze-resume', methods=['POST'])
def analyze_resume():
    """Analyze and score a resume using AI agents."""
    data = request.json
    
    resume_path = data.get('resume_path')
    job_id = data.get('job_id')
    
    if not resume_path:
        return jsonify({'error': 'resume_path is required'}), 400
    
    if not job_id:
        return jsonify({'error': 'job_id is required'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        # Get job details including user_id
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT description, required_skills, user_id FROM jobs WHERE id = %s', (job_id,))
        job = cursor.fetchone()
        cursor.close()
        
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        job_description = job.get('description', '') or ''
        job_requirements = job.get('required_skills', '') or ''
        user_id = job.get('user_id')
        
        # Step 1: Run Resume Analyzer Workflow
        full_resume_path = get_file_path(resume_path)
        if not full_resume_path:
            return jsonify({'error': 'Resume file not found'}), 404
        
        analyzer_result = run_analyzer_workflow(
            resume_path=full_resume_path,
            job_id=job_id,
            job_description=job_description,
            job_requirements=job_requirements
        )
        
        if not analyzer_result.get('analysis_result'):
            return jsonify({
                'error': 'Resume analysis failed',
                'analyzer_result': analyzer_result
            }), 500
        
        # Step 2: Run Resume Scorer Workflow
        # Get instructions_text from settings
        instructions_text = get_instructions_text(user_id) if user_id else ''
        scorer_result = run_scorer_workflow(
            resume_analysis=analyzer_result['analysis_result'],
            job_description=job_description,
            job_requirements=job_requirements,
            job_id=job_id,
            instructions_text=instructions_text
        )
        
        ai_score = scorer_result.get('ai_score', 0)
        
        return jsonify({
            'success': True,
            'ai_score': ai_score,
            'analysis': analyzer_result.get('analysis_result'),
            'scoring': scorer_result.get('score_result'),
            'status': 'completed'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'AI analysis failed: {str(e)}'}), 500
    finally:
        if connection:
            connection.close()

# Settings Routes
@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get user settings including AI score threshold."""
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        cursor.execute('SELECT * FROM settings WHERE user_id = %s', (user_id,))
        settings = cursor.fetchone()
        
        if not settings:
            # Create default settings if doesn't exist
            settings_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO settings (id, user_id, ai_score_threshold, instructions_text)
                VALUES (%s, %s, %s, %s)
            """, (settings_id, user_id, 70, ''))
            connection.commit()
            
            cursor.execute('SELECT * FROM settings WHERE user_id = %s', (user_id,))
            settings = cursor.fetchone()
        
        return jsonify(settings)
    except Error as e:
        return jsonify({'error': 'Failed to fetch settings'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

@app.route('/api/settings', methods=['PUT'])
def update_settings():
    """Update user settings, including AI score threshold and instructions text."""
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401
    
    data = request.json
    ai_score_threshold = data.get('ai_score_threshold')
    instructions_text = data.get('instructions_text', '')
    
    if ai_score_threshold is None:
        return jsonify({'error': 'ai_score_threshold is required'}), 400
    
    # Validate threshold range (0-100)
    if not isinstance(ai_score_threshold, int) or ai_score_threshold < 0 or ai_score_threshold > 100:
        return jsonify({'error': 'ai_score_threshold must be an integer between 0 and 100'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(cursor_factory=extras.RealDictCursor)
        
        # Check if settings exist
        cursor.execute('SELECT id FROM settings WHERE user_id = %s', (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing settings
            cursor.execute("""
                UPDATE settings 
                SET ai_score_threshold = %s, instructions_text = %s, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %s
            """, (ai_score_threshold, instructions_text, user_id))
        else:
            # Create new settings
            settings_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO settings (id, user_id, ai_score_threshold, instructions_text)
                VALUES (%s, %s, %s, %s)
            """, (settings_id, user_id, ai_score_threshold, instructions_text))
        
        connection.commit()
        
        # Return updated settings
        cursor.execute('SELECT * FROM settings WHERE user_id = %s', (user_id,))
        updated_settings = cursor.fetchone()
        
        return jsonify(updated_settings)
    except Error as e:
        return jsonify({'error': 'Failed to update settings'}), 500
    finally:
        if connection:
            cursor.close()
            connection.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


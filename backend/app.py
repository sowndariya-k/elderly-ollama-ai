from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import subprocess
import os
from dotenv import load_dotenv
import json
from ai_config import get_prompt_for_situation, is_emergency_situation
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
from ai_assistant import ElderlyAIAssistant

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///elderly_care.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    emergency_contact = db.Column(db.String(100))
    medical_history = db.Column(db.Text)
    health_data = db.relationship('HealthData', backref='user', lazy=True)
    reminders = db.relationship('Reminder', backref='user', lazy=True)

class HealthData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    heart_rate = db.Column(db.Integer)
    blood_pressure = db.Column(db.String(20))
    oxygen_level = db.Column(db.Integer)
    temperature = db.Column(db.Float)
    glucose_level = db.Column(db.Float)
    sleep_hours = db.Column(db.Float)
    activity_level = db.Column(db.String(20))
    medication_adherence = db.Column(db.Boolean)
    pain_level = db.Column(db.Integer)
    mood = db.Column(db.Integer)
    notes = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    alert_level = db.Column(db.String(20))
    health_score = db.Column(db.Float)

class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    reminder_type = db.Column(db.String(20))  # medication, appointment, etc.
    priority = db.Column(db.String(20), default='normal')

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50))
    message = db.Column(db.Text)
    priority = db.Column(db.String(20))
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    acknowledged = db.Column(db.Boolean, default=False)

def init_db():
    """Initialize the database and create tables"""
    with app.app_context():
        # Drop all tables
        db.drop_all()
        # Create all tables
        db.create_all()
        
        # Create a default user if none exists
        if not User.query.filter_by(username='demo').first():
            default_user = User(
                username='demo',
                password=generate_password_hash('demo123'),
                name='Demo User',
                email='demo@example.com',
                age=65,
                gender='Not specified',
                emergency_contact='Emergency Contact: 911',
                medical_history='No pre-existing conditions'
            )
            db.session.add(default_user)
            db.session.commit()

# Initialize database
init_db()

# Load ML model and scaler
try:
    model = joblib.load('models/health_predictor.joblib')
    scaler = joblib.load('models/scaler.joblib')
except:
    # Train a simple model if not exists
    model = RandomForestClassifier()
    scaler = StandardScaler()

# Initialize AI Assistant
ai_assistant = ElderlyAIAssistant()

def analyze_health_data(data):
    """
    Analyze health data and generate alerts and predictions
    """
    # Define normal ranges for vital signs and health metrics
    ranges = {
        'heart_rate': {
            'normal': (60, 100),
            'warning': (50, 120),
            'critical': (40, 130)
        },
        'oxygen_level': {
            'normal': (95, 100),
            'warning': (90, 94),
            'critical': (0, 89)
        },
        'temperature': {
            'normal': (97.0, 99.0),
            'warning': (96.0, 100.0),
            'critical': (95.0, 103.0)
        },
        'glucose_level': {
            'normal': (70, 140),
            'warning': (60, 180),
            'critical': (50, 200)
        },
        'sleep_hours': {
            'normal': (7, 9),
            'warning': (5, 10),
            'critical': (0, 4)
        }
    }
    
    alerts = []
    alert_level = 'normal'
    health_score = 100  # Start with perfect score and deduct based on issues
    
    try:
        # Analyze vital signs
        # Heart Rate Analysis
        hr = float(data['heart_rate'])
        if hr < ranges['heart_rate']['normal'][0] or hr > ranges['heart_rate']['normal'][1]:
            if hr < ranges['heart_rate']['warning'][0] or hr > ranges['heart_rate']['warning'][1]:
                alerts.append(f"CRITICAL: Heart rate at {hr} BPM is severely abnormal")
                alert_level = 'danger'
                health_score -= 30
            else:
                alerts.append(f"WARNING: Heart rate at {hr} BPM is outside normal range")
                alert_level = 'warning'
                health_score -= 15

        # Oxygen Level Analysis
        o2 = float(data['oxygen_level'])
        if o2 < ranges['oxygen_level']['normal'][0]:
            if o2 < ranges['oxygen_level']['warning'][0]:
                alerts.append(f"CRITICAL: Oxygen level at {o2}% is dangerously low")
                alert_level = 'danger'
                health_score -= 40
            else:
                alerts.append(f"WARNING: Oxygen level at {o2}% is below normal")
                alert_level = 'warning'
                health_score -= 20

        # Temperature Analysis
        temp = float(data['temperature'])
        if temp < ranges['temperature']['normal'][0] or temp > ranges['temperature']['normal'][1]:
            if temp < ranges['temperature']['warning'][0] or temp > ranges['temperature']['warning'][1]:
                alerts.append(f"CRITICAL: Temperature at {temp}°F requires immediate attention")
                alert_level = 'danger'
                health_score -= 25
            else:
                alerts.append(f"WARNING: Temperature at {temp}°F is outside normal range")
                alert_level = 'warning'
                health_score -= 10

        # Glucose Level Analysis
        glucose = float(data['glucose_level'])
        if glucose < ranges['glucose_level']['normal'][0] or glucose > ranges['glucose_level']['normal'][1]:
            if glucose < ranges['glucose_level']['warning'][0] or glucose > ranges['glucose_level']['warning'][1]:
                alerts.append(f"CRITICAL: Glucose level at {glucose} mg/dL requires immediate attention")
                alert_level = 'danger'
                health_score -= 25
            else:
                alerts.append(f"WARNING: Glucose level at {glucose} mg/dL is outside normal range")
                alert_level = 'warning'
                health_score -= 10

        # Sleep Analysis
        sleep = float(data['sleep_hours'])
        if sleep < ranges['sleep_hours']['normal'][0] or sleep > ranges['sleep_hours']['normal'][1]:
            alerts.append(f"NOTE: Sleep duration of {sleep} hours is outside recommended range")
            health_score -= 5

        # Activity Level Analysis
        activity_scores = {
            'sedentary': -10,
            'light': 0,
            'moderate': 5,
            'active': 10,
            'very_active': 15
        }
        health_score += activity_scores.get(data['activity_level'], 0)

        # Medication Adherence
        if not data['medication_adherence']:
            alerts.append("WARNING: Missed medications today")
            health_score -= 15

        # Pain Level Analysis
        pain = int(data['pain_level'])
        if pain >= 7:
            alerts.append(f"ALERT: High pain level reported ({pain}/10)")
            alert_level = 'warning'
            health_score -= 20
        elif pain >= 4:
            alerts.append(f"NOTE: Moderate pain level reported ({pain}/10)")
            health_score -= 10

        # Mood Analysis
        mood = int(data['mood'])
        if mood <= 2:
            alerts.append("NOTE: Low mood reported - may need attention")
            health_score -= 10

        # Adjust final health score
        health_score = max(0, min(100, health_score))  # Keep between 0 and 100

        # Generate AI insights using the trained model
        try:
            # Prepare data for prediction
            features = [
                hr, o2, temp, glucose, sleep,
                activity_scores.get(data['activity_level'], 0),
                1 if data['medication_adherence'] else 0,
                pain, mood
            ]
            
            # Scale features and make prediction if model exists
            if 'model' in globals() and 'scaler' in globals():
                features_scaled = scaler.transform([features])
                risk_prediction = model.predict(features_scaled)[0]
                if risk_prediction > 0.7:
                    alerts.append("AI ALERT: High risk pattern detected - Consider medical consultation")
                    if alert_level != 'danger':
                        alert_level = 'warning'
        except Exception as e:
            print(f"AI prediction error: {str(e)}")

        return {
            'alerts': alerts,
            'alert_level': alert_level,
            'health_score': health_score,
            'analysis_timestamp': datetime.datetime.utcnow().isoformat()
        }

    except Exception as e:
        print(f"Error in health analysis: {str(e)}")
        return {
            'alerts': ["Error analyzing health data"],
            'alert_level': 'error',
            'health_score': 0,
            'analysis_timestamp': datetime.datetime.utcnow().isoformat()
        }

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 400
        
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        username=data['username'],
        password=hashed_password,
        name=data.get('name', ''),
        email=data.get('email', ''),
        age=data.get('age'),
        gender=data.get('gender', ''),
        emergency_contact=data.get('emergency_contact', ''),
        medical_history=data.get('medical_history', '')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'User registered successfully'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password, data['password']):
        return jsonify({
            'success': True,
            'user_id': user.id,
            'username': user.username,
            'name': user.name,
            'email': user.email
        })
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/health/add', methods=['POST'])
def add_health_data():
    try:
        data = request.json
        print("Received health data:", data)
        
        # Validate and convert data types
        data['heart_rate'] = int(data['heart_rate'])
        data['oxygen_level'] = int(data['oxygen_level'])
        data['temperature'] = float(data['temperature'])
        data['glucose_level'] = float(data['glucose_level'])
        data['sleep_hours'] = float(data['sleep_hours'])
        data['pain_level'] = int(data['pain_level'])
        
        # Convert medication_adherence to boolean
        if isinstance(data['medication_adherence'], str):
            data['medication_adherence'] = data['medication_adherence'].lower() == 'true'
        
        # Analyze health data
        analysis_result = analyze_health_data(data)
        
        new_health_data = HealthData(
            user_id=data['user_id'],
            heart_rate=data['heart_rate'],
            blood_pressure=data['blood_pressure'],
            oxygen_level=data['oxygen_level'],
            temperature=data['temperature'],
            glucose_level=data['glucose_level'],
            sleep_hours=data['sleep_hours'],
            activity_level=data['activity_level'],
            medication_adherence=data['medication_adherence'],
            pain_level=data['pain_level'],
            mood=data['mood'],
            notes=data.get('notes', ''),
            alert_level=analysis_result['alert_level'],
            health_score=analysis_result['health_score']
        )
        
        db.session.add(new_health_data)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Health data added successfully',
            'analysis': analysis_result
        })
    except Exception as e:
        db.session.rollback()
        print("Error adding health data:", str(e))
        return jsonify({
            'success': False,
            'message': f'Failed to submit health data: {str(e)}'
        }), 500

@app.route('/api/health/<int:user_id>', methods=['GET'])
def get_health_data(user_id):
    health_data = HealthData.query.filter_by(user_id=user_id).order_by(HealthData.timestamp.desc()).all()
    data = [{
        'id': h.id,
        'heart_rate': h.heart_rate,
        'blood_pressure': h.blood_pressure,
        'oxygen_level': h.oxygen_level,
        'temperature': h.temperature,
        'glucose_level': h.glucose_level,
        'sleep_hours': h.sleep_hours,
        'activity_level': h.activity_level,
        'medication_adherence': h.medication_adherence,
        'pain_level': h.pain_level,
        'mood': h.mood,
        'notes': h.notes,
        'timestamp': h.timestamp.isoformat(),
        'alert_level': h.alert_level
    } for h in health_data]
    
    return jsonify(data)

@app.route('/api/reminders/<int:user_id>', methods=['GET', 'POST'])
def handle_reminders(user_id):
    if request.method == 'GET':
        reminders = Reminder.query.filter_by(user_id=user_id).order_by(Reminder.due_date).all()
        return jsonify([{
            'id': r.id,
            'title': r.title,
            'description': r.description,
            'reminder_type': r.reminder_type,
            'due_date': r.due_date.isoformat(),
            'completed': r.completed,
            'priority': r.priority
        } for r in reminders])
    
    data = request.json
    new_reminder = Reminder(
        user_id=user_id,
        title=data['title'],
        description=data.get('description', ''),
        reminder_type=data['reminder_type'],
        due_date=datetime.datetime.fromisoformat(data['due_date']),
        priority=data.get('priority', 'normal')
    )
    
    db.session.add(new_reminder)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Reminder added successfully'})

@app.route('/api/safety', methods=['GET'])
def get_safety():
    try:
        conn = sqlite3.connect(DATABASE)
        df = pd.read_sql_query("""
            SELECT *
            FROM safety_data 
            ORDER BY timestamp DESC 
            LIMIT 10
        """, conn)
        conn.close()
        return jsonify(df.to_dict(orient='records'))
    except Exception as e:
        print(f"Error fetching safety data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/reminders', methods=['GET'])
def get_reminders():
    try:
        conn = sqlite3.connect(DATABASE)
        df = pd.read_sql_query("""
            SELECT *
            FROM reminders 
            WHERE acknowledged = 'No'
            ORDER BY scheduled_time ASC
        """, conn)
        conn.close()
        return jsonify(df.to_dict(orient='records'))
    except Exception as e:
        print(f"Error fetching reminders: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_id = data.get('user_id')
        query = data.get('query')
        
        # Get user data
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get latest health data
        health_data = HealthData.query.filter_by(user_id=user_id).order_by(HealthData.timestamp.desc()).first()
        
        # Prepare user data for AI
        user_data = {
            'name': user.name,
            'age': user.age,
            'medical_history': user.medical_history,
            'medication_schedule': get_medication_schedule(user_id),
            'daily_routines': get_daily_routines(user_id),
            'mood_history': get_mood_history(user_id)
        }
        
        # Generate AI response
        response = ai_assistant.generate_response(user_data, query, health_data.__dict__ if health_data else None)
        
        # Store any generated alerts
        for alert in response.get('alerts', []):
            if alert['priority'] in ['high', 'critical']:
                store_alert(user_id, alert)
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/daily-schedule', methods=['GET'])
def get_daily_schedule():
    try:
        user_id = request.args.get('user_id')
        current_time = datetime.datetime.now()
        
        # Get user's schedule
        schedule = {
            'medications': get_medication_schedule(user_id),
            'routines': get_daily_routines(user_id),
            'appointments': get_appointments(user_id),
            'exercises': get_exercise_schedule(user_id)
        }
        
        # Get AI recommendations
        user = User.query.get(user_id)
        health_data = HealthData.query.filter_by(user_id=user_id).order_by(HealthData.timestamp.desc()).first()
        
        user_data = {
            'name': user.name,
            'age': user.age,
            'medical_history': user.medical_history,
            'medication_schedule': schedule['medications']
        }
        
        ai_insights = ai_assistant._generate_recommendations(user_data, health_data.__dict__ if health_data else None)
        
        return jsonify({
            'schedule': schedule,
            'recommendations': ai_insights,
            'next_actions': ai_assistant._get_next_actions(user_data)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_medication_schedule(user_id):
    # Get medication schedule from reminders
    medications = Reminder.query.filter_by(
        user_id=user_id,
        reminder_type='medication',
        completed=False
    ).all()
    
    return [{
        'name': med.title,
        'description': med.description,
        'next_dose': med.due_date.isoformat(),
        'priority': med.priority
    } for med in medications]

def get_daily_routines(user_id):
    # Get daily routines from reminders
    routines = Reminder.query.filter_by(
        user_id=user_id,
        reminder_type='routine',
        completed=False
    ).all()
    
    return [{
        'activity': routine.title,
        'time': routine.due_date.strftime('%H:%M'),
        'description': routine.description,
        'completed': routine.completed
    } for routine in routines]

def get_mood_history(user_id):
    # Get mood history from health data
    moods = HealthData.query.filter_by(user_id=user_id).order_by(HealthData.timestamp.desc()).limit(7).all()
    
    return [{
        'mood': entry.mood,
        'timestamp': entry.timestamp.isoformat(),
        'notes': entry.notes
    } for entry in moods]

def get_appointments(user_id):
    # Get upcoming appointments
    appointments = Reminder.query.filter_by(
        user_id=user_id,
        reminder_type='appointment',
        completed=False
    ).all()
    
    return [{
        'title': apt.title,
        'datetime': apt.due_date.isoformat(),
        'description': apt.description,
        'priority': apt.priority
    } for apt in appointments]

def get_exercise_schedule(user_id):
    # Get exercise schedule
    exercises = Reminder.query.filter_by(
        user_id=user_id,
        reminder_type='exercise',
        completed=False
    ).all()
    
    return [{
        'activity': ex.title,
        'time': ex.due_date.strftime('%H:%M'),
        'description': ex.description,
        'completed': ex.completed
    } for ex in exercises]

def store_alert(user_id, alert):
    # Store important alerts in the database
    new_alert = Alert(
        user_id=user_id,
        type=alert['type'],
        message=alert['message'],
        priority=alert['priority'],
        timestamp=datetime.datetime.now()
    )
    db.session.add(new_alert)
    db.session.commit()

@app.route('/api/load-data', methods=['POST'])
def load_datasets():
    try:
        print("Starting data load process...")
        
        # Load and transform health data
        health_file = os.path.join('data', 'health_monitoring.csv')
        print(f"Loading health data from {health_file}")
        health = pd.read_csv(health_file)
        
        # Load safety data
        safety_file = os.path.join('data', 'safety_monitoring.csv')
        print(f"Loading safety data from {safety_file}")
        safety = pd.read_csv(safety_file)
        
        # Load reminders data
        reminder_file = os.path.join('data', 'daily_reminder.csv')
        print(f"Loading reminder data from {reminder_file}")
        reminder = pd.read_csv(reminder_file)
        
        # Save to SQLite
        conn = sqlite3.connect(DATABASE)
        health.to_sql("health_data", conn, if_exists="replace", index=False)
        safety.to_sql("safety_data", conn, if_exists="replace", index=False)
        reminder.to_sql("reminders", conn, if_exists="replace", index=False)
        conn.close()
        
        return jsonify({
            "message": "Data loaded successfully",
            "health_records": len(health),
            "safety_records": len(safety),
            "reminder_records": len(reminder)
        })
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        return jsonify({
            "error": str(e),
            "details": "Check server logs for more information"
        }), 500

if __name__ == '__main__':
    print("Server starting on http://localhost:5000")
    app.run(debug=True, port=5000) 
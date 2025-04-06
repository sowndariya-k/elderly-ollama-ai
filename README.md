# Elderly Care Assistant

A comprehensive elderly care monitoring system powered by LLaMA3 and Ollama, featuring real-time health monitoring, safety alerts, and intelligent assistance.

## Features

- Real-time health monitoring (heartbeat, blood pressure)
- Safety event tracking and alerts
- Daily reminders and medication tracking
- AI-powered decision support using LLaMA3
- Modern, responsive web interface
- Local data storage with SQLite

## Prerequisites

- Python 3.8+
- Node.js 14+
- Ollama (for LLaMA3 integration)
- SQLite3

## Setup Instructions

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install Ollama and LLaMA3:
```bash
# Follow instructions at https://ollama.ai/download
ollama pull llama3
```

4. Start the backend server:
```bash
python app.py
```

### Frontend Setup

1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

## Project Structure

```
elderly-care-assistant/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── elderly_care.db     # SQLite database
│   └── data/              # CSV data files
└── frontend/
    ├── public/            # Static files
    └── src/              # React components
```

## API Endpoints

- `GET /api/health` - Get latest health data
- `GET /api/safety` - Get safety events
- `GET /api/reminders` - Get daily reminders
- `POST /api/ask` - Query LLaMA3 for assistance
- `POST /api/load-data` - Load CSV data into database

## Data Files

Place your CSV files in the backend directory:
- `health_monitoring.csv`
- `safety_monitoring.csv`
- `daily_reminder.csv`

## Running the Application

1. Start the backend server:
```bash
cd backend
python app.py
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:3000`

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License 
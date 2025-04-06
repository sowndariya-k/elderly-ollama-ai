import subprocess
import json
from datetime import datetime, timedelta

class ElderlyAIAssistant:
    def __init__(self):
        self.context = {
            "last_interaction": None,
            "daily_routines": {},
            "medication_schedule": {},
            "health_alerts": [],
            "mood_history": [],
            "social_interactions": []
        }
    
    def get_prompt_for_situation(self, user_data, query, health_data=None):
        base_prompt = f"""You are ElderCare AI, a compassionate and intelligent assistant specifically designed for elderly care.
Current Time: {datetime.now().strftime('%I:%M %p')}
Date: {datetime.now().strftime('%B %d, %Y')}

User Profile:
- Name: {user_data.get('name', 'User')}
- Age: {user_data.get('age', 'Not specified')}
- Medical History: {user_data.get('medical_history', 'Not available')}

Recent Health Status:
{self._format_health_data(health_data) if health_data else 'No recent health data available'}

Your capabilities include:
1. Medication reminders and adherence tracking
2. Daily routine management and gentle reminders
3. Health monitoring and emergency alerts
4. Emotional support and companionship
5. Social interaction encouragement
6. Memory assistance and cognitive exercises
7. Family connection facilitation
8. Emergency response guidance
9. Nutrition and exercise advice
10. Sleep quality monitoring

User Query: {query}

Please provide a caring, clear, and helpful response. If you detect any health concerns or emergency situations, highlight them prominently."""

        return base_prompt

    def _format_health_data(self, health_data):
        if not health_data:
            return "No health data available"
        
        return f"""Latest Vital Signs:
- Heart Rate: {health_data.get('heart_rate', 'N/A')} BPM
- Blood Pressure: {health_data.get('blood_pressure', 'N/A')}
- Oxygen Level: {health_data.get('oxygen_level', 'N/A')}%
- Temperature: {health_data.get('temperature', 'N/A')}°F
- Pain Level: {health_data.get('pain_level', 'N/A')}/10
- Mood: {health_data.get('mood', 'N/A')}/5"""

    def generate_response(self, user_data, query, health_data=None):
        prompt = self.get_prompt_for_situation(user_data, query, health_data)
        
        try:
            # Call Ollama with mistral
            result = subprocess.run(
                ["ollama", "run", "llama3", prompt],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            response = result.stdout.strip()
            
            # Add contextual awareness
            self.context["last_interaction"] = datetime.now()
            
            # Check for health-related keywords and generate alerts
            health_keywords = ["pain", "dizzy", "fell", "emergency", "help"]
            if any(keyword in query.lower() for keyword in health_keywords):
                self.context["health_alerts"].append({
                    "timestamp": datetime.now().isoformat(),
                    "query": query,
                    "alert_level": "high"
                })
            
            return {
                "response": response,
                "alerts": self._generate_alerts(user_data, health_data),
                "recommendations": self._generate_recommendations(user_data, health_data),
                "next_actions": self._get_next_actions(user_data)
            }
        
        except Exception as e:
            return {
                "error": f"Failed to generate response: {str(e)}",
                "fallback_response": "I apologize, but I'm having trouble responding right now. If this is an emergency, please contact your emergency services or caregiver immediately."
            }

    def _generate_alerts(self, user_data, health_data):
        alerts = []
        current_time = datetime.now()

        # Medication alerts
        if "medication_schedule" in user_data:
            for med in user_data["medication_schedule"]:
                next_dose = datetime.fromisoformat(med["next_dose"])
                if next_dose <= current_time + timedelta(minutes=30):
                    alerts.append({
                        "type": "medication",
                        "priority": "high",
                        "message": f"Time to take {med['name']} in {(next_dose - current_time).minutes} minutes"
                    })

        # Health alerts
        if health_data:
            if health_data.get("oxygen_level", 100) < 95:
                alerts.append({
                    "type": "health",
                    "priority": "critical",
                    "message": "Low oxygen level detected - Please check breathing and contact healthcare provider"
                })
            
            if health_data.get("pain_level", 0) >= 7:
                alerts.append({
                    "type": "health",
                    "priority": "high",
                    "message": "High pain level reported - Consider pain management measures"
                })

        # Daily routine alerts
        routine_schedule = {
            "morning_meds": "08:00",
            "breakfast": "09:00",
            "exercise": "10:00",
            "lunch": "13:00",
            "afternoon_meds": "14:00",
            "social": "15:00",
            "dinner": "18:00",
            "evening_meds": "20:00",
            "sleep": "22:00"
        }

        current_hour = current_time.hour
        for activity, time in routine_schedule.items():
            hour = int(time.split(":")[0])
            if current_hour == hour:
                alerts.append({
                    "type": "routine",
                    "priority": "normal",
                    "message": f"Time for your {activity.replace('_', ' ').title()}"
                })

        return alerts

    def _generate_recommendations(self, user_data, health_data):
        recommendations = []
        
        # Exercise recommendations
        if health_data and health_data.get("activity_level") == "sedentary":
            recommendations.append({
                "type": "exercise",
                "message": "Consider gentle exercises like walking or stretching",
                "details": ["5-minute walk in your room", "Seated arm stretches", "Ankle rotations"]
            })

        # Social recommendations
        if "social_interactions" in self.context and len(self.context["social_interactions"]) < 2:
            recommendations.append({
                "type": "social",
                "message": "Try to increase social interaction",
                "details": ["Call a family member", "Join online community chat", "Participate in group activities"]
            })

        # Cognitive exercises
        recommendations.append({
            "type": "cognitive",
            "message": "Daily brain exercise",
            "details": ["Solve a puzzle", "Read news", "Practice memory games"]
        })

        return recommendations

    def _get_next_actions(self, user_data):
        current_time = datetime.now()
        next_actions = []

        # Get next medication time
        if "medication_schedule" in user_data:
            next_med = min(
                user_data["medication_schedule"],
                key=lambda x: abs(datetime.fromisoformat(x["next_dose"]) - current_time)
            )
            next_actions.append({
                "type": "medication",
                "time": next_med["next_dose"],
                "action": f"Take {next_med['name']}"
            })

        # Next meal time
        meal_times = {
            "breakfast": "09:00",
            "lunch": "13:00",
            "dinner": "18:00"
        }
        
        next_meal = min(
            meal_times.items(),
            key=lambda x: abs(datetime.strptime(x[1], "%H:%M").hour - current_time.hour)
        )
        next_actions.append({
            "type": "meal",
            "time": next_meal[1],
            "action": f"Have {next_meal[0]}"
        })

        return next_actions

    def update_context(self, user_data):
        """Update the AI's context with new user data"""
        self.context.update({
            "last_interaction": datetime.now(),
            "daily_routines": user_data.get("daily_routines", {}),
            "medication_schedule": user_data.get("medication_schedule", {}),
            "mood_history": user_data.get("mood_history", [])
        }) 
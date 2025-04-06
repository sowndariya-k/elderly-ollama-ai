"""
Configuration for AI chat functionality
"""

SYSTEM_PROMPTS = {
    "health_assistant": """You are an AI health assistant for elderly care monitoring. Your role is to:
1. Monitor and analyze health data trends
2. Provide immediate alerts for concerning health patterns
3. Offer health and safety recommendations
4. Answer questions about medications and daily routines
5. Help interpret medical data and provide clear explanations

If you notice any concerning patterns or emergency situations, clearly highlight them and suggest immediate actions.
Use clear, simple language and be empathetic in your responses.""",

    "emergency": """EMERGENCY MODE ACTIVATED
You are now in emergency response mode. Your primary objectives are:
1. Assess the situation severity
2. Provide clear, step-by-step emergency instructions
3. Recommend immediate actions for caregivers
4. Help coordinate emergency response if needed
5. Keep track of vital signs and changes in condition

Use direct, simple language and numbered steps. Mark urgent items with [URGENT] prefix."""
}

ALERT_THRESHOLDS = {
    "heart_rate": {
        "low": 60,
        "high": 100,
        "critical_low": 50,
        "critical_high": 120
    },
    "oxygen_saturation": {
        "low": 95,
        "critical": 90
    },
    "glucose_levels": {
        "low": 70,
        "high": 180,
        "critical_low": 54,
        "critical_high": 250
    },
    "inactivity_duration": {
        "warning": 3600,  # 1 hour
        "critical": 7200  # 2 hours
    }
}

EMERGENCY_KEYWORDS = [
    "fall", "fallen", "chest pain", "breathing", "unconscious",
    "unresponsive", "emergency", "help", "ambulance", "critical"
]

def is_emergency_situation(message, health_data=None):
    """
    Check if the current situation is an emergency based on the message
    and optional health data
    """
    # Check message for emergency keywords
    message_lower = message.lower()
    if any(keyword in message_lower for keyword in EMERGENCY_KEYWORDS):
        return True
    
    # Check health data if provided
    if health_data:
        hr = health_data.get('heart_rate')
        o2 = health_data.get('oxygen_saturation')
        
        if hr and (hr < ALERT_THRESHOLDS['heart_rate']['critical_low'] or 
                  hr > ALERT_THRESHOLDS['heart_rate']['critical_high']):
            return True
            
        if o2 and o2 < ALERT_THRESHOLDS['oxygen_saturation']['critical']:
            return True
    
    return False

def get_prompt_for_situation(message, health_data=None):
    """
    Select the appropriate prompt based on the situation
    """
    if is_emergency_situation(message, health_data):
        return SYSTEM_PROMPTS["emergency"]
    return SYSTEM_PROMPTS["health_assistant"] 
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  LocalHospital,
  Medication,
  AccessTime,
  Restaurant,
  DirectionsWalk,
  Help
} from '@mui/icons-material';

const AIChat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentModel] = useState('llama3:latest');
  const [suggestions] = useState([
    'How do I take my medications?',
    'What are my vital signs?',
    'When is my next doctor appointment?',
    'What should I eat today?',
    'How can I stay active?'
  ]);
  const [isOllamaConnected, setIsOllamaConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check Ollama connection
    const checkOllamaConnection = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          setIsOllamaConnected(true);
          setError(null);
          // Add initial greeting
          setMessages([
            {
              text: "Hello! I'm your AI Health Assistant. I'm here to help you with your health-related questions. How can I assist you today?",
              sender: 'bot',
              timestamp: new Date(),
              icon: <BotIcon color="primary" />
            }
          ]);
        } else {
          throw new Error('Ollama service not responding properly');
        }
      } catch (err) {
        setIsOllamaConnected(false);
        setError('Unable to connect to Ollama. Please make sure Ollama is running on your computer.');
        console.error('Ollama connection error:', err);
      }
    };

    checkOllamaConnection();
    // Check connection every 30 seconds
    const intervalId = setInterval(checkOllamaConnection, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const generateResponse = async (userInput) => {
    try {
      const healthData = JSON.parse(localStorage.getItem('healthData') || '[]');
      const userHealth = healthData.filter(data => data.userId === userId);
      const latestHealth = userHealth.length > 0 ? userHealth[userHealth.length - 1] : null;

      const llama3Prompt = `[INST]<<SYS>>
You are ElderCare AI, a highly advanced and compassionate health assistant powered by Llama 3. Your primary role is to help elderly users with their health-related questions and concerns.

Current Context:
Time: ${new Date().toLocaleTimeString()}
Date: ${new Date().toLocaleDateString()}

${latestHealth ? `User's Current Health Status:
❤️ Heart Rate: ${latestHealth.heartRate} BPM
🩺 Blood Pressure: ${latestHealth.bloodPressure}
🫁 Oxygen Level: ${latestHealth.oxygenLevel}%
🌡️ Temperature: ${latestHealth.temperature}°F` : 'No health data available yet'}

Your responses should be:
1. Clear and easy to understand for elderly users
2. Empathetic and patient
3. Include relevant emojis to make the conversation friendly
4. Medically accurate while using simple language
5. Brief but informative (2-3 short paragraphs maximum)
6. Include gentle reminders to consult healthcare providers when appropriate

If discussing health metrics:
- Explain what the numbers mean in simple terms
- Highlight any concerning values
- Suggest simple actions when appropriate
<</SYS>>

${userInput}[/INST]`;

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            {
              role: "system",
              content: llama3Prompt
            }
          ],
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      let aiResponse = data.message?.content || data.response;

      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }

      aiResponse = aiResponse
        .replace(/\[\/INST\]/g, '')
        .replace(/\[INST\]/g, '')
        .trim();

      if (!aiResponse.includes('❤️') && aiResponse.toLowerCase().includes('heart')) {
        aiResponse = aiResponse.replace(/heart/i, '❤️ heart');
      }
      if (!aiResponse.includes('🩺') && aiResponse.toLowerCase().includes('doctor')) {
        aiResponse = aiResponse.replace(/doctor/i, '🩺 doctor');
      }
      if (!aiResponse.includes('💊') && aiResponse.toLowerCase().includes('medication')) {
        aiResponse = aiResponse.replace(/medication/i, '💊 medication');
      }

      let icon = <BotIcon color="primary" />;
      const lowerResponse = aiResponse.toLowerCase();
      
      if (lowerResponse.includes('medicine') || lowerResponse.includes('medication')) {
        icon = <Medication color="primary" />;
      } else if (lowerResponse.includes('doctor') || lowerResponse.includes('hospital')) {
        icon = <LocalHospital color="error" />;
      } else if (lowerResponse.includes('appointment')) {
        icon = <AccessTime color="primary" />;
      } else if (lowerResponse.includes('food') || lowerResponse.includes('eat') || lowerResponse.includes('diet')) {
        icon = <Restaurant color="success" />;
      } else if (lowerResponse.includes('exercise') || lowerResponse.includes('walk')) {
        icon = <DirectionsWalk color="success" />;
      }

      return {
        text: aiResponse,
        icon: icon
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!isOllamaConnected) {
      setError('Cannot send message: Ollama is not connected. Please make sure Ollama is running.');
      return;
    }

    const userMessage = {
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
      icon: <PersonIcon />
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await generateResponse(userMessage.text);
      setMessages(prev => [...prev, {
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        icon: response.icon
      }]);
    } catch (error) {
      console.error('Error in handleSend:', error);
      setError('Unable to get a response from Ollama. Please check if the service is running properly.');
      setMessages(prev => [...prev, {
        text: "I apologize, but I'm having trouble connecting to my AI system. Please make sure Ollama is running on your computer and try again.",
        sender: 'bot',
        timestamp: new Date(),
        icon: <Help color="error" />
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    handleSend();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {!isOllamaConnected && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ollama is not connected. Please make sure the Ollama service is running on your computer.
          <br />
          You can start it by opening a terminal and running: <code>ollama serve</code>
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '70vh' }}>
        <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">
            AI Health Assistant
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1,
                  mb: 2
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main' }}>
                    {message.icon}
                  </Avatar>
                </ListItemAvatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {message.text}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </ListItem>
            ))}
            {loading && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <BotIcon />
                  </Avatar>
                </ListItemAvatar>
                <CircularProgress size={20} />
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                color="primary"
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <IconButton 
                  color="primary" 
                  onClick={handleSend} 
                  disabled={!input.trim() || loading}
                >
                  <SendIcon />
                </IconButton>
              )
            }}
          />
        </Box>
      </Paper>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Tips
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Ask any health-related questions
            • Get personalized advice based on your health data
            • Use suggestion chips for quick access to common topics
            • Available 24/7 to help you stay healthy
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AIChat; 
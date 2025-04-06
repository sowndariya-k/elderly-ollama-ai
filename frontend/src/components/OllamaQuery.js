import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  IconButton,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const OllamaQuery = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/ask', {
        query: userMessage,
        context: messages.map(m => `${m.role}: ${m.content}`).join('\n')
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const MessageContent = ({ content, role }) => (
    <Box
      sx={{
        backgroundColor: role === 'user' ? '#e3f2fd' : '#f5f5f5',
        padding: 2,
        borderRadius: 2,
        maxWidth: '80%',
        alignSelf: role === 'user' ? 'flex-end' : 'flex-start'
      }}
    >
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          AI Assistant
        </Typography>
        <IconButton onClick={clearChat} color="primary" title="Clear chat">
          <DeleteIcon />
        </IconButton>
      </Box>

      <Paper
        elevation={3}
        sx={{
          height: '400px',
          mb: 2,
          p: 2,
          overflowY: 'auto',
          backgroundColor: '#fafafa'
        }}
      >
        <List>
          {messages.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                padding: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{ mb: 0.5, color: 'text.secondary' }}
              >
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </Typography>
              <MessageContent content={message.content} role={message.role} />
            </ListItem>
          ))}
          {loading && (
            <ListItem sx={{ justifyContent: 'flex-start' }}>
              <CircularProgress size={20} />
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            sx={{ backgroundColor: 'white' }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || !input.trim()}
            endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Send
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default OllamaQuery; 
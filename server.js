// first i will check the node --version 
// then i will install npm install @google/generative-ai express
// then i will also install npm install mongoose

const mongoose = require('mongoose');

const uri = `mongodb://localhost:27017/<Chatbot>`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(error => console.error('Error connecting:', error));


  const express = require('express');
  const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
  const dotenv = require('dotenv').config();
  
  const app = express();
  const port = process.env.PORT || 3000;
  app.use(express.json());
  
  const MODEL_NAME = "gemini-pro"; // Replace with your desired model name
  const API_KEY = process.env.API_KEY;
  
  async function runChat(userInput) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
    const generationConfig = {
      temperature: 0.9, // Adjust for more creative or conservative responses
      topK: 1,
      topP: 1,
      maxOutputTokens: 1000,
    };
  
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      // ... other safety settings
    ];
  
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [], // Removed static conversation history
    });
  
    const result = await chat.sendMessage(userInput);
    const response = result.response;
    return response.text();
  }
  
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Assuming your HTML file is index.html
  });
  
  app.post('/chat', async (req, res) => {
    try {
      const userInput = req.body?.userInput;
      console.log('incoming /chat req', userInput);
      if (!userInput) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
  
      const response = await runChat(userInput);
      res.json({ response });
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
  
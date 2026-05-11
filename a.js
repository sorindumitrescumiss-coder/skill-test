import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;

export async function askAI(prompt) {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI that evaluates skill test answers."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",

          // IMPORTANT (OpenRouter requirement)
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "SkillTest App"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("OpenRouter error:", err.response?.data || err.message);
    throw err;
  }
}
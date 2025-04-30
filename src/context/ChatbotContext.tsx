
import { createContext, useContext, useState } from "react";
import { toast } from "@/components/ui/sonner";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
};

type ChatType = "academic" | "general";

type ChatbotContextType = {
  messages: Record<ChatType, Message[]>;
  activeChat: ChatType;
  setActiveChat: (type: ChatType) => void;
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
};

const ChatbotContext = createContext<ChatbotContextType | null>(null);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
};

export const ChatbotProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Record<ChatType, Message[]>>({
    academic: [
      {
        id: "welcome-academic",
        text: "Hi there! I'm your academic assistant. Ask me questions about your studies or uploaded documents.",
        isUser: false,
        timestamp: new Date().toISOString(),
      },
    ],
    general: [
      {
        id: "welcome-general",
        text: "Hello! I'm your general knowledge assistant. Ask me anything you'd like to know.",
        isUser: false,
        timestamp: new Date().toISOString(),
      },
    ],
  });
  const [activeChat, setActiveChat] = useState<ChatType>("academic");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message to the conversation
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...prev[activeChat], userMessage],
    }));
    
    setIsLoading(true);
    
    try {
      let responseText = "";
      
      if (activeChat === "general") {
        // Call Groq API for general inquiries
        const apiKey = "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";
        
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "llama3-8b-8192",
              messages: [
                {
                  role: "system",
                  content: "You are a helpful academic assistant for students. Provide concise, accurate information."
                },
                {
                  role: "user",
                  content: text
                }
              ],
              temperature: 0.5,
              max_tokens: 1024
            })
          });
          
          if (!response.ok) {
            throw new Error("API request failed");
          }
          
          const data = await response.json();
          responseText = data.choices[0].message.content;
        } catch (error) {
          console.error("Error calling Groq API:", error);
          responseText = "Sorry, I encountered an error processing your request. Please try again later.";
          toast.error("Failed to connect to the knowledge assistant");
        }
      } else {
        // Academic assistant (mock response for now)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple keyword-based responses for the academic assistant
        if (text.toLowerCase().includes("math") || text.toLowerCase().includes("calculus")) {
          responseText = "For mathematics questions, I'd recommend looking at your uploaded materials or checking Khan Academy for additional examples. Would you like me to help you create a study plan for this topic?";
        } else if (text.toLowerCase().includes("essay") || text.toLowerCase().includes("write")) {
          responseText = "When writing essays, remember to structure with an introduction, body paragraphs, and conclusion. Start with a clear thesis statement and support with evidence. Would you like feedback on an outline?";
        } else if (text.toLowerCase().includes("schedule") || text.toLowerCase().includes("timetable")) {
          responseText = "Based on your current tasks, I'd recommend dedicating more time to your high-priority assignments before they're due. Would you like me to suggest a study schedule?";
        } else {
          responseText = "I can help you with that academic question. For the best results, consider uploading relevant study materials so I can give you more specific guidance tailored to your coursework.";
        }
      }
      
      // Add assistant's response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        text: responseText,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => ({
        ...prev,
        [activeChat]: [...prev[activeChat], assistantMessage],
      }));
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast.error("Something went wrong with your request");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ChatbotContext.Provider
      value={{
        messages,
        activeChat,
        setActiveChat,
        sendMessage,
        isLoading,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

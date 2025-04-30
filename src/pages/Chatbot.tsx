
import { useState, useRef, useEffect } from "react";
import { useChatbot } from "@/context/ChatbotContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, User, Bot, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const Chatbot = () => {
  const { messages, activeChat, setActiveChat, sendMessage, isLoading } = useChatbot();
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, activeChat]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeChat]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="py-4 px-6">
          <Tabs
            defaultValue={activeChat}
            value={activeChat}
            onValueChange={(value) => setActiveChat(value as "academic" | "general")}
            className="w-full"
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="academic">Academic Assistant</TabsTrigger>
                <TabsTrigger value="general">General Knowledge</TabsTrigger>
              </TabsList>
              
              <Button variant="outline" size="sm" className="text-xs">
                <Upload className="h-3 w-3 mr-1" /> Upload Material
              </Button>
            </div>
            
            <CardDescription className="mt-2">
              {activeChat === "academic" 
                ? "Ask questions about your courses, assignments, or uploaded study materials" 
                : "Ask any general knowledge questions using Groq AI"}
            </CardDescription>
          </Tabs>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1 p-6 pb-0"
          >
            <div className="space-y-4 pb-4">
              {messages[activeChat].map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? "bg-student-purple text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.isUser ? (
                        <>
                          <span className="text-xs font-medium">You</span>
                          <User className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          <Bot className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {activeChat === "academic" ? "Academic AI" : "General AI"}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                    <div className="text-right">
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800">
                    <div className="flex items-center space-x-2 mb-1">
                      <Bot className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        {activeChat === "academic" ? "Academic AI" : "General AI"}
                      </span>
                    </div>
                    <div className="flex space-x-1 py-2">
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask a question about ${
                  activeChat === "academic" ? "your coursework" : "anything"
                }...`}
                className="min-h-[60px] flex-1 resize-none"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-[60px] w-[60px] bg-student-purple hover:bg-student-purple-dark"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chatbot;

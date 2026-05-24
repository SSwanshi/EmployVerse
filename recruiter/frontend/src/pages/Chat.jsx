import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { getStoredToken } from '../services/api';
import { ArrowLeft, Send } from 'lucide-react';

const Chat = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  
  const [chat, setChat] = useState(null);
  const [details, setDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const chatSpaceRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const typingTimeoutRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const SOCKET_URL = 'http://localhost:3000'; // Socket IO runs on applicant backend (port 3000)
  const token = getStoredToken();

  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        // 1. Create or Get Chat
        const chatRes = await axios.post(
          `${API_BASE}/api/chat`,
          { applicationId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (chatRes.data.success) {
          const chatData = chatRes.data.chat;
          setChat(chatData);
          setDetails(chatRes.data.details);

          // 2. Fetch Messages
          const msgRes = await axios.get(
            `${API_BASE}/api/chat/${chatData._id}/messages`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (msgRes.data.success) {
            setMessages(msgRes.data.messages);
          }
        }
      } catch (err) {
        console.error('Error loading chat:', err);
        setError(err.response?.data?.message || 'Failed to open chat');
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      initChat();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [applicationId, API_BASE, token]);

  // Set up socket connections
  useEffect(() => {
    if (!chat) return;

    console.log('🔌 Connecting to Socket.IO server at:', SOCKET_URL);
    // Connect to applicant socket server
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected successfully. ID:', socket.id);
      // Join the application chat room
      console.log('🔌 Emitting join_chat for applicationId:', applicationId);
      socket.emit('join_chat', { applicationId }, (res) => {
        if (res?.success) {
          console.log('✅ Successfully joined chat room:', applicationId);
        } else {
          console.error('❌ Failed to join chat room:', res?.error);
          setError(res?.error || 'Failed to join chat room');
        }
      });
    });

    socket.on('receive_message', (message) => {
      console.log('📥 Received message via Socket:', message);
      setMessages((prev) => {
        // Dedup: if we already have this message ID, or if it replaces an optimistic temp message
        const hasId = prev.some((m) => m._id === message._id);
        if (hasId) {
          console.log('⚠️ Duplicate message ID ignored:', message._id);
          return prev;
        }

        const optimisticIndex = prev.findIndex(
          (m) => m._id.startsWith('temp-') && m.message === message.message && m.senderRole === message.senderRole
        );
        
        if (optimisticIndex !== -1) {
          console.log('🔄 Replacing optimistic message with actual message:', message._id);
          const updated = [...prev];
          updated[optimisticIndex] = message;
          return updated;
        }

        console.log('➕ Appending new message to state:', message.message);
        return [...prev, message];
      });
    });

    socket.on('typing', (data) => {
      console.log('⌨️ Recipient typing status:', data);
      if (data.role === 'applicant') {
        setIsTyping(true);
      }
    });

    socket.on('stop_typing', (data) => {
      console.log('⌨️ Recipient stopped typing status:', data);
      if (data.role === 'applicant') {
        setIsTyping(false);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected. Reason:', reason);
    });

    return () => {
      console.log('🔌 Cleaning up and disconnecting socket...');
      socket.disconnect();
    };
  }, [chat, SOCKET_URL, token, applicationId]);

  // Scroll to bottom
  useEffect(() => {
    if (chatSpaceRef.current) {
      if (isFirstLoadRef.current && messages.length > 0) {
        chatSpaceRef.current.scrollTop = chatSpaceRef.current.scrollHeight;
        isFirstLoadRef.current = false;
      } else {
        chatSpaceRef.current.scrollTo({
          top: chatSpaceRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!socketRef.current) return;

    if (!typing) {
      setTyping(true);
      socketRef.current.emit('typing', { applicationId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('stop_typing', { applicationId });
      }
      setTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    if (socketRef.current) {
      socketRef.current.emit('stop_typing', { applicationId });
      setTyping(false);
    }

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      _id: tempId,
      chatId: chat._id,
      senderId: chat.recruiterId,
      senderRole: 'recruiter',
      message: messageText,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);

    // Send over socket!
    if (socketRef.current && socketRef.current.connected) {
      console.log('📤 Sending message via Socket:', messageText);
      socketRef.current.emit('send_message', { chatId: chat._id, message: messageText }, (response) => {
        if (!response?.success) {
          console.error('❌ Failed to send message via Socket callback:', response?.error);
          // Rollback optimistic update
          setMessages((prev) => prev.filter((m) => m._id !== tempId));
        } else {
          console.log('✅ Message sent and acknowledged by Socket server:', response.message._id);
          // Replace temp message with actual message
          setMessages((prev) => prev.map((m) => m._id === tempId ? response.message : m));
        }
      });
    } else {
      // Fallback to REST API
      console.log('📤 Socket not connected or unavailable. Falling back to REST API to send message...');
      try {
        const response = await axios.post(
          `${API_BASE}/api/chat/${chat._id}/message`,
          { message: messageText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          console.log('✅ Message sent successfully via REST fallback:', response.data.message._id);
          setMessages((prev) => prev.map((m) => m._id === tempId ? response.data.message : m));
        }
      } catch (err) {
        console.error('❌ Failed to send message via REST fallback:', err);
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
          <p className="mt-4 text-slate-600 font-semibold">Opening chat room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-5 pb-10 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/selected-applicants')}
          className="mb-4 text-xs font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Selected Applications
        </button>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-850 px-4 py-3 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Chat window */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 overflow-hidden flex flex-col h-[75vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <h2 className="text-md font-bold leading-tight">{details?.jobTitle}</h2>
              <p className="text-[15px] text-slate-300 font-medium mt-0.5">
                {details?.companyName} 
              </p>
            </div>
            <div className="text-md font-bold leading-tight">Candidate: {details?.applicantName}</div>
          </div>

          {/* Chat Space */}
          <div ref={chatSpaceRef} className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <p className="text-xs font-semibold">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderRole === 'recruiter';
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm font-medium ${
                        isMe
                          ? 'bg-slate-900 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      <span className="block text-[9px] mt-1 text-right text-slate-450">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-400 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs font-semibold flex items-center gap-1">
                  <span>Candidate is typing</span>
                  <span className="flex gap-0.5 items-center">
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce delay-200"></span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-green-600 hover:bg-black text-white text-sm font-bold rounded-xl transition duration-150 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-0"
            >
              Send <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;

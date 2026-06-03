import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function getConversationId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const targetUserId = urlParams.get('user');
  const [selectedConvo, setSelectedConvo] = useState(targetUserId ? getConversationId(user.id, targetUserId) : null);
  const [selectedUser, setSelectedUser] = useState(targetUserId || null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: allMessages = [] } = useQuery({
    queryKey: ['all-messages', user.id],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_id: user.id }, '-created_date', 100);
      const received = await base44.entities.Message.filter({ receiver_id: user.id }, '-created_date', 100);
      return [...sent, ...received].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    refetchInterval: 5000,
  });

  // Group conversations
  const conversations = {};
  allMessages.forEach(msg => {
    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    const convoId = msg.conversation_id || getConversationId(user.id, otherId);
    if (!conversations[convoId]) {
      conversations[convoId] = { id: convoId, otherUserId: otherId, messages: [], lastMessage: null };
    }
    conversations[convoId].messages.push(msg);
    if (!conversations[convoId].lastMessage || new Date(msg.created_date) > new Date(conversations[convoId].lastMessage.created_date)) {
      conversations[convoId].lastMessage = msg;
    }
  });

  // If target user and no conversation exists, create a placeholder
  if (targetUserId && !conversations[getConversationId(user.id, targetUserId)]) {
    const convoId = getConversationId(user.id, targetUserId);
    conversations[convoId] = { id: convoId, otherUserId: targetUserId, messages: [], lastMessage: null };
  }

  const convoList = Object.values(conversations).sort((a, b) => {
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date);
  });

  const currentConvo = selectedConvo ? conversations[selectedConvo] : null;

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!newMessage.trim() || !selectedUser) return;
      await base44.entities.Message.create({
        conversation_id: selectedConvo,
        sender_id: user.id,
        receiver_id: selectedUser,
        content: newMessage.trim(),
      });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConvo?.messages?.length]);

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      <h1 className="text-2xl font-bold font-heading mb-4">Messages</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-3rem)]">
        {/* Conversation list */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-16rem)]">
            {convoList.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : convoList.map(convo => (
              <button
                key={convo.id}
                onClick={() => { setSelectedConvo(convo.id); setSelectedUser(convo.otherUserId); }}
                className={cn(
                  "w-full p-4 text-left border-b border-border hover:bg-muted/50 transition-colors",
                  selectedConvo === convo.id && "bg-secondary/5 border-l-2 border-l-secondary"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {convo.otherUserId?.slice(0, 2)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">User</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {convo.lastMessage?.content || 'Start a conversation'}
                    </p>
                  </div>
                  {convo.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(convo.lastMessage.created_date), 'MMM d')}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {!selectedConvo ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentConvo?.messages?.map(msg => (
                  <div key={msg.id} className={cn("flex", msg.sender_id === user.id ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5",
                      msg.sender_id === user.id
                        ? "bg-secondary text-white rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    )}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={cn("text-xs mt-1", msg.sender_id === user.id ? "text-white/60" : "text-muted-foreground")}>
                        {format(new Date(msg.created_date), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t p-3">
                <form onSubmit={e => { e.preventDefault(); sendMessage.mutate(); }} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="bg-secondary hover:bg-secondary/90 text-white">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
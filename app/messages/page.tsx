'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { chatService } from '@/services/chatService';
import { authService } from '@/services/authService';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Check,
  CheckCheck,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  FileText,
  Download,
  Edit,
} from 'lucide-react';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get('conversationId');

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId || null);
  const [activeConvData, setActiveConvData] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const userRes = await authService.getMe();
      if (!userRes.success || !userRes.data) {
        router.push('/login');
        return;
      }
      setCurrentUser(userRes.data);

      const res = await chatService.getConversations();
      if (res.success && res.data) {
        setConversations(res.data);
        if (!activeConvId && res.data.length > 0) {
          setActiveConvId(res.data[0].id);
        }
      } else {
        setError(res.message || 'Failed to fetch conversations');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveMessages = async (convId: string) => {
    try {
      const res = await chatService.getMessages(convId);
      if (res.success && res.data) {
        setActiveConvData(res.data.conversation);
        setMessages(res.data.messages || []);
      }
    } catch (err: any) {
      console.error('Error fetching messages', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchActiveMessages(activeConvId);
      const interval = setInterval(() => {
        fetchActiveMessages(activeConvId);
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await chatService.sendMessage(activeConvId, content);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        chatService.getConversations().then((r) => {
          if (r.success && r.data) setConversations(r.data);
        });
      } else {
        alert(res.message || 'Failed to send message');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Sparkles size={36} className="text-pink" style={{ marginBottom: '16px', animation: 'spin 3s linear infinite' }} />
        <p style={{ fontSize: '1.1rem' }}>Loading messaging workspace...</p>
      </div>
    );
  }

  const otherUser = activeConvData
    ? currentUser?.id === activeConvData.clientId
      ? activeConvData.freelancer
      : activeConvData.client
    : null;

  return (
    <div className="hero-network-bg grain-overlay" style={{ minHeight: '100vh', padding: '24px 24px 80px' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 className="editorial-title" style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>
              Messages <span className="badge badge-pink" style={{ fontSize: '0.78rem', marginLeft: '6px' }}>{conversations.length}</span>
            </h1>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '20px' }}>
            <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
              No active conversations
            </h3>
            <p style={{ maxWidth: '540px', margin: '0 auto 24px', lineHeight: '1.65' }}>
              Direct messaging is automatically enabled between clients and freelancers once a proposal is{' '}
              <strong className="text-pink">SHORTLISTED</strong> or <strong className="text-aqua">ACCEPTED</strong>.
            </p>
            <Link
              href={currentUser?.role === 'CLIENT' ? '/client/dashboard' : '/projects'}
              className="btn-primary"
              style={{ padding: '11px 24px', fontSize: '0.95rem' }}
            >
              {currentUser?.role === 'CLIENT' ? 'Go to Client Dashboard' : 'Explore Open Projects'}
            </Link>
          </div>
        ) : (
          <div
            className="glass-panel messages-split-view"
            style={{
              display: 'grid',
              gridTemplateColumns: '340px 1fr',
              minHeight: '680px',
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'var(--bg-panel)',
            }}
          >
            {/* ================= LEFT CONVERSATION LIST (Reference Image 4) ================= */}
            <div
              style={{
                borderRight: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    Messages
                  </span>
                  <span className="badge badge-pink" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                    {conversations.length}
                  </span>
                </div>
                <Edit size={16} className="text-dim" />
              </div>

              {/* Chat Items List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.map((conv) => {
                  const isSelected = conv.id === activeConvId;
                  const cOther = currentUser?.id === conv.clientId ? conv.freelancer : conv.client;
                  const lastMsg = conv.messages?.[0];

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                        borderLeft: isSelected ? '3px solid var(--accent-violet)' : '3px solid transparent',
                        transition: 'all 180ms ease',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      {/* Round Avatar */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7C3AED 0%, #25D9D2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontWeight: '800',
                          fontSize: '1rem',
                          flexShrink: 0,
                        }}
                      >
                        {cOther?.fullName ? cOther.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontWeight: '800', fontSize: '0.94rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cOther?.fullName || 'Participant'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lastMsg ? lastMsg.content : conv.project?.title || 'Active contract'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= RIGHT ACTIVE CHAT STREAM (Reference Image 4) ================= */}
            {activeConvData ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'var(--bg-panel)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F48AC2 0%, #7C3AED 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: '800',
                        fontSize: '1rem',
                      }}
                    >
                      {otherUser?.fullName ? otherUser.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                          {otherUser?.fullName || 'Participant'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        Last seen 10:30 AM • Project: <strong className="text-pink">{activeConvData.project?.title}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                    <Phone size={18} style={{ cursor: 'pointer' }} />
                    <Video size={18} style={{ cursor: 'pointer' }} />
                    <MoreVertical size={18} style={{ cursor: 'pointer' }} />
                  </div>
                </div>

                {/* Messages Stream */}
                <div
                  style={{
                    flex: 1,
                    padding: '24px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    background: 'var(--bg-input)',
                  }}
                >
                  {/* Date Divider */}
                  <div style={{ textAlign: 'center', margin: '8px 0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'var(--bg-surface)', padding: '3px 12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      Today
                    </span>
                  </div>

                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
                      <Sparkles size={28} className="text-aqua" style={{ marginBottom: '8px', opacity: 0.5 }} />
                      <p>Start the conversation! Introduce yourself or discuss project milestones.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;

                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '70%',
                              padding: '12px 18px',
                              borderRadius: '16px',
                              background: isMe
                                ? 'linear-gradient(135deg, #7C3AED 0%, #9047F3 100%)'
                                : 'var(--bg-panel)',
                              color: isMe ? '#FFFFFF' : 'var(--text-main)',
                              fontSize: '0.92rem',
                              lineHeight: '1.55',
                              wordBreak: 'break-word',
                              border: isMe ? 'none' : '1px solid var(--border-color)',
                              borderBottomRightRadius: isMe ? '2px' : '16px',
                              borderBottomLeftRadius: isMe ? '16px' : '2px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          >
                            {msg.content}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && <CheckCheck size={13} className="text-pink" />}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Attachment Card Preview Mockup (Matching Image 4) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '14px',
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        maxWidth: '260px',
                      }}
                    >
                      <div style={{ background: 'var(--accent-pink-subtle)', color: 'var(--accent-pink)', padding: '8px', borderRadius: '8px' }}>
                        <FileText size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Project_Scope.pdf</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>1.2 MB</div>
                      </div>
                      <Download size={16} className="text-dim" style={{ cursor: 'pointer' }} />
                    </div>
                  </div>

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar (Reference Image 4) */}
                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-panel)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                >
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                    <Paperclip size={19} />
                  </button>

                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      borderRadius: '24px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />

                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F48AC2 0%, #7C3AED 100%)',
                      border: 'none',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                      opacity: sending || !newMessage.trim() ? 0.6 : 1,
                      boxShadow: '0 4px 12px rgba(244, 138, 194, 0.3)',
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Select a conversation to view message history.
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 820px) {
          .messages-split-view {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading messaging workspace...</div>}>
      <MessagesContent />
    </Suspense>
  );
}

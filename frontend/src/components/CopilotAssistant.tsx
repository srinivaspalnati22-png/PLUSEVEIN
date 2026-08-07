import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, MessageSquare, X, Send, Sparkles, HelpCircle, ChevronRight, User, Cpu } from 'lucide-react'

interface Message {
  id: string
  sender: 'user' | 'copilot'
  text: string
  timestamp: string
}

const PRESET_QUERIES = [
  'How does rPPG detect blood flow in cheeks?',
  'What makes Lip-Sync DSP hard to fake?',
  'How do I interpret the 0–100 Reality Score?',
  'Why do diffusion models fail rPPG tests?',
]

export function CopilotAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'copilot',
      text: 'Hello! I am Pulsevein Copilot — your AI Forensic Assistant. Ask me anything about rPPG blood pulse signals, 3D lip-sync DSP, or how our reality score works!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsTyping(true)

    // Generate intelligent forensic response
    setTimeout(() => {
      let replyText = 'Pulsevein inspects biological signals impossible for fakes to reproduce: sub-surface skin rPPG blood flow and frame-by-frame 3D lip-sync alignment.'

      const qLower = query.toLowerCase()
      if (qLower.includes('rppg') || qLower.includes('blood') || qLower.includes('flow') || qLower.includes('cheek')) {
        replyText = 'Remote Photoplethysmography (rPPG) measures micro-vascular blood circulation without physical contact. Oxygenated hemoglobin absorbs green light (540–580 nm) as the heart beats. Deepfakes generate surface pixels without sub-surface arterial blood flow.'
      } else if (qLower.includes('lip') || qLower.includes('sync') || qLower.includes('dsp') || qLower.includes('audio')) {
        replyText = 'MediaPipe tracks 468 3D mouth aperture landmarks $A(t)$ while librosa measures audio RMS energy envelope $E(t)$. AI voice swaps introduce millisecond phase offsets (>120ms) between phonemes and mouth opening.'
      } else if (qLower.includes('score') || qLower.includes('reality') || qLower.includes('interpret')) {
        replyText = 'The Reality Score (0–100) is calculated as: Score = (rPPG Score × 0.55) + (LipSync Score × 0.45). Scores ≥ 80 are Real Verified, while scores < 42 indicate a high probability of AI deepfake tampering.'
      } else if (qLower.includes('diffusion') || qLower.includes('sora') || qLower.includes('runway') || qLower.includes('fail')) {
        replyText = '2026 diffusion models (Sora, Runway Gen-3) generate smooth superficial pixels, but fail to render temporal blood volume pulse frequency peaks, producing zero spectral coherence.'
      }

      const copilotMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'copilot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages(prev => [...prev, copilotMsg])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000 }}>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00c896 0%, #00f2fe 100%)',
          border: 'none',
          boxShadow: '0 0 25px rgba(0, 200, 150, 0.4), 0 10px 30px rgba(0, 0, 0, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#080d1a',
        }}
        title="Pulsevein AI Copilot Assistant"
      >
        {isOpen ? <X size={26} strokeWidth={2.5} /> : <Bot size={28} strokeWidth={2.5} />}
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              bottom: '70px',
              right: 0,
              width: '380px',
              maxWidth: 'calc(100vw - 2rem)',
              height: '520px',
              background: 'rgba(15, 22, 35, 0.96)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 200, 150, 0.35)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 200, 150, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(8, 13, 26, 0.85)', borderBottom: '1px solid var(--bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} color="#080d1a" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Pulsevein AI Copilot</h4>
                  <div style={{ fontSize: '0.725rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                    Forensic Assistant Online
                  </div>
                </div>
              </div>

              <button onClick={() => setIsOpen(false)} className="btn-ghost" style={{ padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: msg.sender === 'user' ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, #00c896 0%, #00a078 100%)' : 'var(--bg-elevated)',
                      color: msg.sender === 'user' ? '#080d1a' : 'var(--text-primary)',
                      fontWeight: msg.sender === 'user' ? 600 : 400,
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      border: msg.sender === 'copilot' ? '1px solid var(--bg-border)' : 'none',
                    }}
                  >
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.2rem', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--bg-elevated)', padding: '0.5rem 0.85rem', borderRadius: '1rem', border: '1px solid var(--bg-border)', fontSize: '0.8rem', color: 'var(--accent)' }}>
                  Pulsevein Copilot is analyzing query…
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Preset Query Chips */}
            <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.4rem', overflowX: 'auto', borderTop: '1px solid var(--bg-border)' }}>
              {PRESET_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  style={{
                    whiteSpace: 'nowrap',
                    fontSize: '0.725rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '9999px',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--bg-border)',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={e => { e.preventDefault(); handleSend() }} style={{ padding: '0.75rem 1rem', background: 'rgba(8, 13, 26, 0.85)', borderTop: '1px solid var(--bg-border)', display: 'flex', gap: '0.5rem' }}>
              <input
                className="input-field"
                type="text"
                placeholder="Ask Copilot any query…"
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 0.85rem' }}>
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

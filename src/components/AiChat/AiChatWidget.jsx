import React, { useState, useRef, useEffect, useCallback, useContext } from 'react'
import { postRequest } from '../../Helpers'
import { AppContext } from '../../Context/AppContext'
import {
  Bot, X, Send, Loader2, Trash2, Copy, Check,
  Sparkles, ThumbsUp, ThumbsDown, RotateCcw, ChevronDown,
  Maximize2, Minimize2,
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════
   MARKDOWN RENDERER
════════════════════════════════════════════════════════════════ */
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`'))
      return (
        <code key={i} style={{
          background: 'rgba(99,102,241,0.12)', color: '#818cf8',
          fontSize: '12px', fontFamily: 'monospace',
          padding: '1px 6px', borderRadius: '4px',
        }}>
          {p.slice(1, -1)}
        </code>
      )
    if (/ > /.test(p)) {
      const segs = p.split(' > ')
      return (
        <span key={i}>
          {segs.map((seg, j) => (
            <span key={j}>
              <span style={{ color: '#a5b4fc', fontWeight: 500 }}>{seg}</span>
              {j < segs.length - 1 && <span style={{ color: '#4b5563', margin: '0 3px' }}>›</span>}
            </span>
          ))}
        </span>
      )
    }
    return p
  })
}

function RenderMarkdown({ text }) {
  const lines = text.split('\n')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {lines.map((line, i) => {
        if (/^[━═─\-]{4,}$/.test(line.trim()))
          return <hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '6px 0' }} />
        if (/^###\s/.test(line))
          return (
            <p key={i} style={{ fontSize: '10px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '10px 0 2px' }}>
              {line.replace(/^###\s/, '')}
            </p>
          )
        if (/^##\s/.test(line))
          return (
            <p key={i} style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', margin: '10px 0 4px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {renderInline(line.replace(/^##\s/, ''))}
            </p>
          )
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\./)[1]
          const rest = line.replace(/^\d+\.\s/, '')
          return (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '2px 0' }}>
              <span style={{
                minWidth: '20px', height: '20px', borderRadius: '50%',
                background: 'rgba(99,102,241,0.25)', color: '#a5b4fc',
                fontSize: '10px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
              }}>{num}</span>
              <span style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>{renderInline(rest)}</span>
            </div>
          )
        }
        if (/^[•\-\*]\s/.test(line))
          return (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '1px 0' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: '8px' }} />
              <span style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>{renderInline(line.replace(/^[•\-\*]\s/, ''))}</span>
            </div>
          )
        if (!line.trim()) return <div key={i} style={{ height: '4px' }} />
        return (
          <div key={i} style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7' }}>
            {renderInline(line)}
          </div>
        )
      })}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   COPY BUTTON
════════════════════════════════════════════════════════════════ */
function CopyButton({ text, dark = true }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} aria-label={copied ? 'Copied' : 'Copy'} style={{
      padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
      background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
      color: copied ? '#4ade80' : '#94a3b8',
      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px',
      transition: 'all 0.15s',
    }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

/* ════════════════════════════════════════════════════════════════
   SUGGESTIONS
════════════════════════════════════════════════════════════════ */
const SUGGESTIONS = [
  { label: 'Aditya ke baare mein batao', icon: '👤' },
  { label: 'Expected vs pending fees?', icon: '📊' },
  { label: "Today's fee collection amount?", icon: '💰' },
  { label: 'Show fee defaulters list', icon: '📋' },
  { label: "Today's attendance summary", icon: '📅' },
  { label: 'How many teachers are there?', icon: '👨‍🏫' },
  { label: 'How to add a new student?', icon: '➕' },
  { label: 'Nursery class topper', icon: '🏆' },
]

/* ════════════════════════════════════════════════════════════════
   FOLLOW-UP MAP
════════════════════════════════════════════════════════════════ */
const FOLLOW_UP_MAP = {
  students:             ['Class-wise breakdown?', 'How many boys vs girls?', 'New admissions today?'],
  fee_today:            ['This month collection?', 'Show fee defaulters', 'Expected vs pending fees?'],
  fee_summary:          ['Show defaulters list', 'Class-wise outstanding?', 'Today collection?'],
  fee_overview:         ['Show fee defaulters', 'Class-wise outstanding?', 'Today collection?'],
  fee_defaulters:       ['Show defaulters with names', 'Class-wise defaulters?', 'Total outstanding amount?'],
  fee_defaulters_class: ['Fee collection report?', 'How to collect fee?', 'Payment mode breakdown?'],
  attendance:           ['Class-wise attendance?', 'Most absent class today?', 'Attendance this week?'],
  teachers:             ['Which teachers are active?', 'How many female teachers?', 'Teacher designation list?'],
  topper:               ['Class-wise result analysis?', 'Pass percentage?', 'How to publish results?'],
  transport:            ['Route-wise students?', 'How to manage routes?', 'Transport fee report?'],
  notices:              ['How to add a notice?', 'Circular for parents?', 'Show all notices?'],
  homework:             ['How to assign homework?', 'Subject-wise homework?', 'Pending homework count?'],
  software_help:        ['Step by step guide?', 'Video tutorial available?', 'More features?'],
  student_search:       ['Show fee details?', 'Check attendance?', 'View exam results?'],
  dynamic_data:         ['Show more details?', 'Export this data?', 'Related report?'],
  general:              ['Total students?', "Today's fee?", "Today's attendance?"],
}
function getFollowUps(intent) {
  return (FOLLOW_UP_MAP[intent] || FOLLOW_UP_MAP.general).slice(0, 3)
}

/* ════════════════════════════════════════════════════════════════
   TYPING PHASES
════════════════════════════════════════════════════════════════ */
const TYPING_PHASES = [
  { text: 'Thinking...', delay: 0 },
  { text: 'Searching database...', delay: 2500 },
  { text: 'Generating answer...', delay: 6000 },
  { text: 'Almost there...', delay: 12000 },
]
function useTypingPhase(loading) {
  const [phase, setPhase] = useState(0)
  const timers = useRef([])
  useEffect(() => {
    if (!loading) { setPhase(0); timers.current.forEach(clearTimeout); timers.current = []; return }
    setPhase(0)
    TYPING_PHASES.forEach((p, i) => {
      if (i === 0) return
      const t = setTimeout(() => setPhase(i), p.delay)
      timers.current.push(t)
    })
    return () => { timers.current.forEach(clearTimeout); timers.current = [] }
  }, [loading])
  return TYPING_PHASES[phase]?.text || 'Thinking...'
}

/* ════════════════════════════════════════════════════════════════
   USER INITIALS
════════════════════════════════════════════════════════════════ */
function getUserInitials(userCtx) {
  if (!userCtx) return 'U'
  const u = userCtx?.user || userCtx
  const name = u?.name || u?.fullName || u?.username || u?.email || ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts[0]?.length) return parts[0][0].toUpperCase()
  return 'U'
}

/* ════════════════════════════════════════════════════════════════
   THEME
════════════════════════════════════════════════════════════════ */
const T = {
  bg:         '#0f0f11',
  bgPanel:    '#171719',
  bgMsg:      '#1c1c1f',
  bgInput:    '#1e1e21',
  border:     'rgba(255,255,255,0.07)',
  borderHov:  'rgba(99,102,241,0.4)',
  accent:     '#6366f1',
  accentGlow: 'rgba(99,102,241,0.2)',
  textPrimary:'#f1f5f9',
  textMuted:  '#94a3b8',
  textFaint:  '#475569',
  userBubble: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
  aiBubble:   '#1e1e22',
  header:     '#13131a',
  scrollbar:  'rgba(99,102,241,0.2)',
}

/* ════════════════════════════════════════════════════════════════
   STYLES
════════════════════════════════════════════════════════════════ */
const styles = {
  scrollbar: `
    .ai-messages-scroll::-webkit-scrollbar { width: 4px; }
    .ai-messages-scroll::-webkit-scrollbar-track { background: transparent; }
    .ai-messages-scroll::-webkit-scrollbar-thumb { background: ${T.scrollbar}; border-radius: 99px; }
    .ai-messages-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
    .ai-suggestion-btn:hover { background: rgba(99,102,241,0.12) !important; border-color: rgba(99,102,241,0.35) !important; }
    .ai-followup-btn:hover { background: rgba(99,102,241,0.18) !important; }
    .ai-action-btn:hover { background: rgba(255,255,255,0.08) !important; }
    .ai-send-btn:hover:not(:disabled) { transform: scale(1.05); }
    .ai-send-btn:active:not(:disabled) { transform: scale(0.95); }
    @keyframes ai-slide-up { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes ai-fade-in  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    @keyframes ai-dot-bounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-6px); } }
    @keyframes ai-pulse-ring { 0% { box-shadow:0 0 0 0 rgba(99,102,241,0.4); } 70% { box-shadow:0 0 0 8px rgba(99,102,241,0); } 100% { box-shadow:0 0 0 0 rgba(99,102,241,0); } }
    .ai-msg-row { animation: ai-fade-in 0.25s ease; }
    .ai-panel { animation: ai-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    .ai-trigger-bar:hover .ai-trigger-chevron { transform: translateY(-1px); }
    .ai-trigger-chevron { transition: transform 0.2s; }
  `,
}

/* ════════════════════════════════════════════════════════════════
   TYPING INDICATOR
════════════════════════════════════════════════════════════════ */
function TypingDots({ phaseText }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: T.accent, opacity: 0.7,
            display: 'inline-block',
            animation: `ai-dot-bounce 1.2s ease infinite`,
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}
      </div>
      <span style={{ fontSize: '12px', color: T.textFaint, fontStyle: 'italic' }}>{phaseText}</span>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const AiChatWidget = () => {
  const { user, tenantDetails } = useContext(AppContext)
  const userInitials  = getUserInitials(user)
  const schoolName    = tenantDetails?.schoolName || tenantDetails?.name || ''
  const [isExpanded, setIsExpanded] = useState(false)

  const INITIAL_MSG = {
    role: 'assistant', ts: Date.now(),
    content: `👋 Hey! Main **Franchise AI** hoon — ${schoolName || 'aapki franchise'} ka built-in assistant.\n\n**Kya kar sakta hoon:**\n• Individual student ki complete profile (naam batao)\n• Fees, attendance, results — koi bhi data\n• Software ka koi bhi sawal\n\nBejhijhak poochho! 😊`,
  }

  const [isOpen,    setIsOpen]    = useState(false)
  const [messages,  setMessages]  = useState([INITIAL_MSG])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [unread,    setUnread]    = useState(0)
  const [reactions, setReactions] = useState({})
  const [followUps, setFollowUps] = useState([])

  const endRef      = useRef(null)
  const inputRef    = useRef(null)
  const textareaRef = useRef(null)
  const panelRef    = useRef(null)

  const typingPhaseText = useTypingPhase(loading)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    if (isOpen) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 150) }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  const handleInputChange = (e) => {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px' }
  }

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || loading) return
    const userMsg = { role: 'user', ts: Date.now(), content: trimmed }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setFollowUps([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)
    try {
      const chatHistory = next.slice(1).slice(-7, -1).map(({ role, content }) => ({ role, content }))
      const res  = await postRequest({ url: 'ai/chat', cred: { message: trimmed, chatHistory } })
      const data = res?.data?.data || {}
      const aiIntent = data.intent || 'general'
      setMessages(prev => [...prev, {
        role: 'assistant', ts: Date.now(),
        content: data.reply || 'Kuch problem ho gayi. Dobara try karein.',
        intent: aiIntent,
      }])
      setFollowUps(data.followUpSuggestions?.length ? data.followUpSuggestions : getFollowUps(aiIntent))
      if (!isOpen) setUnread(u => u + 1)
    } catch (err) {
      const status = err?.response?.status
      let msg = '❌ Could not connect to server. Please check your connection.'
      if (status === 503) msg = '⏳ AI is thinking too hard right now. Give it a moment and try again.'
      else if (status === 401) msg = '🔒 Session expired. Please refresh the page.'
      else if (status === 504 || err.code === 'ECONNABORTED') msg = '⏱️ Response took too long. Try a simpler question or try again.'
      setMessages(prev => [...prev, { role: 'assistant', ts: Date.now(), content: msg, intent: 'error' }])
      setFollowUps([])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, loading, messages, isOpen])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearChat = () => {
    setMessages([{ ...INITIAL_MSG, ts: Date.now() }])
    setUnread(0); setFollowUps([]); setReactions({})
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleReaction = (msgIdx, type) => {
    setReactions(prev => ({ ...prev, [msgIdx]: prev[msgIdx] === type ? null : type }))
  }

  const showSuggestions = messages.length <= 1 && !loading

  /* panel width / height based on expanded */
  const panelW = isExpanded ? 'min(760px, calc(100vw - 24px))' : 'min(460px, calc(100vw - 16px))'
  const panelH = isExpanded ? 'min(85vh, calc(100vh - 24px))' : 'min(680px, calc(100vh - 24px))'

  return (
    <>
      {/* ── Inject styles ── */}
      <style>{styles.scrollbar}</style>

      {/* ══════════════════════════════════════════
          FLOATING TRIGGER BAR
      ══════════════════════════════════════════ */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="ai-trigger-bar"
          style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '12px',
            background: T.bgPanel,
            border: `1px solid ${T.border}`,
            borderRadius: '16px', padding: '10px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)',
            cursor: 'pointer', userSelect: 'none',
            transition: 'all 0.2s',
            minWidth: '220px',
          }}
        >
          {/* Glowing AI icon */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)',
            position: 'relative',
          }}>
            <Sparkles size={16} color="#fff" />
            <span style={{
              position: 'absolute', top: '-3px', right: '-3px',
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#4ade80', border: `2px solid ${T.bgPanel}`,
            }} />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: T.textPrimary, lineHeight: '1.3' }}>
              Franchise AI
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: T.textFaint, lineHeight: '1.3', marginTop: '1px' }}>
              Ask anything about your school
            </p>
          </div>

          {unread > 0
            ? <span style={{
                background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 700,
                minWidth: '18px', height: '18px', borderRadius: '99px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
              }}>{unread}</span>
            : <ChevronDown size={14} className="ai-trigger-chevron" color={T.textFaint} />
          }
        </div>
      )}

      {/* ══════════════════════════════════════════
          CHAT PANEL
      ══════════════════════════════════════════ */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog" aria-label="Franchise AI" aria-modal="true"
          className="ai-panel"
          style={{
            position: 'fixed', bottom: '16px', right: '16px', zIndex: 9999,
            width: panelW, height: panelH,
            display: 'flex', flexDirection: 'column',
            background: T.bgPanel,
            border: `1px solid ${T.border}`,
            borderRadius: '20px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)',
            overflow: 'hidden',
            transition: 'width 0.25s ease, height 0.25s ease',
          }}
        >
          {/* ── HEADER ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', flexShrink: 0,
            background: T.header,
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 10px rgba(99,102,241,0.35)',
              }}>
                <Sparkles size={15} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: T.textPrimary, lineHeight: '1.3' }}>
                  Franchise AI
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: T.textFaint }}>Online • School Assistant</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button onClick={() => setIsExpanded(v => !v)} title={isExpanded ? 'Compact' : 'Expand'}
                className="ai-action-btn"
                style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: T.textFaint, cursor: 'pointer', display: 'flex' }}>
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button onClick={clearChat} title="Clear chat"
                className="ai-action-btn"
                style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: T.textFaint, cursor: 'pointer', display: 'flex' }}>
                <RotateCcw size={14} />
              </button>
              <button onClick={() => setIsOpen(false)} title="Close"
                className="ai-action-btn"
                style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', color: T.textFaint, cursor: 'pointer', display: 'flex' }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── MESSAGES ── */}
          <div
            role="log" aria-live="polite"
            className="ai-messages-scroll"
            style={{
              flex: 1, overflowY: 'auto',
              padding: '20px 16px 12px',
              display: 'flex', flexDirection: 'column', gap: '6px',
              background: T.bg,
            }}
          >
            {messages.map((msg, idx) => {
              const isAI = msg.role === 'assistant'
              return (
                <div key={idx} className="ai-msg-row" style={{
                  display: 'flex',
                  flexDirection: isAI ? 'row' : 'row-reverse',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '4px',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '10px', flexShrink: 0, marginTop: '2px',
                    background: isAI
                      ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                      : 'linear-gradient(135deg,#374151,#4b5563)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, color: '#fff',
                    boxShadow: isAI ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                  }}>
                    {isAI ? <Bot size={14} /> : userInitials}
                  </div>

                  {/* Bubble */}
                  <div style={{ maxWidth: isExpanded ? '70%' : '80%', minWidth: 0 }}>
                    <div style={{
                      padding: isAI ? '12px 15px' : '10px 14px',
                      borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      background: isAI ? T.aiBubble : T.userBubble,
                      border: isAI ? `1px solid ${T.border}` : 'none',
                      boxShadow: isAI
                        ? '0 1px 4px rgba(0,0,0,0.3)'
                        : '0 2px 12px rgba(99,102,241,0.3)',
                    }}>
                      {isAI
                        ? <RenderMarkdown text={msg.content} />
                        : <span style={{ fontSize: '14px', color: '#fff', lineHeight: '1.6' }}>{msg.content}</span>
                      }
                    </div>

                    {/* Actions row */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      marginTop: '6px', paddingLeft: isAI ? '2px' : '0',
                      justifyContent: isAI ? 'flex-start' : 'flex-end',
                    }}>
                      {isAI && <CopyButton text={msg.content} />}
                      {isAI && msg.intent && msg.intent !== 'error' && (
                        <>
                          <button onClick={() => handleReaction(idx, 'up')} title="Helpful"
                            style={{
                              padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px',
                              background: reactions[idx] === 'up' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                              color: reactions[idx] === 'up' ? '#4ade80' : T.textFaint,
                              display: 'flex', alignItems: 'center', gap: '3px', transition: 'all 0.15s',
                            }}>
                            <ThumbsUp size={11} />
                          </button>
                          <button onClick={() => handleReaction(idx, 'down')} title="Not helpful"
                            style={{
                              padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px',
                              background: reactions[idx] === 'down' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                              color: reactions[idx] === 'down' ? '#f87171' : T.textFaint,
                              display: 'flex', alignItems: 'center', gap: '3px', transition: 'all 0.15s',
                            }}>
                            <ThumbsDown size={11} />
                          </button>
                        </>
                      )}
                      <span style={{ fontSize: '10px', color: T.textFaint, marginLeft: '4px' }}>
                        {new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="ai-msg-row" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '10px', flexShrink: 0, marginTop: '2px',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                }}>
                  <Bot size={14} color="#fff" />
                </div>
                <div style={{
                  padding: '12px 15px', borderRadius: '4px 16px 16px 16px',
                  background: T.aiBubble, border: `1px solid ${T.border}`,
                }}>
                  <TypingDots phaseText={typingPhaseText} />
                </div>
              </div>
            )}

            {/* Follow-up chips */}
            {!loading && followUps.length > 0 && (
              <div style={{ paddingLeft: '40px', marginTop: '4px', marginBottom: '4px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 700, color: T.textFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Follow-up
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {followUps.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      className="ai-followup-btn"
                      style={{
                        padding: '5px 12px', borderRadius: '99px', border: `1px solid rgba(99,102,241,0.25)`,
                        background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
                        fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s', fontWeight: 500,
                      }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestion grid */}
            {showSuggestions && (
              <div style={{ marginTop: '8px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 700, color: T.textFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Suggested
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s.label} onClick={() => sendMessage(s.label)}
                      className="ai-suggestion-btn"
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '8px',
                        padding: '10px 12px', borderRadius: '12px', textAlign: 'left',
                        border: `1px solid ${T.border}`,
                        background: T.bgMsg, color: T.textMuted,
                        fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s', fontWeight: 500,
                        lineHeight: '1.4',
                      }}>
                      <span style={{ fontSize: '14px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* ── INPUT AREA ── */}
          <div style={{
            flexShrink: 0,
            padding: '12px 14px 14px',
            background: T.bgPanel,
            borderTop: `1px solid ${T.border}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: '8px',
              background: T.bgInput,
              border: `1px solid ${T.border}`,
              borderRadius: '16px',
              padding: '8px 10px 8px 14px',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = T.border
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)'
              }}
            >
              <label htmlFor="ai-input" className="sr-only">Message</label>
              <textarea
                id="ai-input"
                ref={el => { inputRef.current = el; textareaRef.current = el }}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your school..."
                rows={1}
                disabled={loading}
                style={{
                  flex: 1, resize: 'none', border: 'none', background: 'transparent', outline: 'none',
                  fontSize: '14px', color: T.textPrimary, lineHeight: '1.6',
                  minHeight: '24px', maxHeight: '120px',
                  padding: '4px 0',
                  fontFamily: 'inherit',
                  caretColor: T.accent,
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                aria-label="Send"
                className="ai-send-btn"
                style={{
                  width: '34px', height: '34px', borderRadius: '10px', border: 'none',
                  background: !input.trim() || loading
                    ? 'rgba(255,255,255,0.06)'
                    : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: !input.trim() || loading ? T.textFaint : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                  flexShrink: 0, transition: 'all 0.15s',
                  boxShadow: !input.trim() || loading ? 'none' : '0 2px 8px rgba(99,102,241,0.4)',
                }}
              >
                {loading
                  ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Send size={14} />
                }
              </button>
            </div>

            <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: '10px', color: T.textFaint }}>
              Powered by Franchise AI · Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default AiChatWidget

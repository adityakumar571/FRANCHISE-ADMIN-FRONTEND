import React, { useState, useEffect, useRef } from 'react'
import { Search, HelpCircle, ChevronRight, MessageCircle, BookOpen, Clock } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import Loader from '../../../components/Loading/Loader'

const FAQHelpPage = () => {
  const [faqs, setFaqs]                   = useState([])
  const [loading, setLoading]             = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [categories, setCategories]       = useState([])
  const [searchInput, setSearchInput]     = useState('')
  const [search, setSearch]               = useState('')
  const [lastUpdated, setLastUpdated]     = useState(null)
  const [openId, setOpenId]               = useState(null)
  const contentRef                        = useRef(null)

  /* ── fetch ── */
  const fetchFAQs = () => {
    setLoading(true)
    const params = new URLSearchParams({ isPagination: 'false' })
    if (search) params.append('search', search)
    getRequest(`faq?${params.toString()}`)
      .then(res => {
        const list = (res?.data?.data?.faqs || []).filter(f => f.isActive !== false)
        setFaqs(list)
        const cats = [...new Set(list.map(f => f.category).filter(Boolean))]
        setCategories(cats)
        if (list.length) setLastUpdated(list[0]?.updatedAt || list[0]?.createdAt)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchFAQs() }, [search])

  /* debounce */
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setActiveCategory('All') }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const filtered = faqs.filter(f =>
    activeCategory === 'All' || f.category === activeCategory
  )

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : ''

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0
    setOpenId(null)
  }, [activeCategory])

  const catCount = (cat) => cat === 'All'
    ? faqs.length
    : faqs.filter(f => f.category === cat).length

  /* category accent colors */
  const CAT_ACCENTS = [
    { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', dot: '#3b82f6' },
    { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', dot: '#8b5cf6' },
    { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', dot: '#22c55e' },
    { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', dot: '#f97316' },
    { bg: '#fdf2f8', border: '#f5d0fe', text: '#86198f', dot: '#d946ef' },
    { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', dot: '#10b981' },
    { bg: '#fefce8', border: '#fde68a', text: '#92400e', dot: '#f59e0b' },
    { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', dot: '#f43f5e' },
  ]
  const accentMap = {}
  categories.forEach((c, i) => { accentMap[c] = CAT_ACCENTS[i % CAT_ACCENTS.length] })

  return (
    <div style={{
      display: 'flex', height: 'calc(100vh - 80px)',
      background: '#f8fafc', borderRadius: 12, overflow: 'hidden',
      border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>

      {/* ══════════════════════════════════
          LEFT SIDEBAR
      ══════════════════════════════════ */}
      <aside style={{
        width: 256, minWidth: 256,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Sidebar header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #0c3b73, #1e5fa8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={15} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Help Center</p>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{faqs.length} articles</p>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)', color: '#94a3b8',
            }} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{
                width: '100%', height: 34, paddingLeft: 30, paddingRight: 10,
                fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8,
                outline: 'none', color: '#374151', background: '#f8fafc',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#0c3b73'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>

        {/* Category nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {/* All FAQs */}
          {['All', ...categories].map((cat, idx) => {
            const isActive = activeCategory === cat
            const accent   = cat === 'All' ? null : accentMap[cat]
            const count    = catCount(cat)
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '9px 10px', marginBottom: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#0c3b73' : '#475569',
                  background: isActive ? '#eff6ff' : 'none',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {cat !== 'All' && (
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: accent?.dot || '#94a3b8',
                    }} />
                  )}
                  {cat === 'All' && (
                    <HelpCircle size={13} style={{ color: isActive ? '#0c3b73' : '#94a3b8', flexShrink: 0 }} />
                  )}
                  <span style={{ lineHeight: 1.3 }}>{cat === 'All' ? 'All FAQs' : cat}</span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '1px 7px',
                  borderRadius: 999, background: isActive ? '#dbeafe' : '#f1f5f9',
                  color: isActive ? '#1d4ed8' : '#64748b', flexShrink: 0,
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid #f1f5f9',
          background: '#fafafa',
        }}>
          <a href="/support" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 8,
            background: '#0c3b73', textDecoration: 'none',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#0a2f5c'}
            onMouseLeave={e => e.currentTarget.style.background = '#0c3b73'}
          >
            <MessageCircle size={14} color="#fff" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
              Raise a Support Ticket
            </span>
          </a>
        </div>
      </aside>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <main ref={contentRef} style={{
        flex: 1, overflowY: 'auto',
        padding: '32px 40px',
        background: '#f8fafc',
      }}>

        {/* Page header */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: '24px 28px',
          border: '1px solid #e2e8f0', marginBottom: 24,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
                {activeCategory === 'All' ? 'Frequently Asked Questions' : activeCategory}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {lastUpdated && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8' }}>
                    <Clock size={11} />
                    Updated: {fmtDate(lastUpdated)}
                  </span>
                )}
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '2px 10px',
                  background: '#eff6ff', color: '#1d4ed8', borderRadius: 999,
                }}>
                  {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
                </span>
              </div>
            </div>
            {activeCategory !== 'All' && accentMap[activeCategory] && (
              <span style={{
                padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: accentMap[activeCategory].bg,
                color: accentMap[activeCategory].text,
                border: `1px solid ${accentMap[activeCategory].border}`,
              }}>
                {activeCategory}
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{
            background: '#fff', borderRadius: 12, padding: '60px 24px',
            border: '1px solid #e2e8f0', textAlign: 'center',
          }}>
            <HelpCircle size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
              {search ? `No results for "${search}"` : 'No FAQs available in this category.'}
            </p>
          </div>
        )}

        {/* FAQ Cards — accordion */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((faq, i) => {
              const isOpen   = openId === faq._id
              const accent   = accentMap[faq.category]

              return (
                <div
                  key={faq._id}
                  style={{
                    background: '#fff', borderRadius: 10,
                    border: isOpen ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: isOpen ? '0 4px 12px rgba(12,59,115,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Question row */}
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq._id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      gap: 12, padding: '16px 20px', background: 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {/* Number */}
                    <span style={{
                      width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      background: isOpen ? '#0c3b73' : '#f1f5f9',
                      color: isOpen ? '#fff' : '#64748b',
                      transition: 'all 0.2s',
                    }}>
                      {i + 1}
                    </span>

                    {/* Question text */}
                    <span style={{
                      flex: 1, fontSize: 14, fontWeight: 600, lineHeight: 1.5,
                      color: isOpen ? '#0c3b73' : '#1e293b',
                      transition: 'color 0.2s',
                    }}>
                      {faq.question}
                    </span>

                    {/* Category pill — only in All view */}
                    {activeCategory === 'All' && faq.category && accent && (
                      <span style={{
                        flexShrink: 0, fontSize: 11, fontWeight: 600,
                        padding: '3px 10px', borderRadius: 999,
                        background: accent.bg, color: accent.text,
                        border: `1px solid ${accent.border}`,
                        display: 'none',  // show on wider screens via inline media
                      }}
                        className="faq-cat-pill"
                      >
                        {faq.category}
                      </span>
                    )}

                    {/* Chevron */}
                    <ChevronRight
                      size={16}
                      style={{
                        flexShrink: 0, color: '#94a3b8',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>

                  {/* Answer */}
                  {isOpen && (
                    <div style={{
                      padding: '0 20px 18px 64px',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: 14,
                    }}>
                      {activeCategory === 'All' && faq.category && accent && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 600, padding: '3px 10px',
                          borderRadius: 999, marginBottom: 10,
                          background: accent.bg, color: accent.text,
                          border: `1px solid ${accent.border}`,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent.dot }} />
                          {faq.category}
                        </span>
                      )}
                      <p style={{
                        margin: 0, fontSize: 13.5, lineHeight: 1.8,
                        color: '#475569', whiteSpace: 'pre-line',
                      }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom help card */}
        {!loading && filtered.length > 0 && (
          <div style={{
            marginTop: 24, background: 'linear-gradient(135deg, #0c3b73 0%, #1e5fa8 100%)',
            borderRadius: 12, padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                Can't find your answer?
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                Our support team responds within 24 business hours.
              </p>
            </div>
            <a href="/support" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 8, textDecoration: 'none',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <MessageCircle size={14} />
              Raise a Ticket
            </a>
          </div>
        )}

        {/* Bottom padding */}
        <div style={{ height: 40 }} />
      </main>

      <style>{`
        @media (min-width: 900px) { .faq-cat-pill { display: inline-flex !important; } }
      `}</style>
    </div>
  )
}

export default FAQHelpPage

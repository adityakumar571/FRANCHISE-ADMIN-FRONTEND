/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Package, Plus, Eye, Edit, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { getRequest } from '../../../Helpers'
import { useNavigate } from 'react-router-dom'

const statusColors = {
  'In Stock':     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Low Stock':    { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'Out of Stock': { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
}

const Badge = ({ s }) => {
  const c = statusColors[s] || statusColors['In Stock']
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{s}</span>
}
const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const CATS = ['All Categories','Pain Relief','Antibiotics','Gastro Care','Vitamins','Diabetes']
const STATUSES = ['All Status','In Stock','Low Stock','Out of Stock']

export default function Products() {
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('All Categories')
  const [status, setStatus]   = useState('All Status')
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [summary, setSummary] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 })

  useEffect(() => { fetchProducts() }, [page, cat, status])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (cat !== 'All Categories') params.append('category', cat)
      if (status !== 'All Status') params.append('stockStatus', status)
      const res = await getRequest(`franchise/medicines?${params.toString()}`)
      setData(res?.data || [])
      setTotal(res?.total || 0)
      if (res?.summary) setSummary(res.summary)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = data.filter(p =>
    search === '' ||
    (p.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (p.salt||p.genericName||'').toLowerCase().includes(search.toLowerCase())
  )

  const getStockStatus = (stock) => {
    if (!stock || stock === 0) return 'Out of Stock'
    if (stock < 25) return 'Low Stock'
    return 'In Stock'
  }

  const lowStock   = data.filter(p => (p.stock||0) < 25).length
  const totalPages = Math.max(1, Math.ceil(total / 20))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Products</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage all medicines and products</p>
        </div>
        <button
          onClick={() => navigate('/franchise/medicines/add')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      {lowStock > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
          <AlertTriangle size={15} color="#d97706" />
          <span style={{ fontSize: 13, color: '#92400e' }}>
            <strong>{lowStock} products</strong> need attention — low stock or out of stock
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Products', value: summary.total || total || data.length, color: '#0c3b73' },
          { label: 'In Stock',       value: summary.inStock    || data.filter(p=>(p.stock||0)>=25).length,               color: '#16a34a' },
          { label: 'Low Stock',      value: summary.lowStock   || data.filter(p=>(p.stock||0)>0&&(p.stock||0)<25).length, color: '#d97706' },
          { label: 'Out of Stock',   value: summary.outOfStock || data.filter(p=>!(p.stock||0)).length,                   color: '#dc2626' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or salt/generic..."
            style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        {[{ val: cat, set: v => { setCat(v); setPage(1) }, opts: CATS }, { val: status, set: v => { setStatus(v); setPage(1) }, opts: STATUSES }].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
            {f.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Code','Product Name','Salt / Generic','Company','MRP','Stock','Unit','Category','Status','Actions'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No products found</td></tr>
              ) : filtered.map(p => {
                const stockStatus = getStockStatus(p.stock)
                return (
                  <tr key={p._id} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{p.medicineCode || p._id?.slice(-6)}</span></Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Package size={13} color="#0c3b73" />
                        </div>
                        <span style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{p.name}</span>
                      </div>
                    </Td>
                    <Td style={{ color: '#6b7280' }}>{p.salt || p.genericName || '—'}</Td>
                    <Td>{p.company || p.manufacturer || '—'}</Td>
                    <Td style={{ fontWeight: 600 }}>₹{(p.mrp||0).toFixed(2)}</Td>
                    <Td style={{ fontWeight: 600, color: !(p.stock||0) ? '#dc2626' : (p.stock||0)<25 ? '#d97706' : '#111827' }}>{p.stock || 0}</Td>
                    <Td style={{ color: '#6b7280' }}>{p.unit || p.unitOfMeasure || '—'}</Td>
                    <Td><span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4, color: '#374151' }}>{p.category || '—'}</span></Td>
                    <Td><Badge s={stockStatus} /></Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          title="View"
                          onClick={() => navigate(`/franchise/medicines/${p._id}`)}
                          style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#0c3b73' }}>
                          <Eye size={13} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => navigate(`/franchise/medicines/${p._id}/edit`)}
                          style={{ background: '#fffbeb', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}>
                          <Edit size={13} />
                        </button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {total || data.length} products</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronLeft size={14} /></button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ background:page===p?'#0c3b73':'none', border:`1px solid ${page===p?'#0c3b73':'#e5e7eb'}`, borderRadius:6, padding:'4px 10px', cursor:'pointer', color:page===p?'#fff':'#374151', fontSize:12 }}>{p}</button>
            ))}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

const statusColors = {
  'In Stock':     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Low Stock':    { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'Out of Stock': { bg: '#fff1f2', color: '#dc2626', border: '#fecdd3' },
}

const Badge = ({ s }) => {
  const c = statusColors[s] || statusColors['In Stock']
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{s}</span>
}
const Th = ({ c }) => <th style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
const Td = ({ children, style = {} }) => <td style={{ padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', ...style }}>{children}</td>

const CATS = ['All Categories','Pain Relief','Antibiotics','Gastro Care','Vitamins','Diabetes']
const STATUSES = ['All Status','In Stock','Low Stock','Out of Stock']

export default function Products() {
  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('All Categories')
  const [status, setStatus]   = useState('All Status')
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [summary, setSummary] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 })

  useEffect(() => { fetchProducts() }, [page, cat, status])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (cat !== 'All Categories') params.append('category', cat)
      if (status !== 'All Status') params.append('stockStatus', status)
      const res = await getRequest(`franchise/medicines?${params.toString()}`)
      setData(res?.data || [])
      setTotal(res?.total || 0)
      if (res?.summary) setSummary(res.summary)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = data.filter(p =>
    search === '' ||
    (p.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (p.salt||p.genericName||'').toLowerCase().includes(search.toLowerCase())
  )

  const getStockStatus = (stock) => {
    if (!stock || stock === 0) return 'Out of Stock'
    if (stock < 25) return 'Low Stock'
    return 'In Stock'
  }

  const lowStock   = data.filter(p => (p.stock||0) < 25).length
  const totalPages = Math.max(1, Math.ceil(total / 20))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Products</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Manage all medicines and products</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0c3b73', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      {lowStock > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
          <AlertTriangle size={15} color="#d97706" />
          <span style={{ fontSize: 13, color: '#92400e' }}>
            <strong>{lowStock} products</strong> need attention — low stock or out of stock
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Products', value: summary.total || total || data.length, color: '#0c3b73' },
          { label: 'In Stock',       value: summary.inStock    || data.filter(p=>(p.stock||0)>=25).length,               color: '#16a34a' },
          { label: 'Low Stock',      value: summary.lowStock   || data.filter(p=>(p.stock||0)>0&&(p.stock||0)<25).length, color: '#d97706' },
          { label: 'Out of Stock',   value: summary.outOfStock || data.filter(p=>!(p.stock||0)).length,                   color: '#dc2626' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>{c.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or salt/generic..."
            style={{ width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', background: '#f9fafb' }} />
        </div>
        {[{ val: cat, set: v => { setCat(v); setPage(1) }, opts: CATS }, { val: status, set: v => { setStatus(v); setPage(1) }, opts: STATUSES }].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#f9fafb', cursor: 'pointer' }}>
            {f.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Code','Product Name','Salt / Generic','Company','MRP','Stock','Unit','Category','Status','Actions'].map(h => <Th key={h} c={h} />)}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No products found</td></tr>
              ) : filtered.map(p => {
                const stockStatus = getStockStatus(p.stock)
                return (
                  <tr key={p._id} onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background=''}>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4 }}>{p.medicineCode || p._id?.slice(-6)}</span></Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Package size={13} color="#0c3b73" />
                        </div>
                        <span style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{p.name}</span>
                      </div>
                    </Td>
                    <Td style={{ color: '#6b7280' }}>{p.salt || p.genericName || '—'}</Td>
                    <Td>{p.company || p.manufacturer || '—'}</Td>
                    <Td style={{ fontWeight: 600 }}>₹{(p.mrp||0).toFixed(2)}</Td>
                    <Td style={{ fontWeight: 600, color: !(p.stock||0) ? '#dc2626' : (p.stock||0)<25 ? '#d97706' : '#111827' }}>{p.stock || 0}</Td>
                    <Td style={{ color: '#6b7280' }}>{p.unit || p.unitOfMeasure || '—'}</Td>
                    <Td><span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 7px', borderRadius: 4, color: '#374151' }}>{p.category || '—'}</span></Td>
                    <Td><Badge s={stockStatus} /></Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button title="View" style={{ background: '#e0e7ff', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#0c3b73' }}><Eye size={13} /></button>
                        <button title="Edit" style={{ background: '#fffbeb', border: 'none', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#d97706' }}><Edit size={13} /></button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Showing {filtered.length} of {total || data.length} products</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronLeft size={14} /></button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ background:page===p?'#0c3b73':'none', border:`1px solid ${page===p?'#0c3b73':'#e5e7eb'}`, borderRadius:6, padding:'4px 10px', cursor:'pointer', color:page===p?'#fff':'#374151', fontSize:12 }}>{p}</button>
            ))}
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useContext, useEffect, useState } from 'react'
import {
  Puzzle, Ticket, Zap, CreditCard, Users, CalendarDays,
  Clock, AlertTriangle, CheckCircle, TrendingUp, Package,
  History, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react'
import { message } from 'antd'
import { getRequest } from '../../Helpers'
import Loader from '../../components/Loading/Loader'
import { AppContext } from '../../Context/AppContext'

/* ── helpers ── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const fmtINR = (n) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`

const STATUS_CFG = {
  ACTIVE:    { label: 'Active',    color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  TRIAL:     { label: 'Trial',     color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
  EXPIRED:   { label: 'Expired',   color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  CANCELLED: { label: 'Cancelled', color: '#ea580c', bg: '#ffedd5', border: '#fed7aa' },
  PENDING:   { label: 'Pending',   color: '#ca8a04', bg: '#fef9c3', border: '#fef08a' },
}

/* ══════════════════════════════════════════════════════
   CURRENT SUBSCRIPTION BANNER
══════════════════════════════════════════════════════ */
function CurrentSubscriptionBanner({ sub, onRefresh }) {
  const [showHistory, setShowHistory] = useState(false)
  if (!sub) return null

  const statusCfg = STATUS_CFG[sub.status] || STATUS_CFG.PENDING
  const plan     = sub.currentPlan || {}
  const usage    = sub.usage || {}
  const billing  = sub.billing || {}
  const daysLeft = plan.daysLeft ?? plan.trialDaysLeft ?? null
  const usagePct = usage.percentUsed || 0
  const barColor = usagePct >= 90 ? '#dc2626' : usagePct >= 70 ? '#ca8a04' : '#16a34a'

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${statusCfg.color}, ${statusCfg.color}88)` }} />
      <div style={{ padding: '20px 24px' }}>

        {/* Row 1: Plan name + status + refresh */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {sub.isTrial ? <Zap size={22} color="#2563eb" /> : <CreditCard size={22} color="#185FA5" />}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>{plan.name || '—'}</span>
                {sub.isTrial && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#dbeafe', color: '#1d4ed8' }}>TRIAL</span>}
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>{statusCfg.label}</span>
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{plan.billingCycle} · {plan.pricingModel === 'PER_STUDENT' ? 'Per-student pricing' : 'Fixed pricing'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#185FA5', letterSpacing: '-0.02em' }}>{fmtINR(plan.price)}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>/{plan.billingCycle === 'Yearly' ? 'year' : 'month'}</div>
            </div>
            <button onClick={onRefresh} title="Refresh" style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Row 2: Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 18 }}>
          <StatBox icon={Users} label="Student Limit" value={usage.totalStudentLimit > 0 ? usage.totalStudentLimit.toLocaleString('en-IN') : 'Unlimited'} />
          <StatBox icon={TrendingUp} label="Enrolled Students" value={`${usage.usedStudents ?? 0} / ${usage.totalStudentLimit > 0 ? usage.totalStudentLimit : '∞'}`} accent={usagePct >= 90 ? '#dc2626' : undefined} />
          <StatBox icon={CalendarDays} label="Start Date" value={fmtDate(plan.startDate)} />
          <StatBox icon={CalendarDays} label="Valid Till" value={fmtDate(plan.endDate)} highlight={plan.isExpired} />
          <StatBox icon={CreditCard} label="Payment Status" value={billing.paidStatus || '—'} accent={billing.paidStatus === 'OVERDUE' ? '#dc2626' : billing.paidStatus === 'PAID' ? '#16a34a' : undefined} />
          {billing.dueDate && <StatBox icon={Clock} label="Due Date" value={fmtDate(billing.dueDate)} highlight={billing.paidStatus === 'OVERDUE'} />}
        </div>

        {/* Row 3: Usage progress bar */}
        {usage.totalStudentLimit > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Student Usage</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{usagePct}% used · {typeof usage.remaining === 'number' ? `${usage.remaining} remaining` : 'Unlimited'}</span>
            </div>
            <div style={{ height: 8, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(usagePct, 100)}%`, borderRadius: 8, background: usagePct >= 90 ? 'linear-gradient(90deg,#dc2626,#ef4444)' : usagePct >= 70 ? 'linear-gradient(90deg,#ca8a04,#eab308)' : 'linear-gradient(90deg,#16a34a,#22c55e)', transition: 'width 0.5s ease' }} />
            </div>
            {usagePct >= 90 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
                <AlertTriangle size={13} /> Almost full — contact admin to upgrade your plan
              </div>
            )}
          </div>
        )}

        {/* Row 4: Days left banner */}
        {!plan.isExpired && daysLeft !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, marginBottom: 12, background: daysLeft <= 7 ? '#fef2f2' : daysLeft <= 30 ? '#fffbeb' : '#f0fdf4', border: `1px solid ${daysLeft <= 7 ? '#fecaca' : daysLeft <= 30 ? '#fde68a' : '#bbf7d0'}` }}>
            <Clock size={14} color={daysLeft <= 7 ? '#dc2626' : daysLeft <= 30 ? '#ca8a04' : '#16a34a'} />
            <span style={{ fontSize: 13, fontWeight: 600, color: daysLeft <= 7 ? '#dc2626' : daysLeft <= 30 ? '#92400e' : '#166534' }}>{daysLeft} days remaining</span>
            {daysLeft <= 30 && <span style={{ fontSize: 12, color: '#6b7280' }}>— Contact admin to renew</span>}
          </div>
        )}
        {plan.isExpired && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, marginBottom: 12, background: '#fef2f2', border: '1px solid #fecaca' }}>
            <AlertTriangle size={14} color="#dc2626" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>Subscription expired — contact admin to renew</span>
          </div>
        )}

        {/* Row 5: Add-ons */}
        {sub.addons?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, alignSelf: 'center' }}>Add-ons:</span>
            {sub.addons.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: '#FEF5E7', border: '1px solid #fde68a', fontSize: 12, fontWeight: 600, color: '#92400e' }}>
                <Package size={11} /> {a.name} (+{(a.studentLimit * a.quantity).toLocaleString('en-IN')} students)
              </div>
            ))}
          </div>
        )}

        {/* Row 6: History toggle */}
        {sub.history?.length > 0 && (
          <div>
            <button onClick={() => setShowHistory(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#185FA5', fontSize: 13, fontWeight: 600, padding: 0 }}>
              <History size={14} /> Billing History ({sub.history.length})
              {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showHistory && (
              <div style={{ marginTop: 10, border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                {sub.history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: i % 2 === 0 ? '#fafafa' : '#fff', borderBottom: i < sub.history.length - 1 ? '1px solid #f3f4f6' : 'none', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{h.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{h.type?.replace('_', ' ')} · {fmtDate(h.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: h.price === 0 ? '#16a34a' : '#111' }}>{h.price === 0 ? 'FREE' : fmtINR(h.price)}</div>
                      {h.endDate && <div style={{ fontSize: 11, color: '#9ca3af' }}>Till {fmtDate(h.endDate)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   INSTALLMENT SCHEDULE (Yearly plan only)
══════════════════════════════════════════════════════ */
const INST_STATUS = {
  PAID:    { label: 'Paid',    bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  PENDING: { label: 'Pending', bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
  OVERDUE: { label: 'Overdue', bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
}

function InstallmentSchedule({ installments }) {
  if (!installments?.schedule?.length) return null
  const { schedule, summary } = installments
  const paidPct = Math.round((summary.paid / 12) * 100)

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarDays size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Yearly Payment Schedule</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>Monthly installment breakdown for your yearly plan</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: `${summary.paid} Paid`,       bg: '#dcfce7', color: '#16a34a' },
            { label: `${summary.pending} Pending`,  bg: '#fff7ed', color: '#ea580c' },
            { label: `${summary.overdue} Overdue`,  bg: '#fee2e2', color: '#dc2626' },
          ].map(({ label, bg, color }) => (
            <span key={label} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: bg, color }}>{label}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Payment Progress</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#185FA5' }}>{summary.paid}/12 months · ₹{summary.totalPaid?.toLocaleString('en-IN')} received</span>
          </div>
          <div style={{ height: 8, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${paidPct}%`, borderRadius: 8, background: paidPct === 100 ? 'linear-gradient(90deg,#16a34a,#22c55e)' : 'linear-gradient(90deg,#185FA5,#3b82f6)', transition: 'width 0.5s ease' }} />
          </div>
          {summary.remaining > 0 && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>₹{summary.remaining?.toLocaleString('en-IN')} remaining</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {schedule.map((inst) => {
            const cfg = INST_STATUS[inst.status] || INST_STATUS.PENDING
            return (
              <div key={inst.installmentNo} style={{ border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '12px', background: cfg.bg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: cfg.text }}>{inst.billingMonth ? new Date(inst.billingMonth + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</span>
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>#{inst.installmentNo}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 6 }}>₹{Number(inst.amount ?? 0).toLocaleString('en-IN')}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: cfg.text }}>{inst.status === 'PAID' ? '✅' : inst.status === 'OVERDUE' ? '⚠️' : '🕐'} {cfg.label}</span>
                {inst.status === 'PAID' && inst.paidDate && <div style={{ fontSize: 10, color: '#16a34a', marginTop: 4 }}>Paid: {fmtDate(inst.paidDate)}</div>}
                {inst.status !== 'PAID' && inst.dueDate && <div style={{ fontSize: 10, color: inst.status === 'OVERDUE' ? '#dc2626' : '#9ca3af', marginTop: 4 }}>Due: {fmtDate(inst.dueDate)}</div>}
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: '#f8f9fb', border: '1px solid #e5e7eb', fontSize: 12, color: '#6b7280' }}>
          💡 To make a payment, contact your admin with the installment details above.
        </div>
      </div>
    </div>
  )
}

/* ── StatBox helper ── */
function StatBox({ icon: Icon, label, value, highlight = false, accent }) {
  const color = accent || (highlight ? '#dc2626' : '#185FA5')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f8f9fb', border: `1px solid ${highlight ? '#fecaca' : '#f3f4f6'}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: highlight ? '#dc2626' : '#111', marginTop: 1 }}>{value}</div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   PLAN CARD — Subscribe button hidden (admin-only assign)
══════════════════════════════════════════════════════ */
function PlanCard({ plan, isCurrentPlan }) {
  const isAddon = plan.planType === 'Addon'
  return (
    <div style={{ background: '#fff', border: isCurrentPlan ? '2px solid #185FA5' : '1px solid #e5e7eb', borderRadius: 14, padding: '1.4rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: 280 }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>

      {/* accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: isAddon ? '#EF9F27' : '#185FA5', borderRadius: '14px 0 0 14px' }} />

      {isCurrentPlan && (
        <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#EAF2FF', color: '#185FA5', border: '1px solid #bfdbfe' }}>Current Plan</div>
      )}
      {plan.isPopular && !isCurrentPlan && (
        <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'linear-gradient(135deg,#fabf22,#f59e0b)', color: '#fff' }}>Popular</div>
      )}

      <div style={{ paddingLeft: 8, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: isAddon ? '#FEF5E7' : '#EAF2FF', color: isAddon ? '#BA7517' : '#185FA5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {isAddon ? 'Add-on' : 'Plan'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>{plan.name}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{plan.description}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            {plan.pricingModel === 'PER_STUDENT'
              ? <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{fmtINR(plan.pricePerStudent)}<span style={{ fontSize: 11, color: '#aaa' }}>/student</span></div>
              : <div style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>{fmtINR(plan.price)}</div>
            }
            <div style={{ fontSize: 11, color: '#bbb' }}>{plan.billingCycle}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Student Limit</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginTop: 2 }}>{plan.studentLimit > 0 ? plan.studentLimit.toLocaleString('en-IN') : 'Unlimited'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Billing</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginTop: 2 }}>{plan.billingCycle}</div>
          </div>
        </div>

        {plan.features?.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {plan.features.slice(0, 4).map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <CheckCircle size={11} color={isAddon ? '#EF9F27' : '#1D9E75'} />
                <span style={{ fontSize: 12, color: '#555' }}>{f}</span>
              </div>
            ))}
            {plan.features.length > 4 && <div style={{ fontSize: 11, color: '#aaa', marginLeft: 18 }}>+{plan.features.length - 4} more</div>}
          </div>
        )}

        {/* ── Subscribe button HIDDEN — admin assigns plans ── */}
        <div style={{ marginTop: 'auto', paddingTop: 14 }}>
          {isCurrentPlan ? (
            <div style={{ width: '100%', padding: '9px 0', borderRadius: 8, background: '#EAF2FF', color: '#185FA5', fontSize: 13, fontWeight: 700, textAlign: 'center', border: '1px solid #bfdbfe' }}>
              ✓ Current Plan
            </div>
          ) : (
            <div style={{ width: '100%', padding: '9px 0', borderRadius: 8, background: '#f8f9fb', color: '#9ca3af', fontSize: 12, fontWeight: 500, textAlign: 'center', border: '1px solid #e5e7eb' }}>
              📞 Contact SAAS admin to activate
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
const SubscriptionPlans = () => {
  const { user, tenantDetails } = useContext(AppContext)

  const [currentSub, setCurrentSub]     = useState(null)
  const [subLoading, setSubLoading]     = useState(true)
  const [plans, setPlans]               = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [planType, setPlanType]         = useState('Plan')

  /* ── fetch current subscription ── */
  const fetchCurrentSub = async () => {
    setSubLoading(true)
    try {
      const res = await getRequest('my-subscription')
      const raw = res?.data?.data
      if (!raw || !raw.hasSubscription) { setCurrentSub(null); return }
      setCurrentSub({
        status:       raw.status,
        isTrial:      raw.isTrial,
        currentPlan:  raw.currentPlan,
        usage:        raw.usage,
        billing:      raw.billing,
        addons:       raw.addons       || [],
        history:      raw.history      || [],
        installments: raw.installments || null,
      })
    } catch (err) {
      console.error('[fetchCurrentSub]', err?.response?.status, err?.response?.data?.message)
      setCurrentSub(null)
    } finally {
      setSubLoading(false)
    }
  }

  /* ── fetch available plans (read-only display) ── */
  const fetchPlans = async () => {
    setPlansLoading(true)
    try {
      const res = await getRequest(`subscriptionPlan?planType=${planType}&isActive=true`)
      setPlans(res?.data?.data?.plans || [])
    } catch {
      message.error('Failed to fetch plans')
    } finally {
      setPlansLoading(false)
    }
  }

  useEffect(() => { fetchCurrentSub() }, [])
  useEffect(() => { fetchPlans() }, [planType])

  const currentPlanName = currentSub?.currentPlan?.name

  return (
    <div className="space-y-4">

      {/* Page Header */}
      <div className="bg-white p-4 rounded border mb-2 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Ticket className="text-[#185FA5]" size={20} />
            My Subscription
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">View your active plan and usage</p>
        </div>
      </div>

      {/* Current Subscription Banner */}
      {subLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 flex justify-center shadow-sm"><Loader /></div>
      ) : currentSub ? (
        <>
          <CurrentSubscriptionBanner sub={currentSub} onRefresh={fetchCurrentSub} />
          {currentSub.currentPlan?.billingCycle === 'Yearly' && currentSub.installments?.schedule?.length > 0 && (
            <InstallmentSchedule installments={currentSub.installments} />
          )}
        </>
      ) : (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <AlertTriangle size={20} color="#ca8a04" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#92400e' }}>No Active Subscription</div>
            <div style={{ fontSize: 13, color: '#a16207', marginTop: 2 }}>Please contact your SAAS admin to assign a plan.</div>
          </div>
        </div>
      )}

      {/* Available Plans — read-only, no subscribe button */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ borderBottom: '1px solid #f3f4f6', display: 'flex' }}>
          {[{ key: 'Plan', label: 'Subscription Plans', Icon: Ticket }, { key: 'Addon', label: 'Add-ons', Icon: Puzzle }].map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setPlanType(key)}
              style={{ flex: 1, padding: '13px 20px', border: 'none', borderBottom: planType === key ? '2px solid #185FA5' : '2px solid transparent', background: planType === key ? '#f8f9fb' : 'transparent', color: planType === key ? '#185FA5' : '#9ca3af', fontSize: 13, fontWeight: planType === key ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Info notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: 20 }}>
            <span style={{ fontSize: 18 }}>ℹ️</span>
            <span style={{ fontSize: 13, color: '#0369a1', fontWeight: 500 }}>
              To subscribe or upgrade, please contact your SAAS admin. Plans are assigned centrally.
            </span>
          </div>

          {plansLoading ? (
            <div className="flex justify-center py-8"><Loader /></div>
          ) : plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 14 }}>No plans available</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {plans.map(plan => (
                <PlanCard key={plan._id} plan={plan} isCurrentPlan={plan.name === currentPlanName} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default SubscriptionPlans

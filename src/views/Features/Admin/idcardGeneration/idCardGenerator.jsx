import { TEAL, ORANGE, SchoolLogo } from './constants'

// ─── Photo / placeholder ──────────────────────────────────────────────────────
function PhotoPlaceholder({ photo, size = 80 }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt="Student"
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: 6,
          border: `3px solid ${ORANGE}`,
          display: 'block',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        border: `3px solid ${ORANGE}`,
        background: '#e8f5f4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: TEAL,
        fontWeight: 600,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
      <span style={{ marginTop: 2, fontSize: 9 }}>PHOTO</span>
    </div>
  )
}

// ─── IDCard ───────────────────────────────────────────────────────────────────
/**
 * Props
 *  student – raw API student enrolment object  OR  mapped shape:
 *    { id, name, fatherName, className, classRoll, photo, phone, schoolName }
 *  schoolName – fallback school name string
 *  small      – boolean, compact version for A4 bulk sheets
 */
export default function IDCard({ student, schoolName = 'SCHOOL NAME', small = false, schoolLogo }) {
  // ── Support both raw API object and pre-mapped shape ───────────────────────
  const isRaw = !!student?.firstName // raw API objects always have firstName

  const profilePic = isRaw
    ? student?.userId?.profilePic || student?.profilePic || null
    : student?.photo || null

  const fullName = isRaw
    ? `${student.firstName?.trim() || ''} ${student.middleName?.trim() || ''} ${student.lastName?.trim() || ''}`
        .replace(/\s+/g, ' ')
        .trim()
    : student?.name || ''

  const studentId = isRaw
    ? student?.studentId || student?.userId?.userId || '-'
    : student?.id || '-'
  const fatherName = isRaw ? student?.fatherName || '-' : student?.fatherName || '-'
  const className = isRaw ? student?.currentClass?.name || '-' : student?.className || '-'
  const sectionName = isRaw ? student?.currentSection?.name || null : null
  const classRoll = isRaw ? student?.rollNumber || '-' : student?.classRoll || '-'
  const phone = isRaw ? student?.phone || student?.userId?.phone || '-' : student?.phone || '-'
  const resolvedSchoolName = schoolName || 'SCHOOL NAME'

  // ── Scale everything uniformly ─────────────────────────────────────────────
  // Card width: 220px normal, 158px small
  // We use a fixed pixel card (no height cap) so content never gets clipped
  const W = small ? 158 : 220
  const scale = small ? 0.718 : 1

  const fs = (n) => n * scale // font-size helper
  const sp = (n) => n * scale // spacing helper

  return (
    <div
      style={{
        width: W,
        borderRadius: sp(14),
        overflow: 'hidden',
        fontFamily: "'Segoe UI', sans-serif",
        position: 'relative',
        boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
        background: '#fff',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Teal header ──────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: TEAL,
          background: `linear-gradient(135deg, ${TEAL} 60%, #1a5fd4)`,
          height: sp(88),
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: sp(6),
          flexShrink: 0,
        }}
      >
        {/* Orange arc top-right */}
        <svg
          style={{ position: 'absolute', top: 0, right: 0, width: sp(80), height: sp(60) }}
          viewBox="0 0 80 60"
          fill="none"
        >
          <ellipse cx="80" cy="0" rx="70" ry="55" fill={ORANGE} opacity="0.92" />
        </svg>

        {/* School logo – centered, above the name */}
        <div style={{ position: 'absolute', top: sp(6), zIndex: 2 }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
            <SchoolLogo />
          </div>
        </div>

        {/* School name – responsive: shrinks to fit */}
        <div
          style={{
            fontSize: fs(11),
            fontWeight: 800,
            color: 'white',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            textShadow: '0 1px 4px rgba(0,0,0,0.22)',
            zIndex: 2,
            width: '90%',
            textAlign: 'center',
            lineHeight: 1.2,
            // Responsive: shrink text if too long
            wordBreak: 'break-word',
            hyphens: 'auto',
          }}
        >
          {resolvedSchoolName}
        </div>
      </div>

      {/* ── White body ───────────────────────────────────────────────────── */}
      <div
        style={{
          padding: `${sp(9)}px ${sp(12)}px ${sp(10)}px`,
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Decorative blobs */}
        <svg
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: sp(80),
            height: sp(60),
            pointerEvents: 'none',
          }}
          viewBox="0 0 80 60"
          fill="none"
        >
          <ellipse cx="0" cy="60" rx="70" ry="50" fill={ORANGE} opacity="0.15" />
        </svg>
        <svg
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: sp(60),
            height: sp(40),
            pointerEvents: 'none',
          }}
          viewBox="0 0 60 40"
          fill="none"
        >
          <ellipse cx="60" cy="40" rx="55" ry="35" fill={TEAL} opacity="0.10" />
        </svg>

        {/* Profile photo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: sp(7) }}>
          <PhotoPlaceholder photo={profilePic} size={sp(68)} />
        </div>

        {/* Student ID badge */}
        <div
          style={{
            background: `linear-gradient(90deg, ${TEAL}, #1a5fd4)`,
            borderRadius: 20,
            padding: `${sp(3)}px ${sp(8)}px`,
            textAlign: 'center',
            marginBottom: sp(6),
          }}
        >
          <span style={{ color: 'white', fontSize: fs(7.5), fontWeight: 700, letterSpacing: 0.5 }}>
            STUDENT ID : {studentId}
          </span>
        </div>

        {/* Student name */}
        <div
          style={{
            fontSize: fs(13),
            fontWeight: 800,
            color: '#1a1a1a',
            marginBottom: sp(5),
            lineHeight: 1.15,
            wordBreak: 'break-word',
          }}
        >
          {fullName}
        </div>

        {/* Detail rows */}
        <div style={{ fontSize: fs(8), color: '#333', lineHeight: 1.9, flex: 1 }}>
          <div>
            <b style={{ color: TEAL }}>Father :</b> {fatherName}
          </div>
          <div>
            <b style={{ color: TEAL }}>Class :</b> {className}
            {sectionName && (
              <span
                style={{
                  display: 'inline-block',
                  background: ORANGE,
                  color: 'white',
                  fontSize: fs(7),
                  fontWeight: 700,
                  borderRadius: 10,
                  padding: `${sp(1)}px ${sp(5)}px`,
                  marginLeft: 4,
                }}
              >
                {sectionName}
              </span>
            )}
          </div>
          <div>
            <b style={{ color: TEAL }}>Roll :</b> {classRoll}
          </div>
          <div>
            <b style={{ color: TEAL }}>Phone :</b> {phone}
          </div>
        </div>
      </div>

      {/* ── Footer strip ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(90deg, ${TEAL}, #1a5fd4)`,
          padding: `${sp(4)}px ${sp(8)}px`,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'white', fontSize: fs(6.5), fontWeight: 600, letterSpacing: 0.3 }}>
          {resolvedSchoolName}
        </span>
      </div>
    </div>
  )
}

/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import { createContext, useCallback, useEffect, useState } from 'react'
import { getRequest } from '../Helpers/index'

export const SessionContext = createContext(null)

export const SessionProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null)
  const [sessionsList, setSessionsList] = useState([])
  const [sessionsList1, setSessionsList1] = useState([])
  const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   const fetchSession = async () => {
  //     try {
  //       const res = await getRequest('sessions?isCurrent=true&isPagination=false')
  //       const sessions = res?.data?.data?.sessions || []

  //       setSessionsList(sessions)

  //       const activeSession = sessions.find((s) => s.isCurrent)
  //       setCurrentSession(activeSession || null)
  //     } catch (err) {
  //       console.error(err)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   const fetchSession1 = async () => {
  //     try {
  //       const res = await getRequest('sessions?isPagination=false')
  //       const sessions = res?.data?.data?.sessions || []

  //       setSessionsList1(sessions)
  //     } catch (err) {
  //       console.error(err)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchSession1()
  //   fetchSession()
  // }, [])

   // ✅ Single Fetch Function
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)

      const [currentRes, allRes] = await Promise.all([
        getRequest('sessions?isCurrent=true&isPagination=false'),
        getRequest('sessions?isPagination=false')
      ])

      const currentSessions =
        currentRes?.data?.data?.sessions || []

      const allSessions =
        allRes?.data?.data?.sessions || []

      setSessionsList(currentSessions)
      setSessionsList1(allSessions)

      const activeSession = currentSessions.find(
        (s) => s.isCurrent
      )

      setCurrentSession(activeSession || null)
    } catch (err) {
      console.error('Session fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        sessionsList,
        loading,
        sessionsList1,
        refreshSessions: fetchSessions,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

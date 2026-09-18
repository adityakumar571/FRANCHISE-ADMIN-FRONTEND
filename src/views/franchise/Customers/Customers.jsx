/* eslint-disable prettier/prettier */
/**
 * Customers.jsx — Real API integrated (replaces mock version)
 * Routes to CustomerList which is the canonical real implementation
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// This page has been superseded by CustomerList.jsx which has full API integration.
// Redirect automatically so any old links still work.
export default function Customers() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/franchise/customers', { replace: true }) }, [navigate])
  return null
}

/* eslint-disable prettier/prettier */
// PlaceOrder screen redirects to PurchaseCart where actual order placement happens
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
export default function PlaceOrder() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/franchise/live-rates/purchase-cart', { replace: true }) }, [navigate])
  return null
}

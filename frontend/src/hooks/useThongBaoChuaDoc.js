import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../lib/api'

export default function useThongBaoChuaDoc(thonId) {
  const [soChuaDoc, setSoChuaDoc] = useState(0)
  const location = useLocation()

  const taiSoChuaDoc = useCallback(async () => {
    try {
      const url = thonId
        ? `/notifications/chua-doc?thon_id=${thonId}`
        : '/notifications/chua-doc'
      const data = await api.get(url)
      setSoChuaDoc(data.so_chua_doc || 0)
    } catch {
      setSoChuaDoc(0)
    }
  }, [thonId])

  useEffect(() => {
    taiSoChuaDoc()
  }, [taiSoChuaDoc, location.pathname])

  return soChuaDoc
}

import toast from 'react-hot-toast'
import { deleteRequest } from '../../../Helpers'

export const useNoticeActions = ({ setUpdateStatus, setLoading }) => {
  const deleteNotice = async (id) => {
    setLoading(true)
    try {
      await deleteRequest(`notices/${id}`)
      toast.success('Notice deleted')
      setUpdateStatus((p) => !p)
    } catch {
      toast.error('Delete failed')
    } finally {
      setLoading(false)
    }
  }

  return { deleteNotice }
}

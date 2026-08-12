// const EDIT_DELETE_TIME_LIMIT = 2 * 60 * 60 * 1000
const EDIT_DELETE_TIME_LIMIT = 5 * 60 * 1000 // 5 min

export const canEditOrDeleteNotice = ({ notice, user }) => {
  if (!notice || !user) return false

  const isCreator = String(notice.senderUser?._id) === String(user?.user?._id)

  if (!isCreator) return false

  const createdTime = new Date(notice.createdAt).getTime()
  const now = Date.now()

  return now - createdTime <= EDIT_DELETE_TIME_LIMIT
}

export const getEditTimeRemaining = (createdAt) => {
  const remaining = EDIT_DELETE_TIME_LIMIT - (Date.now() - new Date(createdAt).getTime())

  if (remaining <= 0) return null

  return `${Math.floor(remaining / 60000)}m left to edit`
}

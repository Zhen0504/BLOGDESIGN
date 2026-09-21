let pendingReturnCategory = null

export function setPendingCrystalReturn(category) {
  pendingReturnCategory = category === 'development' || category === 'research'
    ? category
    : null
}

export function consumePendingCrystalReturn(category) {
  if (pendingReturnCategory !== category) return false
  pendingReturnCategory = null
  return true
}

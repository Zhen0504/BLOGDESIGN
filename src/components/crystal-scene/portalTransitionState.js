let pendingReturnCategory = null

export function setPendingCrystalReturn(category) {
  pendingReturnCategory = ['about', 'development', 'research'].includes(category)
    ? category
    : null
}

export function consumePendingCrystalReturn(category) {
  if (pendingReturnCategory !== category) return false
  pendingReturnCategory = null
  return true
}

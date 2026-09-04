const cardGap = 8
const cardMinWidth = 180
const viewHorizontalPadding = 32

export const getColumnCount = (width: number): number => {
  const availableWidth = Math.max(0, width - viewHorizontalPadding)
  return Math.max(1, Math.floor((availableWidth + cardGap) / (cardMinWidth + cardGap)))
}

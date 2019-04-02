/**
 * 返回特定长度的字符串
 * @param {number} length 长度
 * @return 特定长度的deli串
 */
function space(length, deli = ' ') {
  if (length < 0) throw new Error('字符串长度不可以小于0')
  return new Array(length + 1).join(deli)
}

/**
 * 在字符串/数值左右填充空格
 * @param {number | string} s 需要填充的字符串/数值
 * @param {string} position 填充空格的位置，front/back
 * @param {number} length 填充长度
 */
function expandString(s, position, length = 2, deli = ' ') {
  if (getLength(s) >= length) return s.slice(0, length)
  const spaces = space(length - getLength(s), deli)
  return position === 'front' ? spaces + s : s + spaces
}

function getLength(s) {
  return String(s).replace(/[^\x00-\xff]/g, "01").length
}

module.exports = {
  space,
  expandString
}

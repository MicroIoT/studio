export function getTypeInfo (dataType) {
  let info = ''
  if (dataType.type === 'Enum') {
    info = dataType.enumType
  } else if (dataType.type === 'String') {
    let min = dataType.min
    let max = dataType.max
    let mininfo, maxinfo
    if (min !== null) {
      mininfo = '最小长度:' + min
    }
    if (max !== null) {
      maxinfo = ' 最大长度:' + max
    }
    info = mininfo + maxinfo
  } else if (dataType.type === 'DateTime') {
    info = '日期格式：' + dataType.format
  } else if (dataType.type === 'Array') {
    info = dataType.dataType.type + '\n' + getTypeInfo(dataType.dataType)
  }
  return info
}

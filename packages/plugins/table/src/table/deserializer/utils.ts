/**
 * Supplement the missing rows and columns of the merged cells
 */
export const supplementMergeCells = (tableElement: HTMLTableElement) => {
  trimStartTr(tableElement)
  fixNumberTr(tableElement)

  for (let rowIndex = 0; rowIndex < tableElement.rows.length; rowIndex++) {
    const row = tableElement.rows[rowIndex]
    for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
      const cell = row.cells[cellIndex]
      const style = cell.getAttribute('style') ?? ''
      // mso-ignore:rowspan mso-ignore:colspan often appears in word, indicating that merged cells are ignored
      const ignoreRowspan = style.includes('mso-ignore:rowspan')
      const ignoreColspan = style.includes('mso-ignore:colspan')
      const colspanValue = cell.getAttribute('colspan')
      const colspan = colspanValue && !ignoreColspan ? parseInt(colspanValue) : 1
      const rowspanValue = cell.getAttribute('rowspan')
      const rowspan = rowspanValue && !ignoreRowspan ? parseInt(rowspanValue) : 1

      if (colspan > 1 || rowspan > 1) {
        for (let i = 0; i < rowspan; i++) {
          const r = i + rowIndex
          if (!tableElement.rows[r]) {
            const newRow = tableElement.insertRow(r)
            for (let j = 0; j < cellIndex; j++) {
              newRow.insertCell(j)
            }
          }
          for (let j = 0; j < colspan; j++) {
            const c = j + cellIndex
            if (!tableElement.rows[r].cells[c]) {
              const cell = tableElement.rows[r].insertCell(c)
              cell.setAttribute('span', `${rowIndex},${cellIndex}`)
            }
          }
        }
      }
    }
  }
}

const trimStartTr = (tableElement: HTMLTableElement) => {
  const rows = tableElement.rows
  if (rows.length > 0) {
    const firstRow = rows[0]
    if (firstRow.cells.length === 0) {
      tableElement.deleteRow(0)
    }
  }
}

const fixNumberTr = (tableElement: HTMLTableElement) => {
  const rows = tableElement.rows
  const rowCount = rows?.length || 0
  let colCounts: Array<number> = []
  let firstColCount: number = 0 // 第一列的单元格个数
  let cellCounts = [] // 每行单元格个数
  let totalCellCounts = 0 // 总单元格个数
  let emptyCounts = 0 // 跨行合并缺损的单元格
  // 已经存在一行中的 td 的最大数，最终算出来的最大列数一定要大于等于这个值
  let maxCellCounts = 0 // 在不确定是否缺少tr时，先拿到已经存在的td，和一些关键信息

  for (let r = 0; r < rowCount; r++) {
    const row = rows[r]
    const cells = row.cells
    let cellCountThisRow = 0

    for (let c = 0; c < cells.length; c++) {
      const { rowSpan, colSpan } = cells[c]
      totalCellCounts += rowSpan * colSpan
      cellCountThisRow += colSpan
      if (rowSpan > 1) {
        emptyCounts += (rowSpan - 1) * colSpan
      }
    }
    cellCounts[r] = cellCountThisRow
    if (r === 0) {
      firstColCount = cellCountThisRow
    }
    maxCellCounts = Math.max(cellCountThisRow, maxCellCounts)
  }
  // number拷贝的一定是首行列数能被单元格总数整除
  const isNumber1 = totalCellCounts / firstColCount // number拷贝的一定是首行列数最大
  const isNumber2 = firstColCount === maxCellCounts
  const isNumber = isNumber1 && isNumber2 // 判断是否是 number, 是因为 number 需要考虑先修复省略的 tr，否则后面修复出来就会有问题

  if (isNumber) {
    let lossCellCounts = 0
    cellCounts.forEach(cellCount => {
      lossCellCounts += maxCellCounts - cellCount
    })

    if (lossCellCounts !== emptyCounts) {
      const missCellCounts = emptyCounts - lossCellCounts
      if (missCellCounts / maxCellCounts) {
        let lossRowIndex = [] // 记录哪一行缺 tr

        for (let _r = 0; _r < rowCount; _r++) {
          const _row = rows[_r]
          const _cells = _row.cells
          let realRow: number = _r + lossRowIndex.length

          while (colCounts[realRow] === maxCellCounts) {
            lossRowIndex.push(realRow)
            realRow++
          }

          for (let _c2 = 0; _c2 < _cells.length; _c2++) {
            const { rowSpan, colSpan } = _cells[_c2]
            if (rowSpan > 1) {
              for (let rr = 1; rr < rowSpan; rr++) {
                colCounts[realRow + rr] = (colCounts[realRow + rr] || 0) + colSpan
              }
            }
          }
        }

        lossRowIndex.forEach(row => {
          tableElement.insertRow(row)
        })
      }
    }
  }
}

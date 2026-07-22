import JSZip from 'jszip'

interface SeriesData {
  name: string
  values: number[]
  color: string
}

interface ChartDef {
  title: string
  type: 'bar' | 'barH' | 'barStacked' | 'doughnut'
  categories: string[]
  series: SeriesData[]
  fromCol: number
  fromRow: number
  toCol: number
  toRow: number
}

function xmlPts(items: string[], tag: 'strLit' | 'numLit') {
  const pts = items.map((v, i) => `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join('')
  const fmt = tag === 'numLit' ? '<c:formatCode>General</c:formatCode>' : ''
  return `<c:${tag}>${fmt}<c:ptCount val="${items.length}"/>${pts}</c:${tag}>`
}

function serXml(s: SeriesData, idx: number, categories: string[]) {
  return `<c:ser>
  <c:idx val="${idx}"/><c:order val="${idx}"/>
  <c:tx><c:v>${s.name}</c:v></c:tx>
  <c:spPr><a:solidFill><a:srgbClr val="${s.color.replace('#', '')}"/></a:solidFill></c:spPr>
  <c:cat>${xmlPts(categories, 'strLit')}</c:cat>
  <c:val>${xmlPts(s.values.map(String), 'numLit')}</c:val>
</c:ser>`
}

function doughnutSerXml(s: SeriesData, categories: string[], colors: string[]) {
  const dPts = colors.map((c, i) =>
    `<c:dPt><c:idx val="${i}"/><c:spPr><a:solidFill><a:srgbClr val="${c.replace('#', '')}"/></a:solidFill></c:spPr></c:dPt>`
  ).join('')
  return `<c:ser>
  <c:idx val="0"/><c:order val="0"/>
  <c:tx><c:v>${s.name}</c:v></c:tx>
  ${dPts}
  <c:cat>${xmlPts(categories, 'strLit')}</c:cat>
  <c:val>${xmlPts(s.values.map(String), 'numLit')}</c:val>
</c:ser>`
}

function titleXml(text: string) {
  return `<c:title><c:tx><c:rich>
  <a:bodyPr/><a:lstStyle/>
  <a:p><a:pPr><a:defRPr sz="1200" b="1"/></a:pPr>
  <a:r><a:rPr lang="vi-VN" sz="1200" b="1"/><a:t>${text}</a:t></a:r></a:p>
</c:rich></c:tx><c:overlay val="0"/></c:title>`
}

function barChartXml(def: ChartDef) {
  const isHoriz = def.type === 'barH'
  const isStacked = def.type === 'barStacked'
  const dir = isHoriz ? 'bar' : 'col'
  const grouping = isStacked ? 'stacked' : 'clustered'
  const catPos = isHoriz ? 'l' : 'b'
  const valPos = isHoriz ? 'b' : 'l'
  const allSeries = def.series.map((s, i) => serXml(s, i, def.categories)).join('\n')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart"
              xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
              xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<c:lang val="vi-VN"/>
<c:chart>
  ${titleXml(def.title)}
  <c:autoTitleDeleted val="0"/>
  <c:plotArea>
    <c:layout/>
    <c:barChart>
      <c:barDir val="${dir}"/>
      <c:grouping val="${grouping}"/>
      <c:varyColors val="0"/>
      ${allSeries}
      <c:axId val="111111"/>
      <c:axId val="222222"/>
    </c:barChart>
    <c:catAx>
      <c:axId val="111111"/>
      <c:scaling><c:orientation val="minMax"/></c:scaling>
      <c:delete val="0"/>
      <c:axPos val="${catPos}"/>
      <c:tickLblPos val="nextTo"/>
      <c:crossAx val="222222"/>
      <c:crosses val="autoZero"/>
      <c:auto val="1"/>
      <c:lblAlgn val="ctr"/>
      <c:lblOffset val="100"/>
    </c:catAx>
    <c:valAx>
      <c:axId val="222222"/>
      <c:scaling><c:orientation val="minMax"/></c:scaling>
      <c:delete val="0"/>
      <c:axPos val="${valPos}"/>
      <c:majorGridlines/>
      <c:numFmt formatCode="General" sourceLinked="1"/>
      <c:tickLblPos val="nextTo"/>
      <c:crossAx val="111111"/>
      <c:crosses val="autoZero"/>
      <c:crossBetween val="between"/>
    </c:valAx>
  </c:plotArea>
  <c:legend><c:legendPos val="b"/><c:layout/><c:overlay val="0"/></c:legend>
  <c:plotVisOnly val="1"/>
  <c:dispBlanksAs val="gap"/>
</c:chart>
<c:printSettings><c:headerFooter/><c:pageMargins b="0.75" l="0.7" r="0.7" t="0.75" header="0.3" footer="0.3"/><c:pageSetup/></c:printSettings>
</c:chartSpace>`
}

function doughnutChartXml(def: ChartDef) {
  const colors = def.series[0] ? [def.series[0].color] : []
  const allColors = def.series.map(s => s.color)
  const categories = def.categories
  const values = def.series.map(s => s.values[0])

  const ser = doughnutSerXml(
    { name: def.title, values, color: '' },
    categories,
    allColors,
  )

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart"
              xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
              xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<c:lang val="vi-VN"/>
<c:chart>
  ${titleXml(def.title)}
  <c:autoTitleDeleted val="0"/>
  <c:plotArea>
    <c:layout/>
    <c:doughnutChart>
      <c:varyColors val="1"/>
      ${ser}
      <c:firstSliceAng val="0"/>
      <c:holeSize val="50"/>
    </c:doughnutChart>
  </c:plotArea>
  <c:legend><c:legendPos val="r"/><c:layout/><c:overlay val="0"/></c:legend>
  <c:plotVisOnly val="1"/>
  <c:dispBlanksAs val="gap"/>
</c:chart>
<c:printSettings><c:headerFooter/><c:pageMargins b="0.75" l="0.7" r="0.7" t="0.75" header="0.3" footer="0.3"/><c:pageSetup/></c:printSettings>
</c:chartSpace>`
}

function chartXml(def: ChartDef) {
  return def.type === 'doughnut' ? doughnutChartXml(def) : barChartXml(def)
}

function drawingXml(charts: ChartDef[]) {
  const frames = charts.map((c, i) => `
  <xdr:twoCellAnchor>
    <xdr:from><xdr:col>${c.fromCol}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${c.fromRow}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>${c.toCol}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${c.toRow}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr>
        <xdr:cNvPr id="${i + 2}" name="Chart ${i + 1}"/>
        <xdr:cNvGraphicFramePr/>
      </xdr:nvGraphicFramePr>
      <xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
      <a:graphic>
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId${i + 1}"/>
        </a:graphicData>
      </a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:twoCellAnchor>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"
          xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
${frames}
</xdr:wsDr>`
}

function drawingRelsXml(count: number) {
  const rels = Array.from({ length: count }, (_, i) =>
    `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${i + 1}.xml"/>`
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${rels}
</Relationships>`
}

export async function injectChartsIntoXlsx(
  xlsxBuffer: Buffer,
  charts: ChartDef[],
  dashboardSheetIndex: number,
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(xlsxBuffer)

  const sheetNum = dashboardSheetIndex + 1
  const sheetPath = `xl/worksheets/sheet${sheetNum}.xml`

  // 1) Add chart XML files
  for (let i = 0; i < charts.length; i++) {
    zip.file(`xl/charts/chart${i + 1}.xml`, chartXml(charts[i]))
  }

  // 2) Add drawing
  zip.file('xl/drawings/drawing1.xml', drawingXml(charts))
  zip.file('xl/drawings/_rels/drawing1.xml.rels', drawingRelsXml(charts.length))

  // 3) Add worksheet->drawing relationship
  const sheetRelsPath = `xl/worksheets/_rels/sheet${sheetNum}.xml.rels`
  let sheetRels = ''
  if (zip.file(sheetRelsPath)) {
    sheetRels = await zip.file(sheetRelsPath)!.async('string')
    // Insert new relationship before closing tag
    const drawingRel = `<Relationship Id="rIdDrawing1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>`
    sheetRels = sheetRels.replace('</Relationships>', `${drawingRel}\n</Relationships>`)
  } else {
    sheetRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rIdDrawing1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`
  }
  zip.file(sheetRelsPath, sheetRels)

  // 4) Add <drawing> element to worksheet XML
  let sheetXml = await zip.file(sheetPath)!.async('string')
  if (!sheetXml.includes('<drawing')) {
    sheetXml = sheetXml.replace('</worksheet>', '<drawing r:id="rIdDrawing1"/></worksheet>')
  }
  zip.file(sheetPath, sheetXml)

  // 5) Update [Content_Types].xml
  let contentTypes = await zip.file('[Content_Types].xml')!.async('string')
  if (!contentTypes.includes('drawingml.chart+xml')) {
    const chartOverrides = charts.map((_, i) =>
      `<Override PartName="/xl/charts/chart${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`
    ).join('\n')
    const drawingOverride = `<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`
    contentTypes = contentTypes.replace('</Types>', `${chartOverrides}\n${drawingOverride}\n</Types>`)
  }
  zip.file('[Content_Types].xml', contentTypes)

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }) as Promise<Buffer>
}

export type { ChartDef, SeriesData }

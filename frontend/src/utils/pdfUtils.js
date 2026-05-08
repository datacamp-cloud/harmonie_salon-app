// src/utils/pdfUtils.js
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function loadLogo() {
  try {
    const res = await fetch('/logo.jpg')
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

// Formatage montant sans toLocaleString (jsPDF ne supporte pas l'espace insecable)
function fcfa(n) {
  const num = Math.round(Number(n || 0))
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA'
}

function fdate(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

// ─── En-tête simple ───────────────────────────────────────────────────────────
async function addHeader(doc, title, subtitle = '') {
  const logo = await loadLogo()
  const pageW = doc.internal.pageSize.getWidth()

  // Bande grise claire
  doc.setFillColor(248, 248, 248)
  doc.rect(0, 0, pageW, 28, 'F')

  // Ligne de séparation fine
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(0, 28, pageW, 28)

  // Logo
  if (logo) {
    doc.addImage(logo, 'JPEG', 10, 4, 18, 18)
  }

  const textX = logo ? 32 : 10

  // Nom du salon
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Harmonie Salon', textX, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(130, 130, 130)
  doc.text('WebStock — Gestion de stock', textX, 20)

  // Titre du document (droite)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(40, 40, 40)
  doc.text(title, pageW - 10, 13, { align: 'right' })

  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(130, 130, 130)
    doc.text(subtitle, pageW - 10, 20, { align: 'right' })
  }

  return 36
}

// ─── Pied de page ────────────────────────────────────────────────────────────
function addFooter(doc) {
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const pages = doc.internal.getNumberOfPages()

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(10, pageH - 12, pageW - 10, pageH - 12)
    doc.setTextColor(160, 160, 160)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Harmonie Salon — WebStock', 10, pageH - 7)
    doc.text(
      `Page ${i}/${pages}  |  Imprime le ${fdate(new Date().toISOString().slice(0, 10))}`,
      pageW - 10, pageH - 7, { align: 'right' },
    )
  }
}

// ─── Style tableau commun ────────────────────────────────────────────────────
const tableStyles = {
  styles: { fontSize: 9, cellPadding: 3, textColor: [40, 40, 40] },
  headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
  alternateRowStyles: { fillColor: [248, 248, 248] },
  margin: { left: 10, right: 10 },
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. Reçu de vente
// ═════════════════════════════════════════════════════════════════════════════
export async function generateRecuVente(vente) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = await addHeader(doc, 'RECU DE VENTE', `N  VTE-${String(vente.id).padStart(4, '0')}`)
  const pageW = doc.internal.pageSize.getWidth()

  // Infos
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text(`Date    : ${fdate(vente.date)}`, 10, y)
  doc.text(`Client  : ${vente.clientNom || 'Client anonyme'}`, 10, y + 7)
  y += 18

  // Tableau
  autoTable(doc, {
    startY: y,
    head: [['Produit', 'Qté', 'Prix de vente', 'Total']],
    didParseCell(data) {
      if (data.section === 'head') {
        if (data.column.index === 1) data.cell.styles.halign = 'center' // Qte
        if (data.column.index === 2) data.cell.styles.halign = 'right'  // Prix de vente
        if (data.column.index === 3) data.cell.styles.halign = 'right'  // Total
      }

      if (data.section === 'foot'){
        if (data.column.index === 3) data.cell.styles.halign ='right'
      }
    },
    body: vente.items.map((i) => [
      i.produitNom,
      String(i.quantite),
      fcfa(i.prixUnitaire),
      fcfa(i.total),
    ]),
    foot: [['', '', '', fcfa(vente.total)]],
    ...tableStyles,
    footStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      1: { halign: 'center', cellWidth: 12 },
      2: { halign: 'right', cellWidth: 45 },
      3: { halign: 'right', cellWidth: 45 },
    },
  })

  y = doc.lastAutoTable.finalY + 12

  // Message bas
  doc.setFillColor(248, 248, 248)
  doc.roundedRect(10, y, pageW - 20, 14, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text('Merci pour votre achat !', pageW / 2, y + 6, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(130, 130, 130)
  doc.text('Harmonie Salon vous souhaite une excellente journee.', pageW / 2, y + 11, { align: 'center' })

  addFooter(doc)
  doc.save(`recu-vente-${String(vente.id).padStart(4, '0')}.pdf`)
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. Reçu de prestation
// ═════════════════════════════════════════════════════════════════════════════
export async function generateRecuRecette(recette) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = await addHeader(doc, 'RECU DE PRESTATION', `N  REC-${String(recette.id).padStart(4, '0')}`)
  const pageW = doc.internal.pageSize.getWidth()

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text(`Date    : ${fdate(recette.date)}`, 10, y)
  doc.text(`Client  : ${recette.clientNom || 'Client anonyme'}`, 10, y + 7)
  y += 18

  autoTable(doc, {
    startY: y,
    head: [['Prestation', 'Tarif reference', 'Prix applique']],
    body: [[recette.prestationNom, fcfa(recette.prixReference), fcfa(recette.prixApplique)]],
    ...tableStyles,
    columnStyles: {
      1: { halign: 'right', cellWidth: 45 },
      2: { halign: 'right', cellWidth: 45 },
    },
    didParseCell(data) {
      if (data.section === 'head') {
        if (data.column.index === 1) data.cell.styles.halign = 'right' // Qte
        if (data.column.index === 2) data.cell.styles.halign = 'right'  // Prix de vente
      }

      if (data.section === 'foot'){
        if (data.column.index === 3) data.cell.styles.halign ='right'
      }
    },
  })

  y = doc.lastAutoTable.finalY + 8

  if (recette.notes) {
    doc.setFontSize(8)
    doc.setTextColor(130, 130, 130)
    doc.text(`Notes : ${recette.notes}`, 10, y)
    y += 8
  }

  // Montant total encaissé
  doc.setFillColor(40, 40, 40)
  doc.roundedRect(pageW - 78, y, 68, 18, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('MONTANT ENCAISSE', pageW - 44, y + 6, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(fcfa(recette.prixApplique), pageW - 44, y + 14, { align: 'center' })
  y += 28

  doc.setFillColor(248, 248, 248)
  doc.roundedRect(10, y, pageW - 20, 14, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text('Merci de votre confiance !', pageW / 2, y + 6, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(130, 130, 130)
  doc.text('Harmonie Salon vous souhaite une excellente journee.', pageW / 2, y + 11, { align: 'center' })

  addFooter(doc)
  doc.save(`recu-prestation-${String(recette.id).padStart(4, '0')}.pdf`)
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. État de stock
// ═════════════════════════════════════════════════════════════════════════════
export async function generateEtatStock(produits, dateChoisie) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const dateStr = dateChoisie
    ? dateChoisie.split('-').reverse().join('/')
    : new Date().toLocaleDateString('fr-FR')
  let y = await addHeader(doc, 'ETAT DE STOCK', `Au ${dateStr}`)
  const pageW = doc.internal.pageSize.getWidth()

  const valeurTotale = produits.reduce((t, p) => t + p.stock * p.prix, 0)
  const enRupture    = produits.filter((p) => p.stock <= 0).length
  const stockFaible  = produits.filter((p) => p.stock > 0 && p.stock <= 5).length
  const actifs       = produits.filter((p) => p.actif).length

  // KPIs texte simple
  // doc.setFont('helvetica', 'normal')
  // doc.setFontSize(9)
  // doc.setTextColor(60, 60, 60)
  // doc.text(`Produits actifs : ${actifs}   |   En rupture : ${enRupture}   |   Stock faible : ${stockFaible}`, 10, y)
  // y += 10

  // Ligne séparatrice
  doc.setDrawColor(200, 200, 200)
  doc.line(10, y, pageW - 10, y)
  y += 6

  // Grouper par type
  const parType = {}
  produits.forEach((p) => {
    const t = p.typeNom || 'Sans type'
    if (!parType[t]) parType[t] = []
    parType[t].push(p)
  })

  for (const [type, items] of Object.entries(parType)) {
    // Titre du groupe
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)
    doc.text(type.toUpperCase(), 10, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Produit', 'Stock']],
      body: items.map((p) => [p.nom, String(p.stock)]),
      ...tableStyles,
      styles: { ...tableStyles.styles, fontSize: 8 },
      columnStyles: {
        1: { halign: 'center', cellWidth: 30 },
      },
      didParseCell(data) {
        if (data.section === 'head' && data.column.index === 1) {
          data.cell.styles.halign = 'center'
        }
        if (data.column.index === 1 && data.section === 'body') {
          const val = Number(data.cell.raw)
          if (val <= 0)      data.cell.styles.textColor = [180, 40, 40]
          else if (val <= 5) data.cell.styles.textColor = [160, 100, 0]
          else               data.cell.styles.textColor = [30, 130, 70]
          data.cell.styles.fontStyle = 'bold'
        }
      },
    })
    y = doc.lastAutoTable.finalY + 6
  }

  addFooter(doc)
  const urlStock = doc.output('bloburl')
  window.open(urlStock, '_blank')
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. État de caisse
// ═════════════════════════════════════════════════════════════════════════════
export async function generateEtatCaisse(ventes, recettes, depenses, periode) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = await addHeader(doc, 'ETAT DE CAISSE', periode)
  const pageW = doc.internal.pageSize.getWidth()

  const totalVentes   = ventes.filter((v) => v.isValidated).reduce((t, v) => t + (v.total || 0), 0)
  const totalRecettes = recettes.filter((r) => r.isValidated).reduce((t, r) => t + (r.prixApplique || 0), 0)
  const totalDepenses = depenses.filter((d) => d.isValidated).reduce((t, d) => t + (d.montant || 0), 0)
  const solde         = totalVentes + totalRecettes - totalDepenses

  // Résumé
  const rows = [
    { label: 'Ventes de produits',    value: fcfa(totalVentes) },
    { label: 'Recettes / Prestations', value: fcfa(totalRecettes) },
    { label: 'Depenses',              value: fcfa(totalDepenses) },
  ]
  rows.forEach((row, i) => {
    const rowY = y + i * 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    doc.text(row.label, 10, rowY)
    doc.setFont('helvetica', 'bold')
    doc.text(row.value, pageW - 10, rowY, { align: 'right' })
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)
    doc.line(10, rowY + 3, pageW - 10, rowY + 3)
  })
  y += 38

  // Solde net
  const soldeColor = solde >= 0 ? [30, 130, 70] : [180, 40, 40]
  doc.setFillColor(...soldeColor)
  doc.roundedRect(10, y, pageW - 20, 16, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('SOLDE NET', 16, y + 10)
  doc.setFontSize(12)
  doc.text(fcfa(solde), pageW - 14, y + 10, { align: 'right' })

  addFooter(doc)
  const url = doc.output('bloburl')
  window.open(url, '_blank')
}

// ── 5. Liste periodique des ventes ─────────────────────────────────────────
export async function generateListeVentes(ventes, dateDebut, dateFin) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const periode = `Du ${dateDebut.split('-').reverse().join('/')} au ${dateFin.split('-').reverse().join('/')}`
  let y = await addHeader(doc, 'LISTE DES VENTES', periode)
  const pageW = doc.internal.pageSize.getWidth()
  const ventesValidees = ventes.filter((v) => v.isValidated)
  const total = ventesValidees.reduce((t, v) => t + (v.total || 0), 0)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text(`${ventes.length} vente(s)  |  Validees : ${ventesValidees.length}  |  Montant total : ${fcfa(total)}`, 10, y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Client', 'Produits', 'Qte', 'Total', 'Statut']],
    body: ventes.map((v) => [
      fdate(v.date),
      v.clientNom || 'Anonyme',
      v.items?.map((i) => i.produitNom).join(', ') || '',
      String(v.totalQuantite || 0),
      fcfa(v.total),
      v.isValidated ? 'Validee' : 'En attente',
    ]),
    ...tableStyles,
    styles: { ...tableStyles.styles, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 24 }, 1: { cellWidth: 40 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'right', cellWidth: 38 },
      5: { halign: 'center', cellWidth: 24 },
    },
    didParseCell(data) {
      if (data.section === 'head') {
        if (data.column.index === 3) data.cell.styles.halign = 'center'
        if (data.column.index === 4) data.cell.styles.halign = 'right'
        if (data.column.index === 5) data.cell.styles.halign = 'center'
      }
      if (data.column.index === 5 && data.section === 'body') {
        data.cell.styles.textColor = data.cell.raw === 'Validee' ? [30, 130, 70] : [160, 100, 0]
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const finalY = doc.lastAutoTable.finalY + 4
  doc.setFillColor(40, 40, 40)
  doc.rect(10, finalY, pageW - 20, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(`TOTAL : ${fcfa(total)}`, pageW - 14, finalY + 6, { align: 'right' })
  addFooter(doc)
  const url = doc.output('bloburl')
  window.open(url, '_blank')
}

// ── 6. Liste periodique des recettes ───────────────────────────────────────
export async function generateListeRecettes(recettes, dateDebut, dateFin) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const periode = `Du ${dateDebut.split('-').reverse().join('/')} au ${dateFin.split('-').reverse().join('/')}`
  let y = await addHeader(doc, 'LISTE DES RECETTES', periode)
  const pageW = doc.internal.pageSize.getWidth()
  const recettesValidees = recettes.filter((r) => r.isValidated)
  const total = recettesValidees.reduce((t, r) => t + (r.prixApplique || 0), 0)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text(`${recettes.length} recette(s)  |  Validees : ${recettesValidees.length}  |  Montant total : ${fcfa(total)}`, 10, y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Prestation', 'Client', 'Prix applique', 'Statut']],
    body: recettes.map((r) => [
      fdate(r.date), r.prestationNom, r.clientNom || 'Anonyme',
      fcfa(r.prixApplique), r.isValidated ? 'Validee' : 'En attente',
    ]),
    ...tableStyles,
    styles: { ...tableStyles.styles, fontSize: 8.5 },
    columnStyles: {
      0: { cellWidth: 26 },
      3: { halign: 'right', cellWidth: 42 },
      4: { halign: 'center', cellWidth: 26 },
    },
    didParseCell(data) {
      if (data.section === 'head') {
        if (data.column.index === 3) data.cell.styles.halign = 'right'
        if (data.column.index === 4) data.cell.styles.halign = 'center'
      }
      if (data.column.index === 4 && data.section === 'body') {
        data.cell.styles.textColor = data.cell.raw === 'Validee' ? [30, 130, 70] : [160, 100, 0]
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const finalY = doc.lastAutoTable.finalY + 4
  doc.setFillColor(40, 40, 40)
  doc.rect(10, finalY, pageW - 20, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(`TOTAL : ${fcfa(total)}`, pageW - 14, finalY + 6, { align: 'right' })
  addFooter(doc)
  const urlRec = doc.output('bloburl')
  window.open(urlRec, '_blank')
}

// ── 7. Liste periodique des depenses ───────────────────────────────────────
export async function generateListeDepenses(depenses, dateDebut, dateFin) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const periode = `Du ${dateDebut.split('-').reverse().join('/')} au ${dateFin.split('-').reverse().join('/')}`
  let y = await addHeader(doc, 'LISTE DES DEPENSES', periode)
  const pageW = doc.internal.pageSize.getWidth()
  const depensesValidees = depenses.filter((d) => d.isValidated)
  const total = depensesValidees.reduce((t, d) => t + (d.montant || 0), 0)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.text(`${depenses.length} depense(s)  |  Validees : ${depensesValidees.length}  |  Montant total : ${fcfa(total)}`, 10, y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Charge', 'Montant', 'Notes', 'Statut']],
    body: depenses.map((d) => [
      fdate(d.date), d.chargeNom, fcfa(d.montant), d.notes || '',
      d.isValidated ? 'Validee' : 'En attente',
    ]),
    ...tableStyles,
    styles: { ...tableStyles.styles, fontSize: 8.5 },
    columnStyles: {
      0: { cellWidth: 26 }, 1: { cellWidth: 48 },
      2: { halign: 'right', cellWidth: 42 },
      4: { halign: 'center', cellWidth: 26 },
    },
    didParseCell(data) {
      if (data.section === 'head') {
        if (data.column.index === 2) data.cell.styles.halign = 'right'
        if (data.column.index === 4) data.cell.styles.halign = 'center'
      }
      if (data.column.index === 4 && data.section === 'body') {
        data.cell.styles.textColor = data.cell.raw === 'Validee' ? [30, 130, 70] : [160, 100, 0]
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const finalY = doc.lastAutoTable.finalY + 4
  doc.setFillColor(40, 40, 40)
  doc.rect(10, finalY, pageW - 20, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(`TOTAL : ${fcfa(total)}`, pageW - 14, finalY + 6, { align: 'right' })
  addFooter(doc)
  const urlDep = doc.output('bloburl')
  window.open(urlDep, '_blank')
}

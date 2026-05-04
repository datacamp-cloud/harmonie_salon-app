import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileText, Loader2, Package, Receipt, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import {
  generateEtatCaisse, generateEtatStock,
  generateListeDepenses, generateListeRecettes, generateListeVentes,
  generateRecuRecette, generateRecuVente,
} from '../utils/pdfUtils'

function filterByPeriod(items, dateField, period, customStart, customEnd) {
  const today = new Date().toISOString().slice(0, 10)
  const week  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const month = new Date().toISOString().slice(0, 7)
  return items.filter((item) => {
    const d = item[dateField]
    if (period === 'today')  return d === today
    if (period === 'week')   return d >= week
    if (period === 'month')  return d.startsWith(month)
    if (period === 'custom') return d >= customStart && d <= customEnd
    return true
  })
}

function periodLabel(period, customStart, customEnd) {
  if (period === 'today') return `Aujourd'hui — ${new Date().toLocaleDateString('fr-FR')}`
  if (period === 'week')  return `7 derniers jours`
  if (period === 'month') return `Mois de ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
  if (period === 'custom' && customStart && customEnd) {
    const fmt = (d) => d.split('-').reverse().join('/')
    return `Du ${fmt(customStart)} au ${fmt(customEnd)}`
  }
  return 'Toute la période'
}

function SectionTitle({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <h2 className="text-base font-semibold text-beige-900">{label}</h2>
    </div>
  )
}

function PeriodSelector({ period, setPeriod, customStart, setCustomStart, customEnd, setCustomEnd }) {
  return (
    <div className="flex flex-wrap gap-2 items-end">
      <select value={period} onChange={(e) => setPeriod(e.target.value)}
        className="px-3 py-2 text-sm border border-beige-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-300">
        <option value="all">Toute la période</option>
        <option value="today">Aujourd'hui</option>
        <option value="week">7 derniers jours</option>
        <option value="month">Ce mois</option>
        <option value="custom">Personnalisé</option>
      </select>
      {period === 'custom' && (
        <>
          <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-2 text-sm border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-300" />
          <span className="text-beige-500 text-sm self-center">→</span>
          <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-2 text-sm border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-300" />
        </>
      )}
    </div>
  )
}

function ReportCard({ title, description, count, total, onGenerate, loading }) {
  return (
    <div className="bg-beige-50 rounded-xl border border-beige-200 p-4 flex flex-col gap-3">
      <div>
        <p className="font-medium text-beige-900 text-sm">{title}</p>
        <p className="text-xs text-beige-500 mt-0.5">{description}</p>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-beige-900">{Number(total || 0).toLocaleString('fr-FR')} FCFA</span>
          <span className="text-xs text-beige-500 ml-2">{count} élément(s)</span>
        </div>
        <button type="button" onClick={onGenerate} disabled={loading || count === 0}
          className="flex items-center gap-1.5 px-3 py-2 bg-beige-900 text-white text-xs rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          PDF
        </button>
      </div>
    </div>
  )
}

function SoldeCard({ label, value, color, negative = false, bold = false }) {
  const colors = {
    rose:   'bg-rose-50   border-rose-200   text-rose-700',
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    red:    'bg-red-50    border-red-200    text-red-700',
    green:  'bg-green-50  border-green-200  text-green-700',
  }
  return (
    <div className={`rounded-lg border p-3 ${colors[color]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className={`mt-1 ${bold ? 'text-base font-bold' : 'text-sm font-semibold'}`}>
        {negative ? '- ' : ''}{Number(value || 0).toLocaleString('fr-FR')} F
      </p>
    </div>
  )
}

function Reports() {
  const toast = useToast()
  const [period, setPeriod]           = useState('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd]     = useState('')
  const [loading, setLoading]         = useState({})
  const [selectedVente, setSelectedVente]     = useState('')
  const [selectedRecette, setSelectedRecette] = useState('')

  const setLoad = (key, val) => setLoading((c) => ({ ...c, [key]: val }))
  const withLoad = (key, fn) => async () => {
    setLoad(key, true)
    try { await fn() } catch { toast.error('Erreur génération PDF') }
    finally { setLoad(key, false) }
  }

  const { data: ventes   = [] } = useQuery({ queryKey: ['ventes'],   queryFn: api.getVentes })
  const { data: recettes = [] } = useQuery({ queryKey: ['recettes'], queryFn: api.getRecettes })
  const { data: depenses = [] } = useQuery({ queryKey: ['depenses'], queryFn: api.getDepenses })
  const { data: produits = [] } = useQuery({ queryKey: ['produits'], queryFn: api.getProduits })

  const filteredVentes   = useMemo(() => filterByPeriod(ventes,   'date', period, customStart, customEnd), [ventes,   period, customStart, customEnd])
  const filteredRecettes = useMemo(() => filterByPeriod(recettes, 'date', period, customStart, customEnd), [recettes, period, customStart, customEnd])
  const filteredDepenses = useMemo(() => filterByPeriod(depenses, 'date', period, customStart, customEnd), [depenses, period, customStart, customEnd])

  const label = periodLabel(period, customStart, customEnd)

  const totalVentes   = filteredVentes.reduce((t, v) => t + (v.total || 0), 0)
  const totalRecettes = filteredRecettes.reduce((t, r) => t + (r.prixApplique || 0), 0)
  const totalDepenses = filteredDepenses.reduce((t, d) => t + (d.montant || 0), 0)
  const solde         = totalVentes + totalRecettes - totalDepenses

  const ventesValidees   = ventes.filter((v) => v.isValidated)
  const recettesValidees = recettes.filter((r) => r.isValidated)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-beige-900">Rapports</h1>
        <p className="text-beige-600 mt-1">Générez et téléchargez vos documents en PDF.</p>
      </div>

      {/* ── Reçus individuels ── */}
      <div className="bg-white rounded-xl border border-beige-200 p-6">
        <SectionTitle icon={FileText} label="Reçus individuels" color="bg-[#E91E8C]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-3">
            <p className="text-sm font-medium text-beige-800">Reçu d'achat — Vente</p>
            <select value={selectedVente} onChange={(e) => setSelectedVente(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-beige-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-300">
              <option value="">-- Sélectionner une vente --</option>
              {ventesValidees.map((v) => (
                <option key={v.id} value={v.id}>
                  VTE-{String(v.id).padStart(4, '0')} — {v.date} — {v.clientNom || 'Anonyme'} — {Number(v.total).toLocaleString('fr-FR')} FCFA
                </option>
              ))}
            </select>
            <button type="button" disabled={!selectedVente || loading.recuVente}
              onClick={withLoad('recuVente', async () => {
                const v = ventesValidees.find((x) => x.id === Number(selectedVente))
                if (v) await generateRecuVente(v)
              })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-beige-900 text-white text-sm rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {loading.recuVente ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Générer le reçu
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-beige-800">Reçu de prestation — Recette</p>
            <select value={selectedRecette} onChange={(e) => setSelectedRecette(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-beige-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-300">
              <option value="">-- Sélectionner une recette --</option>
              {recettesValidees.map((r) => (
                <option key={r.id} value={r.id}>
                  REC-{String(r.id).padStart(4, '0')} — {r.date} — {r.prestationNom} — {Number(r.prixApplique).toLocaleString('fr-FR')} FCFA
                </option>
              ))}
            </select>
            <button type="button" disabled={!selectedRecette || loading.recuRecette}
              onClick={withLoad('recuRecette', async () => {
                const r = recettesValidees.find((x) => x.id === Number(selectedRecette))
                if (r) await generateRecuRecette(r)
              })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-beige-900 text-white text-sm rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {loading.recuRecette ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Générer le reçu
            </button>
          </div>
        </div>
      </div>

      {/* ── Listes périodiques ── */}
      <div className="bg-white rounded-xl border border-beige-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <SectionTitle icon={TrendingUp} label="Listes périodiques" color="bg-[#7B1FA2]" />
          <PeriodSelector period={period} setPeriod={setPeriod}
            customStart={customStart} setCustomStart={setCustomStart}
            customEnd={customEnd} setCustomEnd={setCustomEnd} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ReportCard title="Ventes de produits" description={label}
            count={filteredVentes.length} total={totalVentes}
            onGenerate={withLoad('listeVentes', () => generateListeVentes(filteredVentes, label))}
            loading={loading.listeVentes} />
          <ReportCard title="Recettes / Prestations" description={label}
            count={filteredRecettes.length} total={totalRecettes}
            onGenerate={withLoad('listeRecettes', () => generateListeRecettes(filteredRecettes, label))}
            loading={loading.listeRecettes} />
          <ReportCard title="Dépenses" description={label}
            count={filteredDepenses.length} total={totalDepenses}
            onGenerate={withLoad('listeDepenses', () => generateListeDepenses(filteredDepenses, label))}
            loading={loading.listeDepenses} />
        </div>
      </div>

      {/* ── État de stock ── */}
      <div className="bg-white rounded-xl border border-beige-200 p-6">
        <SectionTitle icon={Package} label="État de stock" color="bg-amber-500" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-beige-500 text-xs">Produits actifs</p>
              <p className="font-bold text-beige-900 text-lg">{produits.filter((p) => p.actif).length}</p>
            </div>
            <div>
              <p className="text-beige-500 text-xs">Stock total</p>
              <p className="font-bold text-beige-900 text-lg">{produits.reduce((t, p) => t + p.stock, 0)}</p>
            </div>
            <div>
              <p className="text-beige-500 text-xs">Valeur totale</p>
              <p className="font-bold text-beige-900 text-lg">
                {produits.reduce((t, p) => t + p.stock * p.prix, 0).toLocaleString('fr-FR')} F
              </p>
            </div>
          </div>
          <button type="button" disabled={loading.etatStock || produits.length === 0}
            onClick={withLoad('etatStock', () => generateEtatStock(produits))}
            className="flex items-center gap-2 px-5 py-2.5 bg-beige-900 text-white text-sm rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
            {loading.etatStock ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Télécharger l'état de stock
          </button>
        </div>
      </div>

      {/* ── État de caisse ── */}
      <div className="bg-white rounded-xl border border-beige-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <SectionTitle icon={Wallet} label="État de caisse" color="bg-green-600" />
          <PeriodSelector period={period} setPeriod={setPeriod}
            customStart={customStart} setCustomStart={setCustomStart}
            customEnd={customEnd} setCustomEnd={setCustomEnd} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <SoldeCard label="Ventes"    value={totalVentes}   color="rose" />
          <SoldeCard label="Recettes"  value={totalRecettes} color="violet" />
          <SoldeCard label="Dépenses"  value={totalDepenses} color="red" negative />
          <SoldeCard label="Solde net" value={solde} color={solde >= 0 ? 'green' : 'red'} bold />
        </div>
        <button type="button" disabled={loading.etatCaisse}
          onClick={withLoad('etatCaisse', () => generateEtatCaisse(filteredVentes, filteredRecettes, filteredDepenses, label))}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-beige-900 text-white text-sm rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-40">
          {loading.etatCaisse ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Télécharger l'état de caisse — {label}
        </button>
      </div>
    </div>
  )
}

export default Reports

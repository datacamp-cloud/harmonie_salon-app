import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, Users, X } from 'lucide-react'
import { api } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import ConfirmModal from '../../components/ConfirmModal'

const ROLES = [
  { value: 'admin',    label: 'Administrateur', desc: 'Acces complet' },
  { value: 'caissier', label: 'Caissier',        desc: 'Saisie et consultation' },
  { value: 'viewer',   label: 'Lecteur',          desc: 'Consultation uniquement' },
]

const emptyForm = () => ({ name: '', pseudo: '', role: 'caissier', password: '' })

function UsersPage() {
  const { user: currentUser } = useAuth()
  const toast        = useToast()
  const queryClient  = useQueryClient()

  const [showForm,      setShowForm]      = useState(false)
  const [editModal,     setEditModal]     = useState(null)
  const [pwdModal,      setPwdModal]      = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [formData,      setFormData]      = useState(emptyForm())
  const [editData,      setEditData]      = useState({ name: '', pseudo: '', role: 'caissier' })
  const [newPassword,   setNewPassword]   = useState('')
  const [showPwd,       setShowPwd]       = useState(false)
  const [showNewPwd,    setShowNewPwd]    = useState(false)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] })

  const addMutation = useMutation({
    mutationFn: api.addUser,
    onSuccess: () => {
      invalidate()
      setShowForm(false)
      setFormData(emptyForm())
      toast.success('Utilisateur cree avec succes')
    },
    onError: (e) => toast.error(e.message || 'Erreur creation'),
  })

  const updateMutation = useMutation({
    mutationFn: api.updateUser,
    onSuccess: () => {
      invalidate()
      setEditModal(null)
      toast.success('Utilisateur modifie')
    },
    onError: (e) => toast.error(e.message || 'Erreur modification'),
  })

  const pwdMutation = useMutation({
    mutationFn: api.updateUserPassword,
    onSuccess: () => {
      setPwdModal(null)
      setNewPassword('')
      toast.success('Mot de passe mis a jour')
    },
    onError: (e) => toast.error(e.message || 'Erreur mot de passe'),
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      invalidate()
      setConfirmDelete(null)
      toast.success('Utilisateur supprime')
    },
    onError: (e) => toast.error(e.message || 'Erreur suppression'),
  })

  const roleLabel = (role) => ROLES.find((r) => r.value === role)?.label || role
  const roleBadge = (role) => {
    if (role === 'admin')    return 'bg-violet-100 text-violet-700'
    if (role === 'caissier') return 'bg-blue-100 text-blue-700'
    return 'bg-beige-100 text-beige-600'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900 flex items-center gap-2">
            <Users size={22} /> Utilisateurs
          </h1>
          <p className="text-beige-600 mt-1 text-sm">Gerez les comptes qui ont acces a WebStock.</p>
        </div>
        <button type="button" onClick={() => { setShowForm(true); setFormData(emptyForm()) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-beige-900 text-white text-sm rounded-lg hover:bg-beige-800 transition-colors">
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-beige-400" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-beige-200 divide-y divide-beige-100">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-beige-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-beige-700">
                    {u.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-beige-900 text-sm">{u.name}</p>
                  <p className="text-xs text-beige-500">@{u.pseudo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge(u.role)}`}>
                  {roleLabel(u.role)}
                </span>
                <button type="button" onClick={() => { setEditModal(u); setEditData({ name: u.name, pseudo: u.pseudo, role: u.role }) }}
                  className="p-1.5 rounded-lg border border-beige-200 text-beige-600 hover:bg-beige-50 transition-colors">
                  <Pencil size={14} />
                </button>
                <button type="button" onClick={() => setPwdModal(u)}
                  className="px-2.5 py-1.5 rounded-lg border border-beige-200 text-beige-600 hover:bg-beige-50 transition-colors text-xs">
                  Mot de passe
                </button>
                {u.id !== currentUser?.id && (
                  <button type="button" onClick={() => setConfirmDelete(u.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal ajout */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-beige-900">Nouvel utilisateur</h2>
              <button type="button" onClick={() => setShowForm(false)}
                className="p-2 text-beige-400 hover:text-beige-700 hover:bg-beige-50 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(formData) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1.5">Nom complet</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData((c) => ({ ...c, name: e.target.value }))}
                  required placeholder="Ex: Marie Dupont"
                  className="w-full px-4 py-2.5 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1.5">Identifiant (pseudo)</label>
                <input type="text" value={formData.pseudo} onChange={(e) => setFormData((c) => ({ ...c, pseudo: e.target.value.toLowerCase().replace(/\s/g, '') }))}
                  required placeholder="Ex: marie.dupont"
                  className="w-full px-4 py-2.5 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1.5">Role</label>
                <div className="space-y-2">
                  {ROLES.map((r) => (
                    <label key={r.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.role === r.value ? 'border-beige-500 bg-beige-50' : 'border-beige-200 hover:bg-beige-50'}`}>
                      <input type="radio" name="role" value={r.value} checked={formData.role === r.value}
                        onChange={(e) => setFormData((c) => ({ ...c, role: e.target.value }))} className="accent-beige-700" />
                      <div>
                        <p className="text-sm font-medium text-beige-900">{r.label}</p>
                        <p className="text-xs text-beige-500">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={formData.password}
                    onChange={(e) => setFormData((c) => ({ ...c, password: e.target.value }))}
                    required minLength={8} placeholder="8 caracteres minimum"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none text-sm" />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-beige-400 hover:text-beige-700">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={addMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {addMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Creer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal modification */}
      {editModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-beige-900">Modifier l utilisateur</h2>
              <button type="button" onClick={() => setEditModal(null)}
                className="p-2 text-beige-400 hover:text-beige-700 hover:bg-beige-50 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editModal.id, ...editData }) }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1.5">Nom complet</label>
                <input type="text" value={editData.name} onChange={(e) => setEditData((c) => ({ ...c, name: e.target.value }))}
                  required className="w-full px-4 py-2.5 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1.5">Identifiant (pseudo)</label>
                <input type="text" value={editData.pseudo} onChange={(e) => setEditData((c) => ({ ...c, pseudo: e.target.value.toLowerCase().replace(/\s/g, '') }))}
                  required className="w-full px-4 py-2.5 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-1.5">Role</label>
                <div className="space-y-2">
                  {ROLES.map((r) => (
                    <label key={r.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${editData.role === r.value ? 'border-beige-500 bg-beige-50' : 'border-beige-200 hover:bg-beige-50'}`}>
                      <input type="radio" name="editRole" value={r.value} checked={editData.role === r.value}
                        onChange={(e) => setEditData((c) => ({ ...c, role: e.target.value }))} className="accent-beige-700" />
                      <div>
                        <p className="text-sm font-medium text-beige-900">{r.label}</p>
                        <p className="text-xs text-beige-500">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)}
                  className="flex-1 px-4 py-2.5 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal mot de passe */}
      {pwdModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-beige-900">Changer le mot de passe</h2>
              <button type="button" onClick={() => { setPwdModal(null); setNewPassword('') }}
                className="p-2 text-beige-400 hover:text-beige-700 hover:bg-beige-50 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-beige-600 mb-4">
              Nouveau mot de passe pour <strong>{pwdModal.name}</strong>
            </p>
            <form onSubmit={(e) => { e.preventDefault(); pwdMutation.mutate({ id: pwdModal.id, password: newPassword }) }} className="space-y-4">
              <div className="relative">
                <input type={showNewPwd ? 'text' : 'password'} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required minLength={8} placeholder="8 caracteres minimum"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none text-sm" />
                <button type="button" onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-beige-400 hover:text-beige-700">
                  {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setPwdModal(null); setNewPassword('') }}
                  className="flex-1 px-4 py-2.5 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={pwdMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {pwdMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => deleteMutation.mutate(confirmDelete)}
        isPending={deleteMutation.isPending}
        title="Supprimer cet utilisateur ?"
        message="L utilisateur perdra tout acces a WebStock. Cette action est irreversible."
      />
    </div>
  )
}

export default UsersPage

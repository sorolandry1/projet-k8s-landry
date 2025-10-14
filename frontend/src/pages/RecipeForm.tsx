import React from 'react'
import { useNavigate } from 'react-router-dom'
import { apiAuth } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function RecipeForm(){
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [content, setContent] = React.useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await apiAuth(user?.token).post('/recipes', { title, description, content })
    navigate(`/recipes/${res.data.id}`)
  }

  return (
    <form onSubmit={submit} className="card space-y-3 max-w-2xl">
      <h1 className="text-xl font-semibold">Nouvelle recette</h1>
      <label className="label">Titre</label>
      <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
      <label className="label">Description</label>
      <input className="input" value={description} onChange={e=>setDescription(e.target.value)} />
      <label className="label">Contenu</label>
      <textarea className="input min-h-[160px]" value={content} onChange={e=>setContent(e.target.value)} required />
      <button className="btn btn-primary">Créer</button>
    </form>
  )
}

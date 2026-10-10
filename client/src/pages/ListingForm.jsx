import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  title: '',
  price: 0,
  category: 'other',
  condition: 'used',
  status: 'active',
  description: ''
}

const categories = [
  ['textbooks', 'Textbooks'],
  ['electronics', 'Electronics'],
  ['furniture', 'Furniture'],
  ['clothing', 'Clothing'],
  ['other', 'Other']
]

const conditions = [
  ['new', 'New'],
  ['like-new', 'Like new'],
  ['used', 'Used'],
  ['worn', 'Worn']
]

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(id))

  useEffect(() => {
    if (!id) {
      setForm(defaults)
      setError('')
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadListing() {
      setError('')
      setIsLoading(true)
      try {
        const res = await api.get(`/listings/${id}`)
        const listing = res.data.listing
        if (!cancelled) {
          setForm({
            title: listing.title,
            price: Number(listing.price),
            category: listing.category,
            condition: listing.condition,
            status: listing.status,
            description: listing.description || ''
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Could not load listing')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadListing()
    return () => { cancelled = true }
  }, [id])

  function onChange(e) {
    const { name, value, type } = e.target
    setForm(current => ({
      ...current,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch(`/listings/${id}`, form)
      } else {
        await api.post('/listings', form)
      }
      nav('/listings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save listing')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="title"
          type="text"
          placeholder="Title"
          aria-label="Title"
          value={form.title}
          onChange={onChange}
          required
        />
        <input
          className="input"
          name="price"
          type="number"
          min="0"
          step="any"
          placeholder="Price"
          aria-label="Price"
          value={form.price}
          onChange={onChange}
          required
        />
        <select className="input" name="category" aria-label="Category" value={form.category} onChange={onChange}>
          {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="input" name="condition" aria-label="Condition" value={form.condition} onChange={onChange}>
          {conditions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {id && (
          <select className="input" name="status" aria-label="Status" value={form.status} onChange={onChange}>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
          </select>
        )}
        <textarea
          className="input min-h-24"
          name="description"
          placeholder="Description (optional)"
          aria-label="Description (optional)"
          value={form.description}
          onChange={onChange}
        />
        {isLoading && <div className="text-sm text-zinc-600">Loading listing…</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit" disabled={isLoading}>Save</button>
      </form>
    </div>
  )
}

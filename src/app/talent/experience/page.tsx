'use client'

import { api } from '@/trpc/react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RoleFormData {
  id?: string
  company_name: string
  title: string
  start_date: string
  end_date: string
  description: string
  is_current: boolean
}

const emptyForm: RoleFormData = {
  company_name: '',
  title: '',
  start_date: '',
  end_date: '',
  description: '',
  is_current: false,
}

export default function TalentExperiencePage() {
  const { data: pastRoles, refetch } = api.talent.getMyPastRoles.useQuery()

  const addRole = api.talent.addPastRole.useMutation({
    onSuccess: () => {
      refetch()
      setFormData(emptyForm)
      setIsAdding(false)
      setSuccessMessage('Role added successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to add role')
      setTimeout(() => setErrorMessage(''), 3000)
    },
  })

  const updateRole = api.talent.updatePastRole.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      setSuccessMessage('Role updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to update role')
      setTimeout(() => setErrorMessage(''), 3000)
    },
  })

  const deleteRole = api.talent.deletePastRole.useMutation({
    onSuccess: () => {
      refetch()
      setSuccessMessage('Role deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to delete role')
      setTimeout(() => setErrorMessage(''), 3000)
    },
  })

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<RoleFormData>(emptyForm)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleStartAdd = () => {
    setFormData(emptyForm)
    setIsAdding(true)
    setEditingId(null)
  }

  const handleStartEdit = (role: any) => {
    setFormData({
      id: role.id,
      company_name: role.company_name,
      title: role.title,
      start_date: role.start_date,
      end_date: role.end_date || '',
      description: role.description || '',
      is_current: !role.end_date,
    })
    setEditingId(role.id)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setFormData(emptyForm)
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      company_name: formData.company_name,
      title: formData.title,
      start_date: formData.start_date,
      end_date: formData.is_current ? null : formData.end_date || null,
      description: formData.description || undefined,
    }

    if (editingId) {
      updateRole.mutate({
        id: editingId,
        ...submitData,
      })
    } else {
      addRole.mutate(submitData)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      deleteRole.mutate({ id })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Experience</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add your past roles and experience to showcase your background
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleStartAdd}>Add Role</Button>
        )}
      </div>

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-4 py-3 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Role' : 'Add New Role'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <Input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Title *</label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Senior Software Engineer"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date {formData.is_current && '(Current Role)'}
                </label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={formData.is_current}
                  required={!formData.is_current}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_current"
                checked={formData.is_current}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_current: e.target.checked,
                    end_date: e.target.checked ? '' : formData.end_date,
                  })
                }
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
              />
              <label htmlFor="is_current" className="ml-2 text-sm">
                I currently work here
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Describe your role, responsibilities, and achievements..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={addRole.isPending || updateRole.isPending}
              >
                {addRole.isPending || updateRole.isPending
                  ? 'Saving...'
                  : editingId
                  ? 'Update Role'
                  : 'Add Role'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={addRole.isPending || updateRole.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Roles List */}
      <div className="space-y-4">
        {pastRoles && pastRoles.length > 0 ? (
          pastRoles.map((role: any) => (
            <Card key={role.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">{role.title}</h3>
                    {!role.end_date && (
                      <Badge variant="success" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                    {role.company_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {formatDate(role.start_date)} -{' '}
                    {role.end_date ? formatDate(role.end_date) : 'Present'}
                  </p>
                  {role.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {role.description}
                    </p>
                  )}
                </div>
                {!editingId && !isAdding && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(role)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(role.id)}
                      disabled={deleteRole.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No work experience added yet
            </p>
            {!isAdding && (
              <Button onClick={handleStartAdd}>Add Your First Role</Button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

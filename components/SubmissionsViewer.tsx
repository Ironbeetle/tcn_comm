"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  MessageSquare, 
  Trash2,
  Loader2,
  Users,
  Search,
  FileText
} from "lucide-react"
import { toast } from "sonner"

interface Field {
  id: string
  label: string
  fieldType: string
  order: number
}

interface Submission {
  id: string
  name: string
  email: string | null
  phone: string | null
  memberId: number | null
  responses: Record<string, any>
  submittedAt: string
}

interface FormData {
  id: string
  title: string
  fields: Field[]
}

interface SubmissionsViewerProps {
  formId: string
  onBack: () => void
}

export default function SubmissionsViewer({ formId, onBack }: SubmissionsViewerProps) {
  const [form, setForm] = useState<FormData | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set())

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}/submissions`)
      const data = await response.json()
      
      if (data.success) {
        setForm(data.form)
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to load submissions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [formId])

  const deleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return
    }

    try {
      const response = await fetch(`/api/forms/${formId}/submissions?submissionId=${submissionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Submission deleted')
        setSubmissions(submissions.filter(s => s.id !== submissionId))
        setSelectedSubmissions(prev => {
          const next = new Set(prev)
          next.delete(submissionId)
          return next
        })
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete submission')
    }
  }

  const exportCSV = () => {
    if (!form || submissions.length === 0) return

    // Build headers
    const headers = ['Name', 'Email', 'Phone', 'Member ID', ...form.fields.map(f => f.label), 'Submitted At']
    
    // Build rows
    const rows = filteredSubmissions.map(sub => [
      sub.name,
      sub.email || '',
      sub.phone || '',
      sub.memberId?.toString() || '',
      ...form.fields.map(f => {
        const value = sub.responses[f.id]
        if (Array.isArray(value)) return value.join('; ')
        return value?.toString() || ''
      }),
      new Date(sub.submittedAt).toLocaleString()
    ])

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title.replace(/\s+/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('CSV exported')
  }

  const getSelectedContacts = () => {
    return submissions
      .filter(s => selectedSubmissions.has(s.id))
      .map(s => ({ name: s.name, email: s.email, phone: s.phone }))
  }

  const sendEmailToSelected = () => {
    const contacts = getSelectedContacts().filter(c => c.email)
    if (contacts.length === 0) {
      toast.error('No email addresses in selected submissions')
      return
    }
    // TODO: Navigate to email composer with pre-filled recipients
    toast.info(`Would send email to ${contacts.length} recipients`)
  }

  const sendSmsToSelected = () => {
    const contacts = getSelectedContacts().filter(c => c.phone)
    if (contacts.length === 0) {
      toast.error('No phone numbers in selected submissions')
      return
    }
    // TODO: Navigate to SMS composer with pre-filled recipients
    toast.info(`Would send SMS to ${contacts.length} recipients`)
  }

  const toggleSelectAll = () => {
    if (selectedSubmissions.size === filteredSubmissions.length) {
      setSelectedSubmissions(new Set())
    } else {
      setSelectedSubmissions(new Set(filteredSubmissions.map(s => s.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedSubmissions(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredSubmissions = submissions.filter(sub => {
    const term = searchTerm.toLowerCase()
    return (
      sub.name.toLowerCase().includes(term) ||
      sub.email?.toLowerCase().includes(term) ||
      sub.phone?.includes(term)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12 text-stone-500">
        <FileText className="h-16 w-16 mx-auto mb-4 text-stone-300" />
        <p>Form not found</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="text-amber-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h3 className="text-xl font-bold text-amber-900">{form.title}</h3>
            <p className="text-sm text-stone-500">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            disabled={submissions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Actions Bar */}
      {selectedSubmissions.size > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <Badge className="bg-amber-700">{selectedSubmissions.size} selected</Badge>
          <Button variant="outline" size="sm" onClick={sendEmailToSelected}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" size="sm" onClick={sendSmsToSelected}>
            <MessageSquare className="h-4 w-4 mr-2" />
            SMS
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {submissions.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          <Users className="h-16 w-16 mx-auto mb-4 text-stone-300" />
          <p className="text-lg font-medium">No submissions yet</p>
          <p className="text-sm">Submissions will appear here when community members respond</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.size === filteredSubmissions.length && filteredSubmissions.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-stone-300"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  {form.fields.slice(0, 3).map(field => (
                    <TableHead key={field.id}>{field.label}</TableHead>
                  ))}
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.has(submission.id)}
                        onChange={() => toggleSelect(submission.id)}
                        className="rounded border-stone-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>{submission.email || '-'}</TableCell>
                    <TableCell>{submission.phone || '-'}</TableCell>
                    {form.fields.slice(0, 3).map(field => (
                      <TableCell key={field.id} className="max-w-[150px] truncate">
                        {(() => {
                          const value = submission.responses[field.id]
                          if (Array.isArray(value)) return value.join(', ')
                          if (typeof value === 'boolean') return value ? 'Yes' : 'No'
                          return value?.toString() || '-'
                        })()}
                      </TableCell>
                    ))}
                    <TableCell className="text-sm text-stone-500">
                      {formatDate(submission.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSubmission(submission.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

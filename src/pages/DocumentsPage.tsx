import React, { useState } from 'react';
import {
  Plus,
  Search,
  AlertTriangle,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { DocumentStatus, DocumentRecord } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { getCurrentManilaDateString } from '@/lib/dates';

export const DocumentsPage: React.FC = () => {
  const { documents, addDocument, updateDocument, deleteDocument } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Form states
  const [docType, setDocType] = useState('Letter of Endorsement');
  const [type, setType] = useState('Incoming');
  const [transmission, setTransmission] = useState('DMS / Hand Carried');
  const [fileDetail, setFileDetail] = useState('');
  const [description, setDescription] = useState('');
  const [senderSource, setSenderSource] = useState('Davao del Sur IMO');
  const [project, setProject] = useState('Digos River Irrigation System');
  const [typeOfStudy, setTypeOfStudy] = useState('Detailed Engineering Design');
  const [dateReceived, setDateReceived] = useState(getCurrentManilaDateString());
  const [actionTaken, setActionTaken] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('Pending');
  const [remarks, setRemarks] = useState('');

  const resetForm = () => {
    setDocType('Letter of Endorsement');
    setType('Incoming');
    setTransmission('DMS / Hand Carried');
    setFileDetail('');
    setDescription('');
    setSenderSource('Davao del Sur IMO');
    setProject('Digos River Irrigation System');
    setTypeOfStudy('Detailed Engineering Design');
    setDateReceived(getCurrentManilaDateString());
    setActionTaken('');
    setStatus('Pending');
    setRemarks('');
    setEditingDocId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (doc: DocumentRecord) => {
    setEditingDocId(doc.id);
    setDocType(doc.documentType);
    setType(doc.type);
    setTransmission(doc.meansOfTransmission);
    setFileDetail(doc.fileDetail);
    setDescription(doc.description);
    setSenderSource(doc.senderSource);
    setProject(doc.project || '');
    setTypeOfStudy(doc.typeOfStudy || '');
    setDateReceived(doc.dateReceived);
    setActionTaken(doc.actionTaken);
    setStatus(doc.status);
    setRemarks(doc.remarks || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !actionTaken.trim()) {
      alert('Please fill in Description and Action Taken.');
      return;
    }

    if (editingDocId) {
      const existing = documents.find((d) => d.id === editingDocId);
      if (existing) {
        updateDocument({
          ...existing,
          documentType: docType,
          type,
          meansOfTransmission: transmission,
          fileDetail: fileDetail || existing.fileDetail,
          description,
          senderSource,
          project,
          typeOfStudy,
          dateReceived,
          actionTaken,
          status,
          remarks,
        });
      }
    } else {
      addDocument({
        documentType: docType,
        type,
        meansOfTransmission: transmission,
        fileDetail: fileDetail || `DOC-2026-${Date.now().toString().slice(-4)}`,
        description,
        senderSource,
        project,
        typeOfStudy,
        dateReceived,
        dateReceivedByUser: dateReceived,
        actionTaken,
        status,
        remarks,
      });
    }

    resetForm();
  };

  const activeDocs = documents.filter((d) => !d.isDeleted);
  const filteredDocs = activeDocs.filter((doc) => {
    const matchesSearch =
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.senderSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileDetail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.project && doc.project.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Document Monitoring (DOC LOG SHEET)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Digital correspondence and document processing ledger • Planning and Design Section, NIA RO-XI
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              if (isFormOpen) {
                resetForm();
              } else {
                setIsFormOpen(true);
              }
            }}
          >
            {isFormOpen ? 'Close Form' : 'Log Document'}
          </Button>
        </div>
      </div>

      {/* Critical Government Rule Alert */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Government Reporting Rule:</strong> Receiving or processing a document does not automatically count as a completed IPCR accomplishment. Deliverables require validated completion of the substantive engineering task and supporting evidence before inclusion in accomplishment totals.
        </div>
      </div>

      {/* Entry Form */}
      {isFormOpen && (
        <Card padding="md" className="border-2 border-nia-200 bg-nia-50/20 shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingDocId ? 'Edit Document Entry' : 'Log New Document Record'}
              </h3>
              <Badge variant="blue">DOC LOG SHEET Entry</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Type *
                </label>
                <input
                  type="text"
                  required
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  placeholder="e.g. Special Order, Memorandum, POW..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type / Flow *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white"
                >
                  <option value="Incoming">Incoming</option>
                  <option value="Outgoing">Outgoing</option>
                  <option value="Internal">Internal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Means of Transmission
                </label>
                <input
                  type="text"
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  placeholder="e.g. DMS / Hand Carried, Official Email..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sender / Source Office *
                </label>
                <input
                  type="text"
                  required
                  value={senderSource}
                  onChange={(e) => setSenderSource(e.target.value)}
                  placeholder="e.g. Davao del Norte IMO, Regional Manager..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Related Project
                </label>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="e.g. Padada River Dam, Digos RIS..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="On-going">On-going</option>
                  <option value="Finished">Finished</option>
                  <option value="For Follow-up">For Follow-up</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Description / Subject *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed subject of document..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Action Taken *
                </label>
                <textarea
                  rows={2}
                  required
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="Action taken or technical review performed..."
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingDocId ? 'Update Record' : 'Save Document'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by description, sender, file detail, project, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-nia-500 focus:ring-nia-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-3 bg-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="On-going">On-going</option>
            <option value="Finished">Finished</option>
            <option value="For Follow-up">For Follow-up</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Official DOC LOG SHEET Table */}
      <Card padding="none" className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr>
              <th className="table-th">Document / File Detail</th>
              <th className="table-th">Type & Means</th>
              <th className="table-th">Sender / Project</th>
              <th className="table-th">Dates</th>
              <th className="table-th">Action Taken</th>
              <th className="table-th">Status</th>
              <th className="table-th text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs text-slate-400">
                  No documents found matching criteria.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Description & File Detail */}
                  <td className="table-td max-w-xs">
                    <div className="font-semibold text-xs text-slate-900">{doc.documentType}</div>
                    <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{doc.description}</div>
                    <div className="font-mono text-[10px] text-slate-400 mt-1">Ref: {doc.fileDetail}</div>
                  </td>

                  {/* Type & Transmission */}
                  <td className="table-td whitespace-nowrap">
                    <span className="text-xs font-medium text-slate-700">{doc.type}</span>
                    <div className="text-[11px] text-slate-400">{doc.meansOfTransmission}</div>
                  </td>

                  {/* Sender & Project */}
                  <td className="table-td">
                    <div className="text-xs font-medium text-slate-800">{doc.senderSource}</div>
                    <div className="text-[11px] text-nia-700 font-medium truncate max-w-[180px]">{doc.project}</div>
                    <div className="text-[10px] text-slate-400">{doc.typeOfStudy}</div>
                  </td>

                  {/* Dates */}
                  <td className="table-td whitespace-nowrap text-xs">
                    <div className="text-slate-700">Rec: {doc.dateReceived}</div>
                    <div className="text-[11px] text-slate-400">
                      Proc: {doc.dateProcessed || '—'}
                    </div>
                  </td>

                  {/* Action Taken & Remarks */}
                  <td className="table-td max-w-xs">
                    <div className="text-xs text-slate-800">{doc.actionTaken}</div>
                    {doc.remarks && (
                      <div className="text-[10px] text-slate-400 italic mt-0.5">Remarks: {doc.remarks}</div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="table-td whitespace-nowrap">
                    <Badge
                      variant={
                        doc.status === 'Finished'
                          ? 'emerald'
                          : doc.status === 'On-going'
                          ? 'blue'
                          : doc.status === 'Pending'
                          ? 'amber'
                          : 'rose'
                      }
                      size="sm"
                      dot
                    >
                      {doc.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="table-td text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                        title="Edit document"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this document entry?')) {
                            deleteDocument(doc.id);
                          }
                        }}
                        className="p-1 text-rose-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

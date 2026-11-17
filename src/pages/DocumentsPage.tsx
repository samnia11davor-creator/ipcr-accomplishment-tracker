import React, { useState } from 'react';
import {
  Plus,
  Search,
  AlertTriangle,
  Trash2,
  Edit2,
  FolderGit2,
  Building2,
  FileText,
  PlusCircle,
  Paperclip,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { DocumentStatus, DocumentRecord, TaskAttachment } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { getCurrentManilaDateString } from '@/lib/dates';
import {
  SHEET2_DOC_TYPES,
  SHEET2_PROJECTS,
  SHEET2_OFFICE_SOURCES,
  SHEET2_STUDY_TYPES,
} from '@/data/sheet2MasterData';
import { AttachmentDropzone } from '@/components/common/AttachmentDropzone';
import { AttachmentViewerModal } from '@/components/common/AttachmentViewerModal';
import { StorageMonitorPill } from '@/components/common/StorageMonitorPill';

export const DocumentsPage: React.FC = () => {
  const { documents, addDocument, updateDocument, deleteDocument } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Dynamic Projects List (Initialized from Sheet2 of SAM DAILY LOG SHEET.xlsx + custom added)
  const [projectList, setProjectList] = useState<string[]>(() => {
    const saved = localStorage.getItem('ipcr_custom_projects');
    const custom = saved ? JSON.parse(saved) : [];
    return Array.from(new Set([...SHEET2_PROJECTS, ...custom])).sort();
  });

  // Dynamic Doc Types List (Initialized from Sheet2 of SAM DAILY LOG SHEET.xlsx + custom added)
  const [docTypeList, setDocTypeList] = useState<string[]>(() => {
    const saved = localStorage.getItem('ipcr_custom_doctypes');
    const custom = saved ? JSON.parse(saved) : [];
    return Array.from(new Set([...SHEET2_DOC_TYPES, ...custom]));
  });

  // Form states
  const [selectedDocType, setSelectedDocType] = useState('REPORT');
  const [isCustomDocType, setIsCustomDocType] = useState(false);
  const [customDocTypeInput, setCustomDocTypeInput] = useState('');

  const [type, setType] = useState('Incoming');
  const [transmission, setTransmission] = useState('DMS / Hand Carried');
  const [fileDetail, setFileDetail] = useState('');
  const [description, setDescription] = useState('');

  // Office / Sender Origin
  const [senderSource, setSenderSource] = useState('Central Office');
  const [outsideSender, setOutsideSender] = useState('');

  // Related Project
  const [selectedProject, setSelectedProject] = useState('Suawan SRIP');
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [customProjectInput, setCustomProjectInput] = useState('');

  const [typeOfStudy, setTypeOfStudy] = useState('DED');
  const [dateReceived, setDateReceived] = useState(getCurrentManilaDateString());
  const [actionTaken, setActionTaken] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('Pending');
  const [remarks, setRemarks] = useState('');

  // Attachments state
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [viewingAttachment, setViewingAttachment] = useState<TaskAttachment | null>(null);

  const resetForm = () => {
    setSelectedDocType('REPORT');
    setIsCustomDocType(false);
    setCustomDocTypeInput('');
    setType('Incoming');
    setTransmission('DMS / Hand Carried');
    setFileDetail('');
    setDescription('');
    setSenderSource('Central Office');
    setOutsideSender('');
    setSelectedProject(projectList[0] || 'Suawan SRIP');
    setIsCustomProject(false);
    setCustomProjectInput('');
    setTypeOfStudy('DED');
    setDateReceived(getCurrentManilaDateString());
    setActionTaken('');
    setStatus('Pending');
    setRemarks('');
    setAttachments([]);
    setEditingDocId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (doc: DocumentRecord) => {
    setEditingDocId(doc.id);
    if (docTypeList.includes(doc.documentType)) {
      setSelectedDocType(doc.documentType);
      setIsCustomDocType(false);
    } else {
      setSelectedDocType('__ADD_NEW__');
      setIsCustomDocType(true);
      setCustomDocTypeInput(doc.documentType);
    }
    setType(doc.type);
    setTransmission(doc.meansOfTransmission);
    setFileDetail(doc.fileDetail);
    setDescription(doc.description);

    if (doc.senderSource.includes('Others') || doc.senderSource.includes('Outside')) {
      setSenderSource('Others (Outside)');
      const match = doc.senderSource.match(/\((.+)\)/);
      setOutsideSender(match ? match[1] : doc.senderSource.replace('Others (Outside) - ', ''));
    } else {
      setSenderSource(doc.senderSource);
      setOutsideSender('');
    }

    if (doc.project) {
      if (projectList.includes(doc.project)) {
        setSelectedProject(doc.project);
        setIsCustomProject(false);
      } else {
        setSelectedProject('__ADD_NEW__');
        setIsCustomProject(true);
        setCustomProjectInput(doc.project);
      }
    } else {
      setSelectedProject(projectList[0] || 'Suawan SRIP');
      setIsCustomProject(false);
    }

    setTypeOfStudy(doc.typeOfStudy || 'DED');
    setDateReceived(doc.dateReceived);
    setActionTaken(doc.actionTaken);
    setStatus(doc.status);
    setRemarks(doc.remarks || '');
    setAttachments(doc.attachments || []);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !actionTaken.trim()) {
      alert('Please fill in Description and Action Taken.');
      return;
    }

    // Resolve Project
    let finalProject = selectedProject;
    if (isCustomProject) {
      finalProject = customProjectInput.trim();
      if (!finalProject) {
        alert('Please specify the new project name.');
        return;
      }
      if (!projectList.includes(finalProject)) {
        const updated = [...projectList, finalProject].sort();
        setProjectList(updated);
        try {
          const saved = localStorage.getItem('ipcr_custom_projects');
          const custom = saved ? JSON.parse(saved) : [];
          if (!custom.includes(finalProject)) {
            localStorage.setItem('ipcr_custom_projects', JSON.stringify([...custom, finalProject]));
          }
        } catch {
          // ignore
        }
      }
    }

    // Resolve Doc Type
    let finalDocType = selectedDocType;
    if (isCustomDocType) {
      finalDocType = customDocTypeInput.trim();
      if (!finalDocType) {
        alert('Please specify the custom document type.');
        return;
      }
      if (!docTypeList.includes(finalDocType)) {
        const updated = [...docTypeList, finalDocType];
        setDocTypeList(updated);
        try {
          const saved = localStorage.getItem('ipcr_custom_doctypes');
          const custom = saved ? JSON.parse(saved) : [];
          if (!custom.includes(finalDocType)) {
            localStorage.setItem('ipcr_custom_doctypes', JSON.stringify([...custom, finalDocType]));
          }
        } catch {
          // ignore
        }
      }
    }

    // Resolve Sender Source
    const resolvedSender =
      senderSource === 'Others (Outside)' && outsideSender.trim()
        ? `Others (Outside) - ${outsideSender.trim()}`
        : senderSource;

    if (editingDocId) {
      const existing = documents.find((d) => d.id === editingDocId);
      if (existing) {
        updateDocument({
          ...existing,
          documentType: finalDocType,
          type,
          meansOfTransmission: transmission,
          fileDetail: fileDetail || existing.fileDetail,
          description,
          senderSource: resolvedSender,
          project: finalProject,
          typeOfStudy,
          dateReceived,
          actionTaken,
          status,
          remarks,
          attachments,
        });
      }
    } else {
      addDocument({
        documentType: finalDocType,
        type,
        meansOfTransmission: transmission,
        fileDetail: fileDetail || `DOC-2026-${Date.now().toString().slice(-4)}`,
        description,
        senderSource: resolvedSender,
        project: finalProject,
        typeOfStudy,
        dateReceived,
        dateReceivedByUser: dateReceived,
        actionTaken,
        status,
        remarks,
        attachments,
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

        <div className="flex items-center gap-2.5 flex-wrap">
          <StorageMonitorPill variant="compact" />
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
              {/* Document Type (Sheet2 Dropdown + Add Option) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-nia-600" />
                    Document Type *
                  </span>
                  <span className="text-[10px] text-nia-700 font-medium">Sheet2 Types</span>
                </label>
                <select
                  value={isCustomDocType ? '__ADD_NEW__' : selectedDocType}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsCustomDocType(true);
                    } else {
                      setIsCustomDocType(false);
                      setSelectedDocType(e.target.value);
                    }
                  }}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white font-medium text-slate-800"
                >
                  <optgroup label="Official Sheet2 Document Types">
                    {docTypeList.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </optgroup>
                  <option value="__ADD_NEW__" className="text-nia-700 font-bold">
                    + Add Custom Doc Type...
                  </option>
                </select>
              </div>

              {/* Type / Flow */}
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

              {/* Means of Transmission */}
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

              {/* Custom Doc Type Input */}
              {isCustomDocType && (
                <div className="md:col-span-3 bg-blue-50/80 p-3 rounded-lg border border-blue-200 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <input
                    type="text"
                    required
                    value={customDocTypeInput}
                    onChange={(e) => setCustomDocTypeInput(e.target.value)}
                    placeholder="Enter custom document type..."
                    className="w-full text-xs rounded-lg border border-blue-300 bg-white px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomDocType(false);
                      setSelectedDocType(docTypeList[0] || 'REPORT');
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Sender / Source Office */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-nia-600" />
                  Sender / Source Office *
                </label>
                <select
                  value={senderSource}
                  onChange={(e) => setSenderSource(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white font-medium text-slate-800"
                >
                  {SHEET2_OFFICE_SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Project (Sheet2 Dropdown + Add Option) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-nia-600" />
                    Related Project
                  </span>
                  <span className="text-[10px] text-nia-700 font-medium">Sheet2 Catalog</span>
                </label>
                <select
                  value={isCustomProject ? '__ADD_NEW__' : selectedProject}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setIsCustomProject(true);
                    } else {
                      setIsCustomProject(false);
                      setSelectedProject(e.target.value);
                    }
                  }}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white font-medium text-slate-800"
                >
                  <optgroup label="Official Region XI Projects">
                    {projectList.map((proj) => (
                      <option key={proj} value={proj}>
                        {proj}
                      </option>
                    ))}
                  </optgroup>
                  <option value="__ADD_NEW__" className="text-nia-700 font-bold">
                    + Add New Project (Not in list)...
                  </option>
                </select>
              </div>

              {/* Type of Study */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type of Study
                </label>
                <select
                  value={typeOfStudy}
                  onChange={(e) => setTypeOfStudy(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white font-medium"
                >
                  {SHEET2_STUDY_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Project Input */}
              {isCustomProject && (
                <div className="md:col-span-3 bg-amber-50/80 p-3 rounded-lg border border-amber-200 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <input
                    type="text"
                    required
                    value={customProjectInput}
                    onChange={(e) => setCustomProjectInput(e.target.value)}
                    placeholder="Enter new project name to add to dropdown..."
                    className="w-full text-xs rounded-lg border border-amber-300 bg-white px-3 py-1.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomProject(false);
                      setSelectedProject(projectList[0] || 'Suawan SRIP');
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Outside Entity Input */}
              {senderSource === 'Others (Outside)' && (
                <div className="md:col-span-3 bg-purple-50/80 p-3 rounded-lg border border-purple-200">
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    Specify Outside Agency / Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={outsideSender}
                    onChange={(e) => setOutsideSender(e.target.value)}
                    placeholder="e.g. Provincial Agriculture Office, Consultant, Contractor..."
                    className="w-full text-xs rounded-lg border border-purple-300 bg-white px-3 py-1.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Date Received */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date Received *
                </label>
                <input
                  type="date"
                  required
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white"
                />
              </div>

              {/* Status */}
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

              {/* File Detail / Reference Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File Detail / Tracking No.
                </label>
                <input
                  type="text"
                  value={fileDetail}
                  onChange={(e) => setFileDetail(e.target.value)}
                  placeholder="Leave empty for auto-generated code"
                  className="w-full text-xs rounded-lg border border-slate-300 focus:border-nia-500 focus:ring-nia-500 px-3 py-2 bg-white"
                />
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

              {/* Scanned Copy / Attachment */}
              <div className="md:col-span-3 bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Scanned Copy / Supporting Attachment (PDF, Photo, Word, Excel)
                </label>
                <AttachmentDropzone
                  attachments={attachments}
                  onChange={setAttachments}
                  maxFiles={4}
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
              <th className="table-th text-center">Files</th>
              <th className="table-th">Status</th>
              <th className="table-th text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-xs text-slate-400">
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

                  {/* Files / Attachments */}
                  <td className="table-td text-center">
                    {doc.attachments && doc.attachments.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setViewingAttachment(doc.attachments![0])}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold hover:bg-purple-100 transition-colors shadow-xs"
                        title={`${doc.attachments.length} attachment(s) • Click to view`}
                      >
                        <Paperclip className="w-3 h-3 text-purple-600" />
                        <span>{doc.attachments.length}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-300 font-mono">—</span>
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

      {/* Attachment Viewer / Lightbox Modal */}
      {viewingAttachment && (
        <AttachmentViewerModal
          attachment={viewingAttachment}
          onClose={() => setViewingAttachment(null)}
          onDelete={(id) => {
            const parentDoc = documents.find((d) =>
              (d.attachments || []).some((att) => att.id === id)
            );
            if (parentDoc) {
              const updated = (parentDoc.attachments || []).filter((a) => a.id !== id);
              updateDocument({ ...parentDoc, attachments: updated });
            }
          }}
        />
      )}
    </div>
  );
};

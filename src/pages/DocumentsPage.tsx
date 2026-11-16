import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Link2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { DocumentStatus } from '@/types';

export const DocumentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Sample historical and active documents matching the official NIA DOC LOG SHEET columns
  const sampleDocuments = [
    {
      id: 'doc-001',
      type: 'Incoming',
      documentType: 'Letter of Endorsement',
      meansOfTransmission: 'DMS / Hand Carried',
      description: 'Endorsement of Final Feasibility Study Report for Padada River Dam Project with hydrologic model attachments.',
      fileDetail: 'BOX-2026-FS-012',
      dateReceivedByUser: '2026-11-10',
      senderSource: 'Engineering Division / Regional Office XI',
      project: 'Padada River Dam Study',
      typeOfStudy: 'Feasibility Study',
      calendarYear: 2026,
      dateReceived: '2026-11-10',
      actionTaken: 'Conducted hydraulic and structural stability review.',
      dateProcessed: '2026-11-12',
      status: 'On-going' as DocumentStatus,
      dateFinished: '',
      remarks: 'Waiting for supplemental geotechnical borehole log from consultant.',
      followUpAction: 'Send technical follow-up letter to Davao del Sur IMO.',
      linkedActivitiesCount: 2,
    },
    {
      id: 'doc-002',
      type: 'Internal',
      documentType: 'Program of Works (POW)',
      meansOfTransmission: 'Section Routing',
      description: 'Program of Work for Canal Lining at Main Canal Sta. 0+000 to Sta. 2+500.',
      fileDetail: 'POW-2026-RO11-045',
      dateReceivedByUser: '2026-11-04',
      senderSource: 'Planning and Design Section',
      project: 'Digos River Irrigation System',
      typeOfStudy: 'Detailed Engineering Design',
      calendarYear: 2026,
      dateReceived: '2026-11-04',
      actionTaken: 'Finalized unit cost analysis and prepared Bill of Quantities (BOQ).',
      dateProcessed: '2026-11-08',
      status: 'Finished' as DocumentStatus,
      dateFinished: '2026-11-08',
      remarks: 'Signed and forwarded to Division Manager for concurrence.',
      followUpAction: 'None (Completed)',
      linkedActivitiesCount: 3,
    },
    {
      id: 'doc-003',
      type: 'Incoming',
      documentType: 'Special Order',
      meansOfTransmission: 'Official Email',
      description: 'Designation as Technical Working Group (TWG) member for Regional Irrigation Bids and Awards Committee.',
      fileDetail: 'SO-2026-112',
      dateReceivedByUser: '2026-11-02',
      senderSource: 'Office of the Regional Manager',
      project: 'Regional TWG Procurement Support',
      typeOfStudy: 'Administrative / Procurement',
      calendarYear: 2026,
      dateReceived: '2026-11-02',
      actionTaken: 'Noted and attended TWG bid evaluation sessions.',
      dateProcessed: '2026-11-03',
      status: 'Finished' as DocumentStatus,
      dateFinished: '2026-11-03',
      remarks: 'Compiled bid abstract and evaluation sheet.',
      followUpAction: 'N/A',
      linkedActivitiesCount: 1,
    },
  ];

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
          <Button variant="outline" size="sm" leftIcon={<Filter className="w-3.5 h-3.5" />}>
            Export Doc Sheet
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Log Document
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by description, sender, file detail, project, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border-slate-200 focus:border-nia-500 focus:ring-nia-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border-slate-300 py-1.5 px-3 bg-white focus:outline-none"
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
              <th className="table-th">Dates (Received / Processed)</th>
              <th className="table-th">Action Taken</th>
              <th className="table-th">Status</th>
              <th className="table-th text-center">Activities Linked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sampleDocuments.map((doc) => (
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

                {/* Linked Activities */}
                <td className="table-td text-center whitespace-nowrap">
                  <button className="inline-flex items-center gap-1 text-xs text-nia-600 hover:text-nia-800 font-medium bg-nia-50 px-2.5 py-1 rounded-md border border-nia-200">
                    <Link2 className="w-3 h-3" />
                    <span>{doc.linkedActivitiesCount} Activities</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

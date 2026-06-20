import type { FieldType, PredefinedGroupId, ReportField, ReportSettings } from '@/types/report-builder'

export const COMPANY_NAME = 'ADN Diginet Ltd.'
export const COMPANY_ADDRESS = 'House 07, Road 23/A, Gulshan-1, Dhaka-1212, Bangladesh'
export const TIMEZONE = 'Asia/Dhaka'

export const PLATFORMS = ['SMS', 'Email', 'Server', 'TFC'] as const

export const DEFAULT_SETTINGS: ReportSettings = {
  logoDataUrl: null,
  logoWidth: 120,
  companyName: COMPANY_NAME,
  companyAddress: COMPANY_ADDRESS,
}

export const PREDEFINED_GROUP_DEFS: { id: PredefinedGroupId; title: string }[] = [
  { id: 'INCIDENT_DETAILS', title: 'INCIDENT DETAILS' },
  { id: 'AFFECTED_SYSTEM', title: 'AFFECTED SYSTEM' },
  { id: 'IMPACT', title: 'IMPACT' },
  { id: 'ROOT_CAUSE_ANALYSIS', title: 'ROOT CAUSE ANALYSIS' },
  { id: 'INCIDENT_RESPONSE_TEAM', title: 'INCIDENT RESPONSE TEAM' },
  { id: 'IMMEDIATE_ACTIONS_TAKEN', title: 'IMMEDIATE ACTIONS TAKEN' },
  { id: 'LONG_TERM_REMEDIATION', title: 'LONG TERM REMEDIATION' },
  { id: 'COMMUNICATION', title: 'COMMUNICATION' },
  { id: 'LESSONS_LEARNED', title: 'LESSONS LEARNED' },
  { id: 'INCIDENT_CLOSURE', title: 'INCIDENT CLOSURE' },
]

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  'text-input': 'Text Input',
  select: 'Select Field',
  'date-time': 'Date & Time Picker',
  'rich-text': 'Rich Text Editor',
  'ordered-list': 'Ordered List Builder',
  'team-table': 'Team Table Builder',
}

export const CUSTOM_FIELD_TYPES: FieldType[] = [
  'text-input',
  'select',
  'date-time',
  'rich-text',
  'ordered-list',
  'team-table',
]

function makeId(): string {
  return crypto.randomUUID()
}

export function buildPredefinedFields(id: PredefinedGroupId): ReportField[] {
  switch (id) {
    case 'INCIDENT_DETAILS':
      return [
        { id: makeId(), type: 'date-time', label: 'Date and Time of Incident', value: '' },
        {
          id: makeId(),
          type: 'select',
          label: 'Incident Severity Level',
          options: [
            { id: makeId(), label: 'Critical' },
            { id: makeId(), label: 'High' },
            { id: makeId(), label: 'Medium' },
            { id: makeId(), label: 'Low' },
          ],
          value: '',
        },
        { id: makeId(), type: 'text-input', label: 'Incident Description', value: '' },
      ]
    case 'INCIDENT_RESPONSE_TEAM':
      return [{ id: makeId(), type: 'team-table', members: [] }]
    case 'IMMEDIATE_ACTIONS_TAKEN':
      return [
        { id: makeId(), type: 'rich-text', value: '' },
        { id: makeId(), type: 'ordered-list', items: [] },
      ]
    case 'LONG_TERM_REMEDIATION':
      return [
        { id: makeId(), type: 'rich-text', value: '' },
        { id: makeId(), type: 'ordered-list', items: [] },
      ]
    case 'AFFECTED_SYSTEM':
    case 'IMPACT':
    case 'ROOT_CAUSE_ANALYSIS':
    case 'COMMUNICATION':
    case 'LESSONS_LEARNED':
    case 'INCIDENT_CLOSURE':
      return [{ id: makeId(), type: 'rich-text', value: '' }]
    default:
      return []
  }
}

export function buildCustomFields(types: FieldType[]): ReportField[] {
  return types.map((type) => {
    switch (type) {
      case 'text-input':
        return { id: makeId(), type: 'text-input', label: 'Label', value: '' }
      case 'select':
        return { id: makeId(), type: 'select', label: 'Label', options: [], value: '' }
      case 'date-time':
        return { id: makeId(), type: 'date-time', label: 'Label', value: '' }
      case 'rich-text':
        return { id: makeId(), type: 'rich-text', value: '' }
      case 'ordered-list':
        return { id: makeId(), type: 'ordered-list', items: [] }
      case 'team-table':
        return { id: makeId(), type: 'team-table', members: [] }
    }
  })
}

export type PlatformType = 'SMS' | 'Email' | 'Server' | 'TFC'

export interface ReportSettings {
  logoDataUrl: string | null
  logoWidth: number
  companyName: string
  companyAddress: string
}

export type FieldType =
  | 'text-input'
  | 'select'
  | 'date-time'
  | 'rich-text'
  | 'ordered-list'
  | 'team-table'

export type PredefinedGroupId =
  | 'INCIDENT_DETAILS'
  | 'AFFECTED_SYSTEM'
  | 'IMPACT'
  | 'ROOT_CAUSE_ANALYSIS'
  | 'INCIDENT_RESPONSE_TEAM'
  | 'IMMEDIATE_ACTIONS_TAKEN'
  | 'LONG_TERM_REMEDIATION'
  | 'COMMUNICATION'
  | 'LESSONS_LEARNED'
  | 'INCIDENT_CLOSURE'

export interface SelectOption {
  id: string
  label: string
}

export interface TeamMember {
  id: string
  name: string
  position: string
  roleInResponse: string
}

export interface OrderedListItem {
  id: string
  heading: string
  description: string
}

interface BaseField {
  id: string
  type: FieldType
}

export interface TextInputField extends BaseField {
  type: 'text-input'
  label: string
  value: string
}

export interface SelectField extends BaseField {
  type: 'select'
  label: string
  options: SelectOption[]
  value: string
}

export interface DateTimeField extends BaseField {
  type: 'date-time'
  label: string
  value: string
}

export interface RichTextField extends BaseField {
  type: 'rich-text'
  value: string
}

export interface OrderedListField extends BaseField {
  type: 'ordered-list'
  items: OrderedListItem[]
}

export interface TeamTableField extends BaseField {
  type: 'team-table'
  members: TeamMember[]
}

export type ReportField =
  | TextInputField
  | SelectField
  | DateTimeField
  | RichTextField
  | OrderedListField
  | TeamTableField

export interface ReportGroup {
  id: string
  title: string
  predefinedId?: PredefinedGroupId
  fields: ReportField[]
  isExpanded: boolean
}

export interface ReportMetadata {
  companyName: string
  companyAddress: string
  timezone: string
  platform: PlatformType | null
  generatedAt: string
}

export interface ReportData {
  metadata: ReportMetadata
  groups: ReportGroup[]
}

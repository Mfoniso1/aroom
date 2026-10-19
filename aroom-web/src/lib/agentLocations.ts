/**
 * agentLocations.ts
 * Coverage areas an agent can select during registration.
 * Grouped by campus proximity for easier UX.
 */

export interface AgentLocation {
  id: string
  label: string
  campus: string
}

export const AGENT_LOCATIONS: AgentLocation[] = [
  // UNIPORT cluster
  { id: 'choba',          label: 'Choba Gate & Extension', campus: 'UNIPORT' },
  { id: 'alakahia',       label: 'Alakahia (UPTH Road)',   campus: 'UNIPORT' },
  { id: 'delta_park',     label: 'Delta Park Area',        campus: 'UNIPORT' },
  { id: 'back_of_chem',   label: 'Back of Chem',           campus: 'UNIPORT' },
  { id: 'abuja_campus',   label: 'Abuja Campus / Univ. Park', campus: 'UNIPORT' },
  { id: 'ozuoba',         label: 'Ozuoba',                 campus: 'UNIPORT' },
  { id: 'aluu',           label: 'Aluu',                   campus: 'UNIPORT' },
  { id: 'rumuosi',        label: 'Rumuosi',                campus: 'UNIPORT' },
  { id: 'rumuola',        label: 'Rumuola',                campus: 'UNIPORT' },
  { id: 'rumuokwurusi',   label: 'Rumuokwurusi',           campus: 'UNIPORT' },
  // Other
  { id: 'other',          label: 'Other / Multiple Areas', campus: 'Other' },
]

export const LOCATION_CAMPUS_GROUPS = [
  'UNIPORT', 'Other',
] as const

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
  { id: 'choba',          label: 'Choba',               campus: 'UNIPORT' },
  { id: 'alakahia',       label: 'Alakahia',             campus: 'UNIPORT' },
  { id: 'aluu',           label: 'Aluu',                 campus: 'UNIPORT' },
  { id: 'back_of_chem',   label: 'Back of Chem',         campus: 'UNIPORT' },
  { id: 'ozuoba',         label: 'Ozuoba',               campus: 'UNIPORT' },
  { id: 'rumuola',        label: 'Rumuola',              campus: 'UNIPORT' },
  { id: 'rumuokwurusi',   label: 'Rumuokwurusi',         campus: 'UNIPORT' },
  { id: 'delta_park',     label: 'Delta Park Area',      campus: 'UNIPORT' },
  // UNILAG cluster
  { id: 'akoka',          label: 'Akoka',                campus: 'UNILAG' },
  { id: 'yaba',           label: 'Yaba',                 campus: 'UNILAG' },
  { id: 'onike',          label: 'Onike',                campus: 'UNILAG' },
  { id: 'bariga',         label: 'Bariga',               campus: 'UNILAG' },
  // UNIBEN cluster
  { id: 'ugbowo',         label: 'Ugbowo',               campus: 'UNIBEN' },
  { id: 'ekosodin',       label: 'Ekosodin',             campus: 'UNIBEN' },
  { id: 'bdpa',           label: 'BDPA Estate',          campus: 'UNIBEN' },
  // UI cluster
  { id: 'agbowo',         label: 'Agbowo',               campus: 'UI' },
  { id: 'bodija',         label: 'Bodija',               campus: 'UI' },
  { id: 'samonda',        label: 'Samonda',              campus: 'UI' },
  // OAU cluster
  { id: 'ile_ife',        label: 'Ile-Ife (OAU area)',   campus: 'OAU' },
  // Other
  { id: 'other',          label: 'Other / Multiple Areas', campus: 'Other' },
]

export const LOCATION_CAMPUS_GROUPS = [
  'UNIPORT', 'UNILAG', 'UNIBEN', 'UI', 'OAU', 'Other',
] as const

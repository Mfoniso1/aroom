export interface CampusOption {
  id: string
  shortCode: string
  name: string
  state: string
  city: string
  popularLandmarks: string[]
}

export const CAMPUSES: CampusOption[] = [
  {
    id: 'uniport',
    shortCode: 'UNIPORT',
    name: 'University of Port Harcourt (UNIPORT)',
    state: 'Rivers State',
    city: 'Port Harcourt',
    popularLandmarks: ['Choba Gate', 'Alakahia (UPTH Road)', 'Delta Park', 'Back of Chem', 'Abuja Campus Gate', 'Ozuoba', 'Aluu', 'Rumuosi']
  }
]

// Launch scope: UNIPORT only. Add more campuses here when we expand.

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
    popularLandmarks: ['Choba Gate', 'Alakahia', 'Delta Park', 'University Park', 'Abuja Campus Gate', 'Ozuoba']
  },
  {
    id: 'unilag',
    shortCode: 'UNILAG',
    name: 'University of Lagos (UNILAG)',
    state: 'Lagos State',
    city: 'Yaba, Lagos',
    popularLandmarks: ['Akoka Gate', 'Abule Oja', 'Onike Roundabout', 'Bariga', 'St. Finbarrs', 'Yaba Tech Junction']
  },
  {
    id: 'uniben',
    shortCode: 'UNIBEN',
    name: 'University of Benin (UNIBEN)',
    state: 'Edo State',
    city: 'Benin City',
    popularLandmarks: ['Ugbowo Main Gate', 'Ekosodin', 'BDPA', 'Osasogie', 'Isiohor']
  },
  {
    id: 'ui',
    shortCode: 'UI',
    name: 'University of Ibadan (UI)',
    state: 'Oyo State',
    city: 'Ibadan',
    popularLandmarks: ['Agbowo', 'Bodija', 'UI Main Gate', 'Samonda', 'Sango']
  },
  {
    id: 'oau',
    shortCode: 'OAU',
    name: 'Obafemi Awolowo University (OAU)',
    state: 'Osun State',
    city: 'Ile-Ife',
    popularLandmarks: ['Campus Gate', 'Asherifa', 'Mayfair', 'Ede Road', 'Maintenance']
  },
  {
    id: 'unn',
    shortCode: 'UNN',
    name: 'University of Nigeria, Nsukka (UNN)',
    state: 'Enugu State',
    city: 'Nsukka',
    popularLandmarks: ['Odenigwe', 'Hilltop', 'Behind Flat', 'Alor Uno', 'Green House']
  },
  {
    id: 'futa',
    shortCode: 'FUTA',
    name: 'Federal University of Technology, Akure (FUTA)',
    state: 'Ondo State',
    city: 'Akure',
    popularLandmarks: ['South Gate', 'North Gate', 'Aule', 'Ibake', 'FUTA Junction']
  },
  {
    id: 'unilorin',
    shortCode: 'UNILORIN',
    name: 'University of Ilorin (UNILORIN)',
    state: 'Kwara State',
    city: 'Ilorin',
    popularLandmarks: ['Tanke', 'Sanrab', 'Mark', 'University Road', 'Tipper Garage']
  },
  {
    id: 'lasu',
    shortCode: 'LASU',
    name: 'Lagos State University (LASU)',
    state: 'Lagos State',
    city: 'Ojo, Lagos',
    popularLandmarks: ['Iyana Iba', 'Post Service', 'Alaba', 'Okokomaiko', 'LASU Main Gate']
  },
  {
    id: 'delsu',
    shortCode: 'DELSU',
    name: 'Delta State University (DELSU)',
    state: 'Delta State',
    city: 'Abraka',
    popularLandmarks: ['Site 1', 'Site 2', 'Site 3', 'Campus Gate', 'Ekrejeta']
  }
]

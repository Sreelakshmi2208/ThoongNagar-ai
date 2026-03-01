export interface Van {
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: "Available" | "En Route" | "Busy";
    distance?: number;
}

export interface Hospital {
    id: string;
    name: string;
    location: string;
    contact: string;
    lastScan: string; // ISO Date
    status: "Compliant" | "Pending" | "Late";
}

export const MOCK_VANS: Van[] = [
    { id: "V001", name: "Cauvery Clean Team", lat: 9.9322, lng: 78.1128, status: "Available" },
    { id: "V002", name: "Vaigai Sweepers", lat: 9.9252, lng: 78.1298, status: "Available" },
    { id: "V003", name: "Temple City Cleaners", lat: 9.9192, lng: 78.1198, status: "Available" },
    { id: "V004", name: "Madurai Metro Waste", lat: 9.9402, lng: 78.1008, status: "Available" },
];

export const MOCK_HOSPITALS: Hospital[] = [
    { id: "HOS-001", name: "Apollo Speciality Hospital", location: "Anna Nagar", contact: "0452-2580892", lastScan: new Date().toISOString(), status: "Compliant" },
    { id: "HOS-002", name: "Meenakshi Mission Hospital", location: "Lake Area", contact: "0452-2588741", lastScan: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), status: "Pending" },
    { id: "HOS-003", name: "Grace Kennett Foundation", location: "Ellis Nagar", contact: "0452-2601767", lastScan: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: "Compliant" },
];

export function getNearestVan(lat: number, lng: number): Van {
    return MOCK_VANS.map(van => ({
        ...van,
        distance: Math.sqrt(Math.pow(van.lat - lat, 2) + Math.pow(van.lng - lng, 2)) * 111 // rough km conversion
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0))[0];
}

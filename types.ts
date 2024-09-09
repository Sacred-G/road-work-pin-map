export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  padding: number;
  city?: string;
}

export interface PopupInfo {
  image?: string;
  title?: string;
  description?: string;
  category?: string;
  

}
export interface PinData extends PopupInfo {
  id: number;
  longitude: number;
  latitude: number;
  title?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
  name: string;
  email:string
}

export type ColorScheme = 'light' | 'dark';


export interface MapboxDirections {
  code: string
  uuid: string
  waypoints: {
    distance: number
    name: string
    location: [number, number]
  }[]
  routes: {
    distance: number
    duration: number
    geometry: {
      coordinates: [number, number][]
      type: string
    }
    legs: {
      via_waypoints: [],
      admins: {
        iso_3166_1: string
        iso_3166_1_alpha3: string
      }[]
      distance: number
      duration: number
      steps: []
      summary: string
      weight: number
    }[]
    weight: number
    weight_name: string
  }[]
}
export type Screen = 'login' | 'home' | 'report' | 'search' | 'map' | 'notifications' | 'myitems';

export interface Item {
  id: string;
  title: string;
  description: string;
  status: 'LOST' | 'FOUND' | 'CLAIMED';
  location?: string;
  createdAt?: string;
}

export interface ScreenProps {
  onNavigate: (screen: Screen) => void;
}

export interface User {
  id: string;
  email: string;
  name: string;
}


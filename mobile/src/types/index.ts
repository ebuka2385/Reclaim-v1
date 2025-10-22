export type Screen = 'home' | 'report' | 'items';

export interface Item {
  id: string;
  title: string;
  description: string;
  status: 'LOST' | 'FOUND' | 'CLAIMED';
}

export interface ScreenProps {
  onNavigate: (screen: Screen) => void;
}


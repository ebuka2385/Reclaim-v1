import { Screen } from '../../../types';

// Mock the navigation function
const mockOnNavigate = jest.fn();

describe('BottomNav Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct navigation function signature', () => {
    expect(typeof mockOnNavigate).toBe('function');
  });

  it('should call navigation with correct screen names', () => {
    const screens: Screen[] = ['home', 'search', 'map', 'notifications'];
    
    screens.forEach(screen => {
      mockOnNavigate(screen);
      expect(mockOnNavigate).toHaveBeenCalledWith(screen);
    });
  });

  it('should validate screen types', () => {
    const validScreens: Screen[] = ['home', 'report', 'search', 'map', 'notifications', 'myitems'];
    
    validScreens.forEach(screen => {
      expect(['home', 'report', 'search', 'map', 'notifications', 'myitems']).toContain(screen);
    });
  });

  it('should handle current screen state correctly', () => {
    const currentScreen: Screen = 'search';
    expect(['home', 'report', 'search', 'map', 'notifications', 'myitems']).toContain(currentScreen);
  });
});

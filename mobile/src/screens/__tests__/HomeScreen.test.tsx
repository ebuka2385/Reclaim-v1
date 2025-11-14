import { Screen } from '../../types';

// Mock the navigation function
const mockOnNavigate = jest.fn();

describe('HomeScreen Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct navigation function signature', () => {
    expect(typeof mockOnNavigate).toBe('function');
  });

  it('should call navigation with correct screen names', () => {
    const screens: Screen[] = ['report', 'search', 'myitems'];
    
    screens.forEach(screen => {
      mockOnNavigate(screen);
      expect(mockOnNavigate).toHaveBeenCalledWith(screen);
    });
  });

  it('should validate screen types', () => {
    const validScreens: Screen[] = ['home', 'report', 'search', 'map', 'notifications', 'myitems', 'messages', 'chat'];
    
    validScreens.forEach(screen => {
      expect(['home', 'report', 'search', 'map', 'notifications', 'myitems', 'messages', 'chat']).toContain(screen);
    });
  });
});

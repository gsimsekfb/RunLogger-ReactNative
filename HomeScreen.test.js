
import {getMonthAndYear} from './HomeScreen';

test('getMonthAndYear()', () => {
  const monthAndYear = getMonthAndYear(new Date('December 17, 1995 03:24:00'));
  expect(monthAndYear).toBe('12.1995');
})

// to fix type errors
// more: https://github.com/itinance/react-native-fs/issues/404
jest.mock('react-navigation', () => null);
jest.mock('react-native-gesture-handler', () => null);
jest.mock('react-navigation-stack', () => null);
jest.mock('@react-native-community/async-storage', () => null);
jest.mock('react-native-device-info', () => null);    
jest.mock('react-native-fs', () => () => null); // <--- :)

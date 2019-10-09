
import {getMonthAndYear} from './HomeScreen';

// 1
test('getMonthAndYear()', () => {
  const monthAndYear = getMonthAndYear(new Date('December 17, 1995 03:24:00'));
  expect(monthAndYear).toBe('12.1995');
})

// 2.a Mocking Add function calls/returns using jest-when
// npm i --save-dev jest-when


// 2.b Mocking Add function calls/returns by hand
test('mockAdd', () => {
  mockData.map(
    e => expect(mockAdd(e.x, e.y)).toBe(e.result)
  );  
})

function mockAdd(x, y) {
  const arr = mockData.filter(e => (e.x === x && e.y === y));  
  // if(arr === undefined) return null; // ?? not working
  return arr[0].result;
}

const mockData = [
  { x: 1, y: 2, result: 3 },
  { x: 2, y: 2, result: 4 },
  { x: 2, y: 4, result: 6 }
];


//// ----------------------------------
// to fix type errors
// more: https://github.com/itinance/react-native-fs/issues/404
jest.mock('react-navigation', () => null);
jest.mock('react-native-gesture-handler', () => null);
jest.mock('react-navigation-stack', () => null);
jest.mock('@react-native-community/async-storage', () => null);
jest.mock('react-native-device-info', () => null);    
jest.mock('react-native-fs', () => () => null); // <--- :)
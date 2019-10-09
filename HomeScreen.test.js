
import { when } from 'jest-when'
import {getMonthAndYear} from './HomeScreen';
import Axios from 'axios';

// 1. Most basic test 
test('getMonthAndYear()', () => {
  const monthAndYear = getMonthAndYear(new Date('December 17, 1995 03:24:00'));
  expect(monthAndYear).toBe('12.1995');
})

// 2. Object test
const user1 = {name: 'xx'};
const user2 = {name: 'xx'};

test('users', () => {
  // expect(user1).toBe(user2);    // Use toBe with primitive types, 
  expect(user1).toStrictEqual(user2);
})

// 3. Async test
function fetchUser() {
  return Axios.get('https://jsonplaceholder.typicode.com/users/1')
       .then(res => res.data) 
       .catch(err => console.log('fetchUser() err: ' + err));
}

async function fetchUser2() {  
  try {
    const res = await Axios.get('https://jsonplaceholder.typicode.com/users/1');       
    return res.data.name;
  }
  catch(err) {
    console.log('fetchUser2() err: ' + err);
    return(null);
  }  
}

test('Async test', async () => {  
  // expect.assertions(1);  // is it needed ??
  expect(await fetchUser2()).toBe('Leanne Graham');
  return fetchUser().then(data => expect(data.name).toBe('Leanne Graham'));
});


// ------------------- Mock -----------------------

// 1.a Mocking Add function calls/returns using jest-when
// npm i --save-dev jest-when
const _mockAdd = jest.fn()
when(_mockAdd).calledWith(1,2).mockReturnValue(3)
when(_mockAdd).calledWith(3,2).mockReturnValue(5)

test('mockAdd-a', () => {
  expect(_mockAdd(1,2)).toEqual(3);
  expect(_mockAdd(3,2)).toEqual(5);
});


// 1.b Mocking Add function calls/returns by hand
test('mockAdd-b', () => {
  mockDataForAdd.map(
    e => expect(mockAdd(e.x, e.y)).toBe(e.result)
  );  
  // or 
  expect(mockAdd(1,2)).toBe(3);
})

function mockAdd(x, y) {
  const arr = mockDataForAdd.filter(e => (e.x === x && e.y === y));  
  // if(arr === undefined) return null; // ?? not working
  return arr[0].result;
}

const mockDataForAdd = [
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
jest.mock('react-native-fs', () => () => null); // <--- ?? wth :)

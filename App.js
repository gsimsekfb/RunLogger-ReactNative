import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import HomeScreen from './HomeScreen';
import Settings from './src/Settings';

const MainNavigator = createStackNavigator({
  Home: {screen: HomeScreen},
  Settings: {screen: Settings},
});

const App = createAppContainer(MainNavigator);

export default App;
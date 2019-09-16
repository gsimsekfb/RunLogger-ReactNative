
import React from 'react';
import {Button} from 'react-native';

export default class Settings extends React.Component {
    static navigationOptions = {
      title: 'SSS',
    };

    render() {
      const {navigate} = this.props.navigation;
      return (
        <Button
          title="Go to Jane's profile"
          onPress={() => navigate('Home', {name: 'Jane'})}
        />
      );
    }
  }
'use strict';

import React, {Component} from 'react';
import {View, Text} from 'react-native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
// import console = require('console');
import App from './App';

let swipeId = 0;  // todo
export default class GR extends Component {

  constructor(props) {
    console.log('--- GR::ctor...');
    super(props);
    this.state = { gestureName: 'none' };
  }

  onSwipe(gestureName, gestureState) {    
    this.setState({gestureName: gestureName});
    // console.log('--- GR:: onSwipe() gestureName: ' + gestureName);     
    ++swipeId;
  }

  render() {
  
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };

    return (
      <GestureRecognizer
        onSwipe={(direction, state) => this.onSwipe(direction, state)}
        config={config}
        style={{flex: 1}}
        >
        <App gesture={this.state.gestureName} swipeId={swipeId} />
      </GestureRecognizer>
    );
  }
}

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
    this.state = {
      myText: 'I\'m ready to get swiped!',
      gestureName: 'none',
      backgroundColor: '#fff'
    };
  }

  onSwipeUp(gestureState) {
    this.setState({myText: 'You swiped up!'});
  }

  onSwipeDown(gestureState) {
    this.setState({myText: 'You swiped down!'});
  }

  onSwipeLeft(gestureState) {
    this.setState({myText: 'You swiped left!'});
  }

  onSwipeRight(gestureState) {
    this.setState({myText: 'You swiped right!'});
  }

  onSwipe(gestureName, gestureState) {    
    const {SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT} = swipeDirections;
    this.setState({gestureName: gestureName});
    // console.log('--- GR:: onSwipe() gestureName: ' + gestureName);     
    ++swipeId;
    switch (gestureName) {
      case SWIPE_UP:
        //this.setState({backgroundColor: 'red'});
        break;
      case SWIPE_DOWN:
        //this.setState({backgroundColor: 'green'});
        break;
      case SWIPE_LEFT:
        // console.log('LLL');
        //this.setState({backgroundColor: 'blue'});
        break;
      case SWIPE_RIGHT:
        // console.log('RRR');
        //this.setState({backgroundColor: 'yellow'});
        break;
    }
  }

  render() {
    
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };

    // console.log('--- GR:: render() gesture: ' + this.state.gesture);   

    return (
      <GestureRecognizer
        onSwipe={(direction, state) => this.onSwipe(direction, state)}
        onSwipeUp={(state) => this.onSwipeUp(state)}
        onSwipeDown={(state) => this.onSwipeDown(state)}
        onSwipeLeft={(state) => this.onSwipeLeft(state)}
        onSwipeRight={(state) => this.onSwipeRight(state)}
        config={config}
        style={{
          flex: 1,
          backgroundColor: this.state.backgroundColor
        }}
        >
        <App gesture={this.state.gestureName} swipeId={swipeId} />
      </GestureRecognizer>
    );
  }
}

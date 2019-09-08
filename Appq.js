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

  render() {
    

    // console.log('--- GR:: render() gesture: ' + this.state.gesture);   

    return (
        <View style={{flex:1,  flexDirection: 'row', backgroundColor:'white'}}>
            <View style={{justifyContent:'space-around'}}>
                <View style={{width:50,alignSelf:'stretch',backgroundColor:'pink',margin:5}}/>  
                <View style={{width:50,alignSelf:'stretch',backgroundColor:'pink',marginHorizontal:5}}/>  
                <View style={{width:50,alignSelf:'stretch',backgroundColor:'pink',margin:5}}/>  
            </View>
            <View style={{flex:1,alignItems:'center',justifyContent:'center',alignSelf:'stretch',backgroundColor:'blue',margin:5}}>
                <Text style={{color:'white',fontWeight:'bold'}}>
                View
                </Text>
            </View>
        </View>
    );
  }
}

import React, { Component, useEffect } from 'react'
import DatePicker from 'react-native-datepicker'
// import console = require('console');
 
function Example() {
  console.log('Example:: ctor');

  useEffect( // For things to do after mount
    () => { 
      console.log('Example:: Example mounted. Now, lets do a network call')
      // Do network call...
      return () => {
        console.log('Example:: will unmount');
      }
    }
  )
  
  console.log('Example:: ctor-more');
  return null;
}

export default class App extends React.Component {

  constructor(props) {
    super(props)
    console.log('App:: ctor');
  }

  componentDidMount() {
    console.log('App:: componentDidMount');
  }

  render() {
    return <Example/>;
  }

  componentWillUnmount() {
    console.log('App:: will unmount');
  }

}
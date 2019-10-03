import React, { Component } from 'react'
import DatePicker from 'react-native-datepicker'

// https://github.com/xgfe/react-native-datepicker

export default class MyDatePicker extends Component {
  constructor(props){
    super(props)    
    this.state = { date: this.props.initialDate }
    this.props.sendData(this.state.date)
    // console.log('--- MyDatePicker::ctor', this.props)
  }

  dateChange = (date) => {
    this.setState({date: date})
    // console.log('--- MyDatePicker::dateChange() ',  date)
    this.props.sendData(date)
  }
 
  render(){
    return (
      <DatePicker
        style={{width: 200, top: 0}}        
        date={this.state.date}
        mode="datetime" // todo: not working on Samsung Galaxy A5 2016 (Android 7.0, Nougat)
        androidMode="calendar"
        format="DD-MM-YYYY HH:mm"
        onDateChange={(date) => {this.dateChange(date)}}
      />
    )
  }
}
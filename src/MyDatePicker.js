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
        mode="datetime"
        format="DD-MM-YYYY HH:mm"
        customStyles={{
          dateIcon: {
            position: 'absolute',
            left: 0,
            top: 0,
            marginLeft: 0
          },
          dateInput: {
            marginLeft: 36
          }
          // ... You can check the source to find the other keys.
        }}
        onDateChange={(date) => {this.dateChange(date)}}
      />
    )
  }
}
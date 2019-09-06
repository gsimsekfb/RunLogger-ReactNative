import React, {Fragment, useState} from 'react';
import {
  SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, TextInput,
  TouchableHighlight, FlatList, TouchableOpacity, Button, Modal
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import MyDatePicker from './src/MyDatePicker';
import { clone } from '@babel/types';

const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AddEditDialog = ({ logToEdit, hideAddEditDialog, sendData }) => {

  const debug = 0
  const green = debug ? 'green' : ''
  const yellow = debug ? 'yellow' : ''

  console.log('--- AddEditDialog:: logToEdit', logToEdit)

  const isAddDialog = (logToEdit === null)
  console.log('--- AddEditDialog:: isAddDialog', isAddDialog)

  const [min, setMin]= useState(isAddDialog ? '0' : String(logToEdit.min))
  const [distance, setDistance]= useState(isAddDialog ? '0' : String(logToEdit.distance))
  const [notes, setNotes]= useState(isAddDialog ? '' : logToEdit.notes)
  const initialDate = isAddDialog ? new Date() : logToEdit.date;
  const [dateFromDatePicker, setDateFromDatePicker] = useState(null);

  const _dataFromDatePicker = (data) => {    
    console.log('--- AddEditDialog::_dataFromDatePicker:: data: ', data)
    setDateFromDatePicker(data);
  }

  return(
    <View style={{marginTop: 22}}>
      <Modal
        animationType="fade"
        transparent={false}
        visible={true}
        onRequestClose={() => { Alert.alert('Modal has been closed.') }}>
        <View style={{backgroundColor: green, marginTop: 160, flex:1, justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <View style={{flexDirection: 'row', backgroundColor: yellow }}>
            <Text style={{fontSize: 20}}> Date: </Text>
            <MyDatePicker initialDate={initialDate} sendData={_dataFromDatePicker}/>
          </View>
          <View style={{flexDirection: 'row', backgroundColor: yellow}}>
            <Text style={{fontSize: 20}}> Distance: </Text>
            <TextInput
              style={{height: 40, width: 80, borderColor: 'gray', borderWidth: 1}}
              onChangeText={ text => setDistance(text) }
              value={distance}
            />
            <Text style={{fontSize: 20}}> meters </Text>            
          </View>          
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 20}}> Duration: </Text>
            <TextInput
              style={{height: 40, width: 80, borderColor: 'gray', borderWidth: 1}}
              onChangeText={ text => setMin(text) }
              value={min}
            />
            <Text style={{fontSize: 20}}> minutes </Text>            
          </View>            
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 20}}> Notes: </Text>
            <TextInput
              style={{height: 40, width: 200, fontSize: 12, borderColor: 'gray', borderWidth: 1}}
              onChangeText={ text => setNotes(text) }
              value={notes}
            />
          </View>                 
          <View style={{flexDirection: 'row', margin: 100}}>
            <TouchableOpacity onPress={() => hideAddEditDialog() }>
              <Text style={{fontSize: 20}}> Cancel </Text>
            </TouchableOpacity>                 
            <TouchableOpacity onPress={() => {
              sendData( {date: dateFromDatePicker, min: Number(min), distance: Number(distance), notes: notes } )
              console.log('--- AddEditDialog::save() pressed') }
            }>
              <Text style={{fontSize: 20}}> Save </Text>
            </TouchableOpacity>          
          </View>
        </View>
      </Modal>
    </View>
  )
}

let progCounter = 0;
const App = () => {

  console.log('\n\n')
  console.log('----- Debug: App Start -------', ++progCounter)  

  const [screenMonthAndYear, setScreenMonthAndYear] = useState("9.2019");

  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const _hideAddEditDialog = () => {
    setShowAddEditDialog(false)
  }

  const [dataFromAddEditDialog, setDataFromAddEditDialog] = useState('')
  const _dataFromAddEditDialog = (data) => {  // AddEditDialog on Save button
    setShowAddEditDialog(false)
    setDataFromAddEditDialog(data)
    console.log('--- App::_dataFromAddEditDialog:: dataFromAddEditDialog: ', dataFromAddEditDialog)
    console.log('--- App::_dataFromAddEditDialog:: logToEdit: ', logToEdit)
  }
  //console.log('--- App:: dataFromAddEditDialog: ', dataFromAddEditDialog)

  function getData(val){
    // do not forget to bind getData in constructor
    console.log(val);
  }

  function getWeekOfYear(date) {
    const onejan = new Date(date.getFullYear(), 0, 1);
    return( Math.ceil( (((date - onejan) / 86400000) + onejan.getDay() + 1) / 7 ) );
  }

  // returns: '7.2019'
  function getMonthAndYear(date) {
    return (date.getMonth()+1 + '.' + date.getFullYear())
  }

  function nextMonthAndYear(monthAndYear) {
    let month = Number(monthAndYear.split('.')[0]);
    let year = Number(monthAndYear.split('.')[1]);
    (12 === month) ? (month = 1, ++year) : ++month;
    console.log(month + '.' + year)    
    return (String(month) + '.' + String(year))    
  }

  function prevMonthAndYear(monthAndYear) {
    let month = Number(monthAndYear.split('.')[0]);
    let year = Number(monthAndYear.split('.')[1]);
    (1 === month) ? (month = 12, --year) : --month;
    console.log(month + '.' + year)    
    return (String(month) + '.' + String(year))    
  }

  //// --- Item Press
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  onItemPress = (item, index) => {
    // console.log('--- App:: onItemPress(): index ' + index);
    if(item.itemType !== 'runData') return; 
    setSelectedItemIndex(index);  // UI
    setLogToEdit(monthLogs[item.monthLogIndex])
  }

  function onNextButtonPress() {
    console.log(`next button press`);
    setSelectedItemIndex(-1)
    setScreenMonthAndYear(nextMonthAndYear(screenMonthAndYear))    
  }

  function onPrevButtonPress() {
    console.log(`prev button press`);
    setSelectedItemIndex(-1)
    setScreenMonthAndYear(prevMonthAndYear(screenMonthAndYear))    
  }

  function onDeleteButtonPress() {
    console.log(`Del button press`) 
    if(selectedItemIndex === -1) return;
    let arr = [...runLogs];
    arr.splice(arr.findIndex(v => v.timestamp === logToEdit.timestamp) , 1);
    setRunLogs([...arr])
    setSelectedItemIndex(-1)      
    setLogToEdit(null)
  }

  const [logToEdit, setLogToEdit] = useState();  
  function onEditButtonPress() {
    console.log(`Edit button press`);
    if(selectedItemIndex < 0) return; 
    setShowAddEditDialog(true)    
  }

  function onAddButtonPress() {
    console.log(`Add button press`);   
    setLogToEdit(null)
    setShowAddEditDialog(true)
    // console.log('--- aaa: ', dataFromAddEditDialog.date)
    // setRunLogs([...runLogs, 
    //             {date: new Date('Tue Jul 30 2019 17:11:34 GMT+0300 (+03)'), min: 30, distance: 25, notes: "" }
    // ])   
  }  

  // UNIX time
  // const tt = new Date().getTime()/1000;
  // console.log("tt: ", tt)
  // console.log("tt-: ", new Date(tt*1000))

  const d0 = new Date('Fri May 10 2019 14:11:32 GMT+0300 (+03)')
  const d1 = new Date('Sat Aug 31 2019 15:15:38 GMT+0300 (+03)')
  const d2 = new Date('Fri Sep 13 2019 16:14:37 GMT+0300 (+03)')
  const d3 = new Date('Sat Sep 14 2019 17:13:34 GMT+0300 (+03)')
  const d4 = new Date('Tue Oct 1 2019 17:11:36 GMT+0300 (+03)')

  // Data from disk
  let initialRunLogs = [
    {timestamp: d0.getTime()/1000, date: d0, min: 24, distance: 1600, notes: "(1+4)" },
    {timestamp: d1.getTime()/1000, date: d1, min: 14, distance: 200, notes: "(2+4)" },
    {timestamp: d2.getTime()/1000, date: d2, min: 24, distance: 100, notes: "(13.sep)" },
    {timestamp: d3.getTime()/1000, date: d3, min: 10, distance: 50, notes: "(14.sep)" },
    {timestamp: d4.getTime()/1000, date: d4, min: 10, distance: 25, notes: "(...)" }
  ]
  const [runLogs, setRunLogs] = useState(initialRunLogs); // todo: remove?
  
  //console.log("initialRunLogs[0]: ", initialRunLogs[0])

  // Add or Edit from AddEditDialog
  if(dataFromAddEditDialog !== '') {
    let dateFromDatePicker = dataFromAddEditDialog.date;    
    console.log('dataFromAddEditDialog: ' + JSON.stringify(dataFromAddEditDialog, null, 4) )
    // Note: The date from MyDatePicker comes as string if it comes from 
    // MyDatePicker::onDateChange() function
    if(dateFromDatePicker && !(dateFromDatePicker instanceof Date)) { 
      console.log('dateFromDatePicker: ' + dateFromDatePicker)
      const d = dateFromDatePicker.split('-')[0]
      const m = dateFromDatePicker.split('-')[1]
      const y = dateFromDatePicker.split('-')[2].split(' ')[0]
      const time = dateFromDatePicker.split(' ')[1]
      const hh = time.split(':')[0]
      const mm = time.split(':')[1]
      dateFromDatePicker = new Date(y,m-1,d,hh,mm);
    }
    // console.log('--- App:: tt1: ', typeof(dateFromDatePicker));          
    // console.log('--- App:: tt2: ', (dateFromDatePicker instanceof Date));          
    const newLog = { // next: Get Date() object from DatePicker      
      timestamp: parseInt(dateFromDatePicker.getTime()/1000, 10),
      date: dateFromDatePicker, min: dataFromAddEditDialog.min, 
      distance: dataFromAddEditDialog.distance, notes: dataFromAddEditDialog.notes 
    }
    if(logToEdit !== null) { // Edit (delete and re-create) existing log
      console.log('--- App:: Editing existing log ...')      
      console.log('--- App:: logToEdit', logToEdit)      
      console.log('--- App:: dataFromAddEditDialog', dataFromAddEditDialog)      
      console.log('--- App:: newLog', newLog)      
      let arr = [...runLogs];
      arr.splice(arr.findIndex(v => v.timestamp === logToEdit.timestamp) , 1);
      setRunLogs([...arr, newLog].sort((a,b) => a.timestamp - b.timestamp))
      setSelectedItemIndex(-1)      
      setLogToEdit(null)
    }
    else {  // Add new log 
      setRunLogs([...runLogs, newLog].sort((a,b) => a.timestamp - b.timestamp))
      console.log('--- App:: Adding new log...')
      console.log('--- App:: newLog', newLog)      
    }
    setDataFromAddEditDialog('')        
  }

  function getMonthLogs(monthAndYear /* e.g. 7.2019 */) { 
    let monthLogs = []
    console.log('--- App:: getMonthLogs(): monthAndYear: ', monthAndYear);       
    for (const log of runLogs) {  
      if (monthAndYear === getMonthAndYear(log.date)) {
        monthLogs.push(log);
      }
    }
    return monthLogs;
  }

  //// --- Create flatlist
  console.log("--- App:: create dataFlatList ---")
  const monthLogs = getMonthLogs( screenMonthAndYear );
  let dataFlatList = []
  if(monthLogs && monthLogs.length > 0) {
    let week = getWeekOfYear(monthLogs[0].date)
    const itemType = { week: "week", dayAndDate: "dayAndDate", runData: "runData" }  
    dataFlatList.push({ key: 'Week ' + getWeekOfYear(monthLogs[0].date), itemType: itemType.week })
    for (const [i, log] of monthLogs.entries()) {
      if(week ==! getWeekOfYear(log.date)) 
        dataFlatList.push({ key: 'Week ' +  getWeekOfYear(log.date), itemType: itemType.week })

      dataFlatList.push({ key: log.date.getDate() + ' ' + monthNames[log.date.getMonth()].substring(0,3) + ', ' + 
                          days[log.date.getDay()], itemType: itemType.dayAndDate })      
      dataFlatList.push({ timestamp: log.timestamp, monthLogIndex: i, key: log.min + 
                          ' min, ' + log.distance + ' meters, '  + log.notes, itemType: itemType.runData })    
      
      week = getWeekOfYear(log.date)
      // console.log('i', i)  // todo: remove i
    }
    // console.log("--- App:: dataFlatList: ", dataFlatList);

    // Add style for selected item
    dataFlatList[selectedItemIndex] = {...dataFlatList[selectedItemIndex], isSelected: true}
  }

  const screenMonthAndYearStr = monthNames[Number(screenMonthAndYear.split('.')[0])-1] + ' ' +
                                Number(screenMonthAndYear.split('.')[1])  
  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <Text style={styles.header}> {screenMonthAndYearStr} </Text>  
        <FlatList
          data={dataFlatList}
          renderItem={({item, index}) => { 
            // console.log('--- App: item: ', item);
            return ( 
            <TouchableOpacity onPress={() => this.onItemPress(item, index)}>
              <Text style={[styles[item.itemType], item.isSelected ? styles.selectedItem : '']}> {item.key} </Text>
            </TouchableOpacity>
            )
            }
          }
        />
        <View style={{position: 'absolute', padding: 4, flexDirection: 'row', top: 500, left: 110}}>
          <Button title={"Prev"} onPress={onPrevButtonPress} color="#4733FF"/>        
          <Button title={"Next"} onPress={onNextButtonPress} color="#4733FF"/>
          <Button title={"Del"} onPress={onDeleteButtonPress} color="#4733FF"/>
          <Button title={"Edit"} onPress={onEditButtonPress} color="#4733FF"/>
          <Button title={"Add"} onPress={onAddButtonPress} color="#4733FF"/>
        </View>
        { showAddEditDialog ? 
          <AddEditDialog logToEdit={logToEdit} hideAddEditDialog={_hideAddEditDialog} sendData={_dataFromAddEditDialog}/> 
          : null 
        }
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: Colors.light,
  },
  text: {
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: Colors.light,
  },  
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  week: {    
    padding: 10,
    fontSize: 18,
    height: 44,
    backgroundColor: "#8c8c8c",
  },    
  dayAndDate: {    
    padding: 10,
    fontSize: 18,
    height: 44,
    backgroundColor: "#d9d9d9",
  },    
  runData: {    
    padding: 10,
    fontSize: 18,
    height: 44,
    backgroundColor: "white",
  },
  selectedItem: {    
    backgroundColor: "yellow",
  },      
});

export default App;

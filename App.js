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
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AddEditDialog = ({ logToEdit, hideAddEditDialog, sendData }) => {

  const debug = 0
  const green = debug ? 'green' : ''
  const yellow = debug ? 'yellow' : ''

  const isAddDialog = (logToEdit === null)
  console.log('--- AddEditDialog:: isAddDialog', isAddDialog)

  const [min, setMin]= useState(isAddDialog ? '0' : String(logToEdit.min))  // next
  const [distance, setDistance]= useState('3000')
  const [notes, setNotes]= useState('6+10')
  let dateFromDatePicker = ''

  console.log('--- AddEditDialog:: logToEdit', logToEdit)

  const _dataFromDatePicker = (data) => {    
    console.log('--- AddEditDialog::_dataFromDatePicker:: data: ', data)
    dateFromDatePicker = data;
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
            <MyDatePicker sendData={_dataFromDatePicker}/>
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
            <TouchableOpacity onPress={() => 
              sendData( {date: dateFromDatePicker, min: Number(min), distance: Number(distance), notes: notes } ) 
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

  const [screenMonthAndYear, setScreenMonthAndYear] = useState("7.2019");

  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const _hideAddEditDialog = () => {
    setShowAddEditDialog(false)
  }

  const [dataFromAddEditDialog, setDataFromAddEditDialog] = useState('')
  const _dataFromAddEditDialog = (data) => {  // AddEditDialog on Save button
    setShowAddEditDialog(false)
    setDataFromAddEditDialog(data)
    console.log('--- App::_dataFromAddEditDialog:: dataFromAddEditDialog: ', dataFromAddEditDialog)
  }
  console.log('--- App:: dataFromAddEditDialog: ', dataFromAddEditDialog)

  // console.log(new Date())
  // console.log(new Date().getDate())
  // console.log(monthNames[new Date().getMonth()])
  // console.log(new Date().getUTCFullYear())

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
  }

  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  // let items = [];
  // for (let i = 0; i < 10; i++) {
  //   items.push(
  //     <TouchableHighlight>
  //       <Text style={styles.sectionDescription}>
  //         {i} Jul, Wed
  //       </Text>
  //     </TouchableHighlight>
  //   );
  // }   

  function onNextButtonPress() {
    console.log(`next button press`);
    setSelectedItemIndex(-1)
    setScreenMonthAndYear("7.2019")    
    // setScreenMonthAndYear(nextMonthAndYear(screenMonthAndYear))    
    // console.log(typeof (nextMonthAndYear(screenMonthAndYear)));    
  }

  function onPrevButtonPress() {
    console.log(`prev button press`);
    setSelectedItemIndex(-1)
    setScreenMonthAndYear("5.2019")    
    // setScreenMonthAndYear(nextMonthAndYear(screenMonthAndYear))    
    // console.log(typeof (nextMonthAndYear(screenMonthAndYear)));    
  }

  const [logToEdit, setLogToEdit] = useState();  
  function onEditButtonPress() {
    console.log(`Edit button press`)      
    console.log(selectedRunLogIndex)
    setLogToEdit(runLogs[selectedRunLogIndex])
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

  
  // Sample Data 
  let initialRunLogs = [
    {index: 0, date: new Date('Fri May 10 2019 14:11:34 GMT+0300 (+03)'), min: 24, distance: 1600, notes: "(1+4)" },
    {index: 1, date: new Date('Tue Jun 18 2019 15:11:34 GMT+0300 (+03)'), min: 14, distance: 200, notes: "(2+4)" },
    {index: 2, date: new Date('Wed Jul 10 2019 16:11:34 GMT+0300 (+03)'), min: 24, distance: 100, notes: "(3+4)" },
    {index: 3, date: new Date('Thu Jul 11 2019 17:11:34 GMT+0300 (+03)'), min: 10, distance: 50, notes: "(5+4)" },
    {index: 4, date: new Date('Thu Jul 25 2019 17:11:34 GMT+0300 (+03)'), min: 10, distance: 25, notes: "" }
  ]
  const [runLogs, setRunLogs] = useState(initialRunLogs); // todo: remove?
  
  // Add new log from AddEditDialog
  if(dataFromAddEditDialog !== '') {
    const y = dataFromAddEditDialog.date.split('-')[2]
    const m = dataFromAddEditDialog.date.split('-')[1]
    const d = dataFromAddEditDialog.date.split('-')[0]
    const newLog = { 
      date: new Date(2000+Number(y),Number(m)-1,Number(d)), min: dataFromAddEditDialog.min, 
      distance: dataFromAddEditDialog.distance, notes: dataFromAddEditDialog.notes 
    }
      setRunLogs([...runLogs, newLog])
      setDataFromAddEditDialog('')
  }

  function getMonthLogs(monthAndYear /* e.g. 7.2019 */) { 
    let monthLogs = []
    console.log('--- App:: getMonthLogs(): monthAndYear: ', monthAndYear);       
    for (const log of runLogs) {  
      if (monthAndYear === getMonthAndYear(log.date)) {
        monthLogs.push(log);
        // console.log(log.date + ": " + (log.date.getMonth()+1) + '.' + log.date.getFullYear() + 
        //             ", Week: " + getWeekOfYear(log.date));
      }
    }
    return monthLogs;
  }

  const monthLogs = getMonthLogs( screenMonthAndYear );

  // console.log("aa", getWeekOfYear(monthLogs[0].date));
  // console.log("aa", days[monthLogs[0].date.getDay()])

  const itemType = { week: "week", dayAndDate: "dayAndDate", runData: "runData" }  

  // --- Create flatlist
  let dataFlatList = []
  // const [dataFlatList, setDataFlatList] = useState([]);
  console.log("--- App:: create dataFlatList ---")
  let week = getWeekOfYear(monthLogs[0].date)
  dataFlatList.push({ key: 'Week ' + getWeekOfYear(monthLogs[0].date), itemType: itemType.week })
  for (const [i, log] of monthLogs.entries()) {
    if(week ==! getWeekOfYear(log.date)) 
      dataFlatList.push({ key: 'Week ' +  getWeekOfYear(log.date), itemType: itemType.week })

    dataFlatList.push({ key: log.date.getDate() + ' ' + monthNames[log.date.getMonth()] + ', ' + 
                        days[log.date.getDay()-1], 
                        itemType: itemType.dayAndDate })      
    dataFlatList.push({ id: parseInt(log.date.getTime()/1000, 10), monthLogIndex: i,
                        key: log.min + ' min ' + log.notes, itemType: itemType.runData })    
    
    week = getWeekOfYear(log.date)
    // console.log('i', i)  // todo: remove i
  }
  // Add style for selected item
  dataFlatList[selectedItemIndex] = {...dataFlatList[selectedItemIndex], isSelected: true}

  const screenMonthAndYearStr = monthNames[Number(screenMonthAndYear.split('.')[0])-1] + ' ' +
                                Number(screenMonthAndYear.split('.')[1])


  const [selectedRunLogIndex, setSelectedRunLogIndex] = useState(-1); 
  onItemPress = (item, index) => {
    console.log('--- App:: onItemPress(): ');
    console.log('selected index', index);
    console.log('selected item', item);
    setSelectedItemIndex(index);
    console.log('monthLogs[index]', monthLogs[item.monthLogIndex].date)

    let runLogIndex = -1;
    for(const log of runLogs) {
      if(log.date === monthLogs[item.monthLogIndex].date) {
        console.log('found: log: ', log)
        runLogIndex = log.index;     
        setSelectedRunLogIndex(log.index)
      }
    }
    // let cloneRunLogs = [...runLogs]
    // cloneRunLogs[runLogIndex].min = 99
    // console.log('edited log: ', cloneRunLogs[runLogIndex])
    // setRunLogs(cloneRunLogs)
  }

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <Text style={styles.header}> {screenMonthAndYearStr} </Text>  
        <FlatList
          data={dataFlatList}
          renderItem={({item, index}) =>           
            <TouchableOpacity onPress={() => this.onItemPress(item, index)}>
              <Text style={[styles[item.itemType], item.isSelected ? styles.selectedItem : '']}> {item.key} </Text>
            </TouchableOpacity>
          }
        />
        <View style={{position: 'absolute', padding: 4, flexDirection: 'row', top: 500, left: 110}}>
          <Button title={"Prev"} onPress={onPrevButtonPress} color="#4733FF"/>        
          <Button title={"Next"} onPress={onNextButtonPress} color="#4733FF"/>
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

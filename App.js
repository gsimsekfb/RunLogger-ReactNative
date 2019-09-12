import React, {Fragment, useState} from 'react';
import {
  Image, StyleSheet, View, Text, FlatList, TouchableOpacity, 
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import AddEditDialog from './AddEditDialog';
import Modal from 'react-native-modal';

const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/*** Next 
  - timestamp and date redundant ??
  - 
***/

let progCounter = 0;
let gesture = null;
let lastSwipeId = 0;
const App = (gestureFromGR) => {
  console.log('\n\n')
  console.log('----- Debug: App Start -------', ++progCounter)  

  //// ---
  // const [gesture, setGesture] = useState(null);
  gesture = gesture === 'reset' ? null : gestureFromGR.gesture;  
  // console.log('----- App: gestureFromGR.gesture: ', gestureFromGR.gesture)  
  // console.log('----- App: gestureFromGR.swipeId: ', gestureFromGR.swipeId)  


  //// --- File 
  var RNFS = require('react-native-fs');
  // https://github.com/itinance/react-native-fs
  // console.log('RNFS: ' + RNFS.DocumentDirectoryPath)
  var path = RNFS.DocumentDirectoryPath + '/test1';

  function writeToFile(newRunLogs) {
    // console.log('aaa: ' + JSON.stringify(newRunLogs));    
    // Todo: Clear instead of delete
    RNFS.unlink(path).then(() => {
      console.log('FILE DELETED');
    })
    .catch((err) => { // `unlink` will throw an error, if the item to unlink does not exist
      console.log(err.message);
    });        
    RNFS.writeFile(path, JSON.stringify(newRunLogs), 'utf8')
      .then((success) => {
        console.log('FILE written: ' + path);        
        // console.log('Content: ' + newRunLogs.length);        
        // console.log('--- www: ' + runLogs[0].date);        
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  function readFromFile() {
    RNFS.readFile(path, 'utf8')
      .then((content) => {  // content: string
        console.log('--- App:: readFromFile() from ' + path)
        // console.log('--- App:: FILE content: ' + content);    
        const parsed = JSON.parse(content); // parsed: array
        // console.log('--- FILE parsed: ' + JSON.stringify(parsed));
        parsed.forEach( obj => obj.date = new Date(obj.timestamp*1000) );
        // return content;  // todo: how to use return from then()
        console.log('--- App:: setRunlogs() in readFromFile()..');
        setRunLogs(parsed)
      })
      .catch((err) => {
        console.log(err.message);
      });    
  }

  ////
  const [runLogs, setRunLogs] = useState([]);

  //// First app start
  if(progCounter === 1) {
    console.log('--- App:: Reading RunLogs from file..')
    readFromFile();
    // console.log('--- readFromFile: ' + readFromFile());   // Load Run Logs from file    
  }

  //// Todo: runLogs comes empty after wake up from sleep
  if(runLogs.length === 0 && progCounter > 1) {
    RNFS.readFile(path, 'utf8')
    .then((content) => {
      console.log('--- App:: readFile() from ' + path);
      const parsed = JSON.parse(content);
      parsed.forEach(obj => obj.date = new Date(obj.timestamp*1000));
      if(parsed.length) { // next: problems here
        console.log('--- App:: wake up from sleep, parsed.length: ' + parsed.length);
        console.log('--- App:: setRunlogs()');
        setRunLogs(parsed);
      }
    })
    .catch((err) => {
      console.log(err.message);
    });    
  }

  ////
  const now = new Date();  
  const currentMonthAndYear = String(now.getMonth()+1) + '.' + String(now.getFullYear())
  const [screenMonthAndYear, setScreenMonthAndYear] = useState(currentMonthAndYear);
  
  ///
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  const _hideAddEditDialog = () => {
    setShowAddEditDialog(false)
  }
  const [dataFromAddEditDialog, setDataFromAddEditDialog] = useState('')
  const _dataFromAddEditDialog = (data) => {  // AddEditDialog on Save button
    setShowAddEditDialog(false)
    setDataFromAddEditDialog(data)
    // console.log('--- App::_dataFromAddEditDialog:: dataFromAddEditDialog: ', dataFromAddEditDialog)
    // console.log('--- App::_dataFromAddEditDialog:: logToEdit: ', logToEdit)
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
    // console.log('--- ddd: ' + date);
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
  const [monthLogIndex, setMonthLogIndex] = useState(-1);   // monthLog array index of selected UI item
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);   // UI row index
  onItemPress = (item, index) => {
    console.log('--- App:: onItemPress(): item.monthLogIndex ' + item.monthLogIndex);
    console.log('--- App:: onItemPress(): index ' + index);
    if(item.itemType !== 'runData') return; 
    setSelectedItemIndex(index);  // UI
    setMonthLogIndex(item.monthLogIndex);
    setLogToEdit(monthLogs[item.monthLogIndex])
  }

  //// --- Gesture 
  // console.log('--- App:: gesture: ' + JSON.stringify(gesture));
  if(gesture === 'SWIPE_LEFT' && lastSwipeId !== gestureFromGR.swipeId) { 
    gesture = 'reset';
    lastSwipeId = gestureFromGR.swipeId;
    onNextButtonPress();
  }
  else if(gesture === 'SWIPE_RIGHT' && lastSwipeId !== gestureFromGR.swipeId) {
    gesture = 'reset';   
    lastSwipeId = gestureFromGR.swipeId;
    onPrevButtonPress();
  }

  //// --- Buttons
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

  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);

  function onDeleteButtonPress() {
    console.log(`--- App: Del button press`) 
    if(selectedItemIndex === -1) return;
    setShowConfirmDeleteDialog(true);
  } 

  function onConfirmDeleteDialog(deleteFile) {
    // console.log(`--- App: deleteFile: ` + deleteFile);
    setShowConfirmDeleteDialog(false);
    if(!deleteFile) return;
    let newRunLogs = [...runLogs];
    newRunLogs.splice(newRunLogs.findIndex(v => v.timestamp === logToEdit.timestamp) , 1);
    setRunLogs(newRunLogs)
    setSelectedItemIndex(-1)      
    setLogToEdit(null)
    writeToFile(newRunLogs);
  }

  const [logToEdit, setLogToEdit] = useState();  
  function onEditButtonPress() {
    // console.log(`Edit button press, selectedItemIndex: ` + selectedItemIndex);
    if(selectedItemIndex < 0) return; 
    if(!logToEdit) setLogToEdit(monthLogs[monthLogIndex]);
    setShowAddEditDialog(true)    
  }

  function onAddButtonPress() {
    console.log(`Add button press`);   
    setLogToEdit(null)
    setShowAddEditDialog(true)
  }  

  // Add or Edit from AddEditDialog
  if(dataFromAddEditDialog !== '') {
    let dateFromDatePicker = dataFromAddEditDialog.date;    
    // console.log('dataFromAddEditDialog: ' + JSON.stringify(dataFromAddEditDialog, null, 4) )
    // Note: The date from MyDatePicker comes as string if it comes from 
    // MyDatePicker::onDateChange() function
    if(dateFromDatePicker && !(dateFromDatePicker instanceof Date)) { 
      // console.log('dateFromDatePicker: ' + dateFromDatePicker)
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
      // console.log('--- App:: dataFromAddEditDialog', dataFromAddEditDialog)      
      console.log('--- App:: newLog', newLog)      
      let newRunLogs = [...runLogs];
      newRunLogs.splice(newRunLogs.findIndex(v => v.timestamp === logToEdit.timestamp) , 1);
      newRunLogs = [...newRunLogs, newLog].sort((a,b) => a.timestamp - b.timestamp)
      writeToFile(newRunLogs);
      setRunLogs(newRunLogs)
      setSelectedItemIndex(-1)      
      setLogToEdit(null)      
    }
    else {  // Add new log 
      const newRunLogs = [...runLogs, newLog].sort((a,b) => a.timestamp - b.timestamp);
      setRunLogs(newRunLogs)
      console.log('--- App:: Adding new log...')
      console.log('--- App:: newLog', newLog)      
      console.log('--- App:: Saving into file...')            
      writeToFile(newRunLogs);
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
      if(week !== getWeekOfYear(log.date)) 
        dataFlatList.push({ key: 'Week ' +  getWeekOfYear(log.date), itemType: itemType.week })

      const dateStr = log.date.getDate() + ' ' + monthNames[log.date.getMonth()].substring(0,3) + ', ' + 
                      days[log.date.getDay()];
      // Min, meter, notes
      const min = log.min === 0 ? '' : (log.min + ' min ');      
      const dis = log.distance === 0 ? '' : (', ' + log.distance + ' meters ');
      const notes =  log.notes === '' ? '' : '(' + log.notes + ')';
      dataFlatList.push({ timestamp: log.timestamp, monthLogIndex: i, key: dateStr + ' - ' + min + dis + 
                          notes, itemType: itemType.runData })    
      
      week = getWeekOfYear(log.date)
      // console.log('i', i)  // todo: remove i
    }
    // console.log("--- App:: dataFlatList: ", dataFlatList);

    // Add style for selected item
    dataFlatList[selectedItemIndex] = {...dataFlatList[selectedItemIndex], isSelected: true}
  }

  const screenMonthAndYearStr = monthNames[Number(screenMonthAndYear.split('.')[0])-1] + ' ' +
                                Number(screenMonthAndYear.split('.')[1]);  
  const todayDate = now.getDate() + ' ' + monthNames[now.getMonth()].substring(0,3) + ', ' + 
                    days[now.getDay()] + ', ' + now.getFullYear() + ' (Week ' +  getWeekOfYear(now) + ')';                                
                    
  return (
    <View style={{flex: 1}}>
      <Text style={styles.header}> {screenMonthAndYearStr} </Text>
      { (currentMonthAndYear === screenMonthAndYear) && 
        <Text style={{fontSize: 12, textAlign: 'center', backgroundColor: '#f2f2f2', padding: 2}}> 
          {'Today: ' + todayDate} 
         </Text> 
      }
      <FlatList
        data={dataFlatList}
        renderItem={({ item, index }) => {
          // console.log('--- App: item: ', item);
          return (
            <TouchableOpacity onPress={() => this.onItemPress(item, index)}>
              <Text style={[styles[item.itemType], item.isSelected ? styles.selectedItem : '']}> {item.key} </Text>
            </TouchableOpacity>
          )
        }
        }
        style={{ backgroundColor: '' }}
      />
      <View style={{ height: 60, padding: 2, flexDirection: 'row', backgroundColor: '#d9d9d9' }}>
        <TouchableOpacity style={styles.button} onPress={onPrevButtonPress}>
          <Image source={require('./left_arrow.png')} />
        </TouchableOpacity>     
        <TouchableOpacity style={styles.button} onPress={onNextButtonPress}>
          <Image source={require('./right_arrow.png')} />
        </TouchableOpacity>          
        <TouchableOpacity style={styles.button} onPress={onDeleteButtonPress}>
          <Image source={require('./delete.png')} />
        </TouchableOpacity>    
        <TouchableOpacity style={styles.button} onPress={onEditButtonPress}>
          <Image source={require('./edit.png')} />
        </TouchableOpacity>                    
        <TouchableOpacity style={styles.button} onPress={onAddButtonPress}>
          <Image source={require('./plus.png')} />
        </TouchableOpacity> 
      </View>
      { showAddEditDialog ?
        <AddEditDialog logToEdit={logToEdit} hideAddEditDialog={_hideAddEditDialog} sendData={_dataFromAddEditDialog} />
        : null
      }
      <Modal isVisible={showConfirmDeleteDialog}>      
        <View style={styles.confirmDeleteDialog}>
          <Text style={{fontSize: 18, margin: 0, textAlign: 'center'}}>  
              Are you sure to delete this run log?
          </Text>                                  
          <View style={{ marginTop: 40, flexDirection: 'row-reverse', backgroundColor: '',}}>
            <TouchableOpacity style={{marginLeft: 30}} onPress={() => onConfirmDeleteDialog(true)}>
              <Text style={{fontSize: 18}}> Yes </Text>
            </TouchableOpacity>                      
            <TouchableOpacity onPress={() => onConfirmDeleteDialog(false)}>
              <Text style={{fontSize: 18}}> No </Text>
            </TouchableOpacity>     
          </View>            
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 20,
    height: 32,
    backgroundColor: '#f2f2f2',
    padding: 2,
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
    fontSize: 16,
    height: 44,
    backgroundColor: "#d9d9d9",
  },    
  dayAndDate: {    
    padding: 10,
    fontSize: 14,
    height: 44,
    backgroundColor: "#d9d9d9",
  },    
  runData: {    
    padding: 10,
    fontSize: 14,
    height: 44,
    backgroundColor: "white",
  },
  selectedItem: {    
    backgroundColor: "#ccebff",
  },      
  button: {
    flex:1, alignItems:'center', justifyContent:'center', alignSelf:'stretch', margin:5
  },
  // Confirm Delete Dialog 
  confirmDeleteDialog: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default App;

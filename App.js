import React, {Fragment, useState} from 'react';
import {
  Image, StyleSheet, View, Text, FlatList, TouchableOpacity, 
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import RNFS from 'react-native-fs'; // https://github.com/itinance/react-native-fs
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';

import AddEditDialog from './src/AddEditDialog';
import Modal from 'react-native-modal';

const MONTH_NAMES = Object.freeze(["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"]);
const DAY_NAMES = Object.freeze(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

/*** Next 
  - RN disable warning runtime
  - Enable log runtime release build 
  - Choose run log file
***/

let progCounter = 0;
let gesture = null;
let lastSwipeId = 0;
const App = (gestureFromGR) => {
  console.log('\n\n')
  console.log('----- Debug: App Start -------: ' + ++progCounter)  

  //// --- File 
  const FILE_PATH = RNFS.DocumentDirectoryPath + '/test1';

  // Todo: Clear instead of delete (Update: Check later, no API to this currently)
  function writeToFile(newRunLogs) {
    RNFS.unlink(FILE_PATH).then(() => {
      console.log('FILE DELETED');
    })
    .catch((err) => { // `unlink` will throw an error, if the item to unlink does not exist
      console.log(err.message);
    });        
    RNFS.writeFile(FILE_PATH, JSON.stringify(newRunLogs), 'utf8')
      .then((success) => {
        console.log('FILE written: ' + FILE_PATH);        
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  function readRunLogsFromFile() {
    RNFS.readFile(FILE_PATH, 'utf8')
      .then((content) => {  // content: string
        console.log('--- App:: readRunLogsFromFile(): from ' + FILE_PATH)
        // console.log('--- App:: FILE content: ' + content);    
        const parsed = JSON.parse(content); // parsed: array
        // console.log('--- FILE parsed: ' + JSON.stringify(parsed));
        parsed.forEach( obj => obj.date = new Date(obj.timestamp*1000) );
        console.log('--- App:: readRunLogsFromFile(): will setRunlogs()');
        setRunLogs(parsed)
      })
      .catch((err) => {
        console.log(err.message);
      });   
  }

  //// First app start
  if(progCounter === 1) {
    console.log('--- App:: Reading RunLogs from file..')
    readRunLogsFromFile();
  }
  
  ////
  const [runLogs, setRunLogs] = useState([]);

  //// Todo: Code duplication here
  //// runLogs comes empty after wake up from sleep
  if(runLogs.length === 0 && progCounter > 1) {
    RNFS.readFile(FILE_PATH, 'utf8')
    .then((content) => {
      console.log('--- App:: Sleep check: readFile() from ' + FILE_PATH);
      const parsed = JSON.parse(content);
      parsed.forEach(obj => obj.date = new Date(obj.timestamp*1000));
      if(parsed.length) { // todo: problems here
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

  // AddEditDialog save button pressed
  const _dataFromAddEditDialog = (data) => {  
    setShowAddEditDialog(false)

    let dateFromDatePicker = data.date;    
    // Note: The date from MyDatePicker comes as string if it comes from 
    if(dateFromDatePicker && !(dateFromDatePicker instanceof Date)) { 
      const d = dateFromDatePicker.split('-')[0]
      const m = dateFromDatePicker.split('-')[1]
      const y = dateFromDatePicker.split('-')[2].split(' ')[0]
      const time = dateFromDatePicker.split(' ')[1]
      const hh = time.split(':')[0]
      const mm = time.split(':')[1]
      dateFromDatePicker = new Date(y,m-1,d,hh,mm);
    }
       
    const newLog = { // next: Get Date() object from DatePicker      
      timestamp: parseInt(dateFromDatePicker.getTime()/1000, 10),
      date: dateFromDatePicker, min: data.min, 
      distance: data.distance, notes: data.notes 
    }
    if(logToEdit !== null) { // Edit (delete and re-create) existing log
      console.log('--- App:: Editing existing log ...')        
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
      writeToFile(newRunLogs);
    }
  }

  function weekOfYear(date) {
    const onejan = new Date(date.getFullYear(), 0, 1);
    return( Math.ceil( (((date - onejan) / 86400000) + onejan.getDay() + 1) / 7 ) );
  }

  // returns: '7.2019'
  function getMonthAndYear(date) {
    return (date.getMonth() + 1 + '.' + date.getFullYear())
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
    if(item.type !== 'runData') return; 
    setSelectedItemIndex(index);  // UI
    setMonthLogIndex(item.monthLogIndex);
    setLogToEdit(monthLogs[item.monthLogIndex])
  }

  //// --- Gesture 
  gesture = (gesture === 'reset') ? null : gestureFromGR.gesture;    
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

  function getMonthLogs(monthAndYear /* e.g. 7.2019 */) { 
    let monthLogs = []
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
  const ITEM_TYPE = Object.freeze({ week: "week", dayAndDate: "dayAndDate", runData: "runData" });    
  let dataFlatList = []
  if(monthLogs && monthLogs.length > 0) {
    let week = weekOfYear(monthLogs[0].date)
    dataFlatList.push({ key: 'Week ' + weekOfYear(monthLogs[0].date), type: ITEM_TYPE.week })
    for (const [i, log] of monthLogs.entries()) {
      if(week !== weekOfYear(log.date)) 
        dataFlatList.push({ key: 'Week ' +  weekOfYear(log.date), type: ITEM_TYPE.week })

      const dateStr = log.date.getDate() + ' ' + MONTH_NAMES[log.date.getMonth()].substring(0,3) + ', ' + 
                      DAY_NAMES[log.date.getDay()];
      // Min, meter, notes
      const min = log.min === 0 ? '' : (log.min + ' min ');      
      const dis = log.distance === 0 ? '' : (', ' + log.distance + ' meters ');
      const notes =  log.notes === '' ? '' : '(' + log.notes + ')';
      dataFlatList.push({ timestamp: log.timestamp, monthLogIndex: i, key: dateStr + ' - ' + min + dis + 
                          notes, type: ITEM_TYPE.runData })    
      
      week = weekOfYear(log.date)
    }
    // console.log("--- App:: dataFlatList: ", dataFlatList);

    // Add style for selected item
    dataFlatList[selectedItemIndex] = {...dataFlatList[selectedItemIndex], isSelected: true}
  }

  const screenMonthAndYearStr = MONTH_NAMES[Number(screenMonthAndYear.split('.')[0])-1] + ' ' +
                                Number(screenMonthAndYear.split('.')[1]);  
  const todayDate = now.getDate() + ' ' + MONTH_NAMES[now.getMonth()].substring(0,3) + ', ' + 
                    DAY_NAMES[now.getDay()] + ', ' + now.getFullYear() + ' (Week ' +  weekOfYear(now) + ')';                                

  //// Three dots menu
  let _menu = null;

  setMenuRef = ref => _menu = ref;
  showMenu = () => _menu.show();

  onEditMenuPress = () => {
    _menu.hide();
    onEditButtonPress();
  };

  onDeleteMenuPress = () => {
    _menu.hide();
    onDeleteButtonPress();
  };  


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
        renderItem={ ({ item, index }) => {
          return (
            <View style={{flex:1, flexDirection: 'row'}}>
              <TouchableOpacity style={{flex:1, flexDirection: 'row'}} 
                                onPress={() => onItemPress(item, index)}>
                { 
                  (item.type === ITEM_TYPE.runData) && 
                  <Image source={require('./src/icons/running_man.png')} /> 
                }
                <Text style={[styles[item.type], item.isSelected ? styles.selectedItem : '']}> 
                  {item.key} 
                </Text>
              </TouchableOpacity>
              {
              (item.type === ITEM_TYPE.runData &&  item.isSelected) && 
              <View style={{width: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ccebff'}}>
                <Menu
                  ref={setMenuRef}
                  button={
                    <TouchableOpacity onPress={showMenu}>
                      <Image source={require('./src/icons/three_dots.png')} style={{justifyContent: 'center'}}/>
                    </TouchableOpacity>
                  }
                >
                  <MenuItem onPress={onEditMenuPress}> Edit </MenuItem>
                  <MenuDivider/>
                  <MenuItem onPress={onDeleteMenuPress}> Delete </MenuItem>
                </Menu>     
              </View>   
              }
            </View>           
          )
        } }
        style={{ backgroundColor: '' }}
      />
      <View style={{ height: 60, padding: 2, flexDirection: 'row', backgroundColor: '#d9d9d9' }}>
        <TouchableOpacity style={styles.button} onPress={onDeleteButtonPress}>
          <Image source={require('./src/icons/delete.png')} />
        </TouchableOpacity>    
        <TouchableOpacity style={styles.button} onPress={onEditButtonPress}>
          <Image source={require('./src/icons/edit.png')} />
        </TouchableOpacity>                    
        <TouchableOpacity style={styles.button} onPress={onAddButtonPress}>
          <Image source={require('./src/icons/plus.png')} />
        </TouchableOpacity> 
        <TouchableOpacity style={styles.button} onPress={onPrevButtonPress}>
          <Image source={require('./src/icons/left_arrow.png')} />
        </TouchableOpacity>     
        <TouchableOpacity style={styles.button} onPress={onNextButtonPress}>
          <Image source={require('./src/icons/right_arrow.png')} />
        </TouchableOpacity>        
      </View>
      { showAddEditDialog &&
        <AddEditDialog 
          logToEdit={logToEdit} hideAddEditDialog={_hideAddEditDialog} sendData={_dataFromAddEditDialog} 
        />        
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
    flex: 1,
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
    flex: 1,
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

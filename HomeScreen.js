import React, {useState} from 'react';
import {
  Image, StyleSheet, View, Text, FlatList, TouchableOpacity
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import RNFS from 'react-native-fs'; // https://github.com/itinance/react-native-fs
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import DeviceInfo from 'react-native-device-info'
import GestureRecognizer from 'react-native-swipe-gestures';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationEvents } from 'react-navigation';

import AddEditDialog from './src/AddEditDialog';
import Modal from 'react-native-modal';
import {SETTING_KEYS, saveSetting} from './src/Settings';

const MONTH_NAMES = Object.freeze(["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"]);
const DAY_NAMES = Object.freeze(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

const DEFAULT_FILE_PATH = RNFS.DocumentDirectoryPath + '/test1';
  // DEFAULT_FILE_PATH: /data/user/0/com.runlogger/files/test1

/* Todos 
  - Global vars (sol: ctor?)
  - DateTime Spinner problem on phy. device (react native android 7.0 datepicker calendar spinner)
  - Simplify homescreen: sol: Forward dec.?
  - google, fb login
  - Settings too many renders
  - Async ops
  - Enable log runtime release build 
  - Choose run log file
  - Hooks how to ctor or dtor effect 

  Next
  - Load from settings file   
 */

let progCounter = 0;
let lastItemPress = 0;
let fileToLoadSaveRunLogs = null;

const App = ({navigation}) => {
  console.log('\n\n')
  console.log('----- Debug: App Start -------: ' + ++progCounter)   
  console.log('--- App:: fileToLoadSaveRunLogs: ' + fileToLoadSaveRunLogs);
      
  //// State variables 
  const [runLogs, setRunLogs] = useState([]);
  //
  const now = new Date();  
  const currentMonthAndYear = String(now.getMonth()+1) + '.' + String(now.getFullYear())
  const [screenMonthAndYear, setScreenMonthAndYear] = useState(currentMonthAndYear);
  //
  const [showAddEditDialog, setShowAddEditDialog] = useState(false);
  // Item Press
  const [monthLogIndex, setMonthLogIndex] = useState(-1);         // monthLog array index of selected UI item
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1); // UI row index
  //
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [logToEdit, setLogToEdit] = useState();  

  //// Logging
  disableYellowBoxWarnings();

  //// New s_fileToSaveRunLogs comes from Settings screen
  const s_fileToSaveRunLogs = navigation.getParam('s_fileToSaveRunLogs')
  if(s_fileToSaveRunLogs && s_fileToSaveRunLogs !== fileToLoadSaveRunLogs) {
    changeRunLogFile(s_fileToSaveRunLogs, runLogs);
  }

  async function loadRunLogsFromFile() {
    console.log('--- App:: Reading RunLogs from file..')
    setRunLogs(await readRunLogsFromFile());
  }

  //// First app start
  if(progCounter === 1) 
    loadRunLogsFromFile();

  //// Todo: Code duplication here
  //// runLogs comes empty after wake up from sleep
  // if(runLogs.length === 0 && progCounter > 1) {
  //   RNFS.readFile(FILE_PATH, 'utf8')
  //   .then((content) => {
  //     console.log('--- App:: Sleep check: readFile() from ' + FILE_PATH);
  //     const parsed = JSON.parse(content);
  //     parsed.forEach(obj => obj.date = new Date(obj.timestamp*1000));
  //     if(parsed.length) { // todo: problems here
  //       console.log('--- App:: wake up from sleep, parsed.length: ' + parsed.length);
  //       console.log('--- App:: setRunlogs()');
  //       setRunLogs(parsed);
  //     }
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //   });    
  // }

  // Add or edit new log (AddEditDialog save button pressed)
  function addOrEditNewLog (newLog) {  
    setShowAddEditDialog(false);
    const dateFromDatePicker = getDateObjFromDateStr(newLog.date);    
    const newLogEdited = { // next: Get Date() object from DatePicker      
      timestamp: parseInt(dateFromDatePicker.getTime()/1000, 10),
      date: dateFromDatePicker, min: newLog.min, 
      distance: newLog.distance, notes: newLog.notes 
    }
    if(logToEdit !== null) { // Edit (delete and re-create) existing log
      console.log('--- App:: Editing existing log ...')        
      let newRunLogs = [...runLogs];
      newRunLogs.splice(newRunLogs.findIndex(v => v.timestamp === logToEdit.timestamp) , 1);
      newRunLogs = [...newRunLogs, newLogEdited].sort((a,b) => a.timestamp - b.timestamp)
      writeToFile(newRunLogs);
      setRunLogs(newRunLogs)
      setSelectedItemIndex(-1)      
      setLogToEdit(null)      
    }
    else {  // Add new log 
      const newRunLogs = [...runLogs, newLogEdited].sort((a,b) => a.timestamp - b.timestamp);
      setRunLogs(newRunLogs)
      console.log('--- App:: Adding new log...')          
      writeToFile(newRunLogs);
    }
  }
  
  function onItemPress(item, index) {
    if(item.type !== 'runData') 
      return; 

    // Double tap
    const time = new Date().getTime();
    const delta = time - lastItemPress;
    const DOUBLE_PRESS_DELAY = 400;
    if (delta < DOUBLE_PRESS_DELAY) // Success double press
      showThreeDotMenu();
    
    lastItemPress = time;
    
    //
    setSelectedItemIndex(index);  // UI
    setMonthLogIndex(item.monthLogIndex);
    setLogToEdit(monthLogs[item.monthLogIndex])
  }

  function onItemPressLong(item, index) {
    if(item.type !== 'runData' || selectedItemIndex !== index) 
      return; 

    showThreeDotMenu();
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

  //// --- Create data for flatlist
  console.log("--- App:: create data for FlatList ---")
  const monthLogs = getMonthLogs( screenMonthAndYear, runLogs );
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
                 
  //// 
  function lastRunStr() {
    if(runLogs.length < 1) return '';
    const lastRunDate = runLogs[runLogs.length-1].date;
    const ONE_DAY = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds    
    const dayDiff = Math.round(Math.abs((lastRunDate - now) / ONE_DAY));
    if(dayDiff < 1) return 'Today';

    const weekStr = dayDiff < 7 ? '' : Math.floor(dayDiff/7) + (Math.floor(dayDiff/7) > 1 ? ' weeks' : ' week');
    const dayStr = dayDiff%7 < 1 ? '' : (dayDiff%7 + (dayDiff%7 > 1 ? ' days' : ' day'));
    const comma = weekStr !== '' && dayStr !== '' ? ', ' : '';
    const lastRunStr = weekStr + comma + dayStr + ' ago';   
    return lastRunStr; 
  }

  //// Three dots menu
  let _menuThreeDot = null;

  setMenuRef = ref => _menuThreeDot = ref;
  showThreeDotMenu = () => _menuThreeDot.show();

  onEditMenuPress = () => {
    _menuThreeDot.hide();
    onEditButtonPress();
  };

  onDeleteMenuPress = () => {
    _menuThreeDot.hide();
    onDeleteButtonPress();
  };  

  //// GestureRecognizer
  const GR_CONFIG = {
    velocityThreshold: 0.1,
    directionalOffsetThreshold: 40
  };

  function onSwipe(gestureName, gestureState) {        
    if(gestureName === 'SWIPE_LEFT') onNextButtonPress();
    else if(gestureName === 'SWIPE_RIGHT') onPrevButtonPress();
  }

  return (
    <GestureRecognizer style={{flex: 1}} config={GR_CONFIG}
      onSwipe={(direction, state) => onSwipe(direction, state)}      
    >
      <Text style={styles.header}> {screenMonthAndYearStr} </Text>
      { (currentMonthAndYear === screenMonthAndYear) && 
        <View style={{backgroundColor: '#f2f2f2', paddingBottom: 4}}>
          <Text style={{fontSize: 12, textAlign: 'center', backgroundColor: '#f2f2f2'}}> 
            {'Today: ' + todayDate}           
          </Text> 
          <Text style={{fontSize: 12, textAlign: 'center', backgroundColor: '#f2f2f2'}}> 
            {'Last run: ' + lastRunStr()} 
          </Text>         
        </View>
      }
      <FlatList
        data={dataFlatList}
        renderItem={ ({ item, index }) => {
          return (
            <View style={{flex:1, flexDirection: 'row'}}>
              <TouchableOpacity 
                style={{flex:1, flexDirection: 'row', alignItems: 'center', 
                        backgroundColor: item.isSelected ? styles.selectedItem.backgroundColor : 'white' }} 
                onPress={() => onItemPress(item, index)}  
                onLongPress={() => onItemPressLong(item, index)}
              >
                { 
                  (item.type === ITEM_TYPE.runData) && 
                  <Image source={require('./src/icons/running.png')} style={{marginLeft: 6}}/> 
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
                    <TouchableOpacity onPress={showThreeDotMenu}>
                      <Image source={require('./src/icons/three_dots_2.png')} style={{justifyContent: 'center'}}/>
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
        <TouchableOpacity style={styles.button} onPress={ () => navigation.navigate('Settings', {name: 'Settings'}) }>
          <Image source={require('./src/icons/settings.png')} />
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
          logToEdit={logToEdit} hideAddEditDialog={() => setShowAddEditDialog(false)} sendData={addOrEditNewLog} 
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
    </GestureRecognizer>
  );
};

App.navigationOptions = {
  header: null
}

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

//// -------------------- Functions

function getDateObjFromDateStr(date) {
  if(date && date instanceof Date) return date;    
  // Note: The date from MyDatePicker comes as string     
  const d = date.split('-')[0];
  const m = date.split('-')[1];
  const y = date.split('-')[2].split(' ')[0];
  const time = date.split(' ')[1];
  const hh = time.split(':')[0];
  const mm = time.split(':')[1];
  return(new Date(y,m-1,d,hh,mm));    
} 

const readRunLogsFromFile = async () => {
  try {
    console.log('--- App:: readRunLogsFromFile()');
    const _fileToSaveRunLogs = await AsyncStorage.getItem(SETTING_KEYS.fileToSaveRunLogs);
    fileToLoadSaveRunLogs = (_fileToSaveRunLogs ? _fileToSaveRunLogs : DEFAULT_FILE_PATH);
    return(await _readRunLogsFromFile(fileToLoadSaveRunLogs));
  } catch (err) {
    console.log('--- App:: Error reading value, err: ' + err);
  }
  return [];
}

async function _readRunLogsFromFile(file) {
  let logsFromFile = null
  await RNFS.readFile(file, 'utf8')
    .then((content) => {  // content: string
      console.log('--- App:: _readRunLogsFromFile(): from ' + file)
      // console.log('--- App:: FILE content: ' + content);    
      const parsed = JSON.parse(content); // parsed: array
      // console.log('--- FILE parsed: ' + JSON.stringify(parsed));
      parsed.forEach( obj => obj.date = new Date(obj.timestamp*1000) );
      console.log('--- App:: _readRunLogsFromFile(): will setRunlogs()');
      logsFromFile = parsed;
      // setRunLogs(parsed)
    })
    .catch((err) => {
      console.log('_readRunLogsFromFile: error: ' + err.message);
    });   
    return logsFromFile;
}

// Todo: Clear instead of delete (Update: Check later, no API to this currently)
async function writeToFile(newRunLogs) {
  let result = false;
  await RNFS.unlink(fileToLoadSaveRunLogs).then(() => {
    console.log('FILE DELETED');
  })
  .catch(err => { // `unlink` will throw an error, if the item to unlink does not exist
    console.log('writeToFile()-1: ' + err.message);
  });        

  await RNFS.writeFile(fileToLoadSaveRunLogs, JSON.stringify(newRunLogs), 'utf8')
  .then(success => {
    console.log('Runlogs WRITTEN to file: ' + fileToLoadSaveRunLogs);        
    result = true;
  })
  .catch(err => {
    console.log('writeToFile()-2: ' + err.message);
  });    
  return result;
}

async function changeRunLogFile(new_fileToSaveRunLogs, runLogs) {
  console.log('--- App:: changeRunLogFile() to new file: ' + new_fileToSaveRunLogs);
  fileToLoadSaveRunLogs = new_fileToSaveRunLogs;
  const result = await writeToFile(runLogs);
  if(result) 
    await saveSetting(SETTING_KEYS.fileToSaveRunLogs, fileToLoadSaveRunLogs);
  else {
    console.log('--- App:: changeRunLogFile() failed. Error: Cannot write to new file'); 
    return;
  }
  console.log('--- App:: changeRunLogFile() completed with success');
}

function disableYellowBoxWarnings() {
  // console.disableYellowBox = true;
  // // a) Async
  // DeviceInfo.isEmulator().then(isEmulator => {    
  //   console.disableYellowBox = isEmulator ? false : true;
  // });
  // b) Sync
  if(progCounter === 1)
    console.disableYellowBox = DeviceInfo.isEmulatorSync() ? false : true;
}

function weekOfYear(date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  return( Math.ceil( (((date - onejan) / 86400000) + onejan.getDay() + 1) / 7 ) );
}

function getMonthLogs(monthAndYear /* e.g. 7.2019 */, runLogs) { 
  let monthLogs = []
  for (const log of runLogs) {  
    if (monthAndYear === getMonthAndYear(log.date)) {
      monthLogs.push(log);
    }
  }
  return monthLogs;
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

export default App;

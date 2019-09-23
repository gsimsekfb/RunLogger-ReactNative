
import React, {useState, useEffect} from 'react';
import {
  StyleSheet, View, Text, TextInput, Image, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import RNFileSelector from 'react-native-file-selector';

let programCounter = 0

const Settings = ({navigation}) => {

  ++programCounter;
  console.log('--- Settings:: programCounter: ' + programCounter);

  const [loggingEnabled, setLoggingEnabled] = useState(false);
  const [fileToSaveRunLogs, setFileToSaveRunLogs] = useState(null);

  const MARGIN_BOTTOM = 20;
  const HAIRLINE_WIDTH = StyleSheet.hairlineWidth
  const SETTING_KEYS = { loggingEnabled: '@loggingEnabled', fileToSaveRunLogs: '@fileToSaveRunLogs' };

  saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
        console.log('Saving error, err: ' + err);
    }
  }

  fetchSettings = async () => {
    try {
      const _loggingEnabled = await AsyncStorage.getItem(SETTING_KEYS.loggingEnabled) === 'true';
      const _fileToSaveRunLogs = await AsyncStorage.getItem(SETTING_KEYS.fileToSaveRunLogs);
      // console.log('loggingEnabled: ' + loggingEnabled);
      // console.log('_loggingEnabled: ' + _loggingEnabled);
      // console.log('fileToSaveRunLogs: ' + fileToSaveRunLogs);
      // console.log('_fileToSaveRunLogs: ' + _fileToSaveRunLogs);

      if(_loggingEnabled !== loggingEnabled) {
        // console.log('qqqqq');
        setLoggingEnabled(_loggingEnabled);
      }
      if(_fileToSaveRunLogs !== fileToSaveRunLogs) {
        // console.log('wwwww');
        setFileToSaveRunLogs(_fileToSaveRunLogs);
      }
    } catch (err) {
      console.log('Error reading value, err: ' + err);
    }
  }

  function onEnableLoggingPress() {
    setLoggingEnabled(!loggingEnabled);
    saveSetting(SETTING_KEYS.loggingEnabled, (!loggingEnabled).toString());
  }

  function onChooseFilePress() {    
    RNFileSelector.Show(
      {
        title: 'Select File',
        onDone: (path) => {
            console.log('file selected: ' + path)
            setFileToSaveRunLogs(path);
            saveSetting(SETTING_KEYS.fileToSaveRunLogs, path);
        },
        onCancel: () => {
            console.log('cancelled')
        }
      }
    );
  }

  fetchSettings();

  return (
    <View style={styles.content}>
      <Text style={{fontSize: 16, marginBottom: 10}}>  
          Choose file to save run logs
      </Text>           
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: MARGIN_BOTTOM}}>
        <TextInput
          style={styles.textInput}
          onChangeText={ text => setDistance(text) }            
          value={fileToSaveRunLogs}
          placeholder='e.g. /data/tmp'
        />
        <TouchableOpacity style={styles.button} onPress={onChooseFilePress}>
          <Image source={require('./icons/folder.png')} style={{marginLeft: 14}}/> 
        </TouchableOpacity>
      </View >   
      <View style={{ borderBottomColor: 'grey', borderBottomWidth: HAIRLINE_WIDTH, marginBottom: 10 }} />               
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>        
        <Text style={{flex:1, fontSize: 16}}> 
          Enable logging
        </Text>            
        <TouchableOpacity style={styles.button} onPress={onEnableLoggingPress}>
          { loggingEnabled ? <Image source={require('./icons/enable.png')} style={{marginLeft: 14}}/> 
                            : <Image source={require('./icons/disable.png')} style={{marginLeft: 14}}/> 
          }
        </TouchableOpacity>
      </View >          
      <View style={{ borderBottomColor: 'gray', borderBottomWidth: HAIRLINE_WIDTH, marginBottom: 10 }} />         
    </View>
  );
}

Settings.navigationOptions = {
  title: 'Settings',
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    flexDirection: 'column',      
    // backgroundColor: 'green',
  },
  content: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  textInput: {
    flex:1, height: 40, fontSize: 16, borderColor: 'gray', borderWidth: 1
  }    
  });
  
export default Settings;
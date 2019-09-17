
import React from 'react';
import {
  StyleSheet, View, Text, TextInput, Image
} from 'react-native';

  const Settings = ({navigation}) => {

    const MARGIN_BOTTOM = 20;

    return (
      <View style={styles.content}>
        <Text style={{fontSize: 16, marginBottom: 10}}>  
            Choose database file path
        </Text>           
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: MARGIN_BOTTOM}}>
          <TextInput
            style={styles.textInput}
            onChangeText={ text => setDistance(text) }            
            value={''}
            placeholder='e.g. /data/tmp'
          />
          <Image source={require('./icons/folder.png')} style={{marginLeft: 14}}/> 
        </View >          
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: MARGIN_BOTTOM}}>        
          <Text style={{flex:1, fontSize: 16}}> 
            Enable logging
          </Text>            
          <Image source={require('./icons/disable.png')} style={{marginLeft: 14}}/> 
        </View >          
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
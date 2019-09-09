import React, {Fragment, useState} from 'react';
import {
  Image, StyleSheet, ScrollView, View, Text, StatusBar, TextInput,
  TouchableHighlight, FlatList, TouchableOpacity, Button
} from 'react-native';
import Modal from 'react-native-modal';
import MyDatePicker from './src/MyDatePicker';

const AddEditDialog = ({ logToEdit, hideAddEditDialog, sendData }) => {
    const debug = 0
    const green = debug ? 'green' : ''
    const yellow = debug ? 'yellow' : ''
  
    console.log('--- AddEditDialog:: logToEdit', logToEdit)

    const isAddDialog = (logToEdit === null)
    console.log('--- AddEditDialog:: isAddDialog', isAddDialog)
  
    // const [modalVisible, setModalVisible]= useState(true)
    const [min, setMin]= useState(isAddDialog ? '' : String(logToEdit.min))
    const [distance, setDistance]= useState(isAddDialog ? '' : String(logToEdit.distance))
    const [notes, setNotes]= useState(isAddDialog ? '' : logToEdit.notes)
    const initialDate = isAddDialog ? new Date() : logToEdit.date;
    const [dateFromDatePicker, setDateFromDatePicker] = useState(null);
  
    const _dataFromDatePicker = (data) => {    
      console.log('--- AddEditDialog::_dataFromDatePicker:: data: ', data)
      setDateFromDatePicker(data);
    }

    function onSave() {
      const minFinal = min.includes('+') 
        ? Number(min.substr(0, min.indexOf('+'))) + Number(min.substr(min.indexOf('+')+1, min.length)) 
        : Number(min);                
      let notesFinal = min.includes('+') ? min + (notes === '' ? '' : ' , ' + notes) : notes
      sendData( {date: dateFromDatePicker, min: minFinal, distance: Number(distance), notes: notesFinal } )
      console.log('--- AddEditDialog::save() pressed')        
    }
  
    const MARGIN_BOTTOM = 10;

    return(
        <Modal
          isVisible={true}
          onBackdropPress={() => hideAddEditDialog()}
        >
          <View style={styles.content}>
            <Text style={{fontSize: 18, marginBottom: 18, textAlign: 'center'}}> Add Log </Text>           
            <View style={{flexDirection: 'row', marginBottom: MARGIN_BOTTOM }}>
              {/* <Text style={{fontSize: 16}}> Date: </Text> */}
              <MyDatePicker initialDate={initialDate} sendData={_dataFromDatePicker}/>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: MARGIN_BOTTOM}}>
              {/* <Text style={{fontSize: 16}}> Distance: </Text> */}
              <TextInput
                style={{height: 40, width: 80, color: 'grey', fontSize: 16, borderColor: 'gray', borderWidth: 1}}
                onChangeText={ text => setDistance(text) }
                keyboardType={'number-pad'}
                value={distance}
                placeholder='Distance'
              />
              <Text style={{fontSize: 16}}> meters </Text>            
            </View>          
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: MARGIN_BOTTOM}}>
              {/* <Text style={{fontSize: 16}}> Duration: </Text> */}
              <TextInput
                style={{height: 40, width: 80, color: 'grey', fontSize: 16, borderColor: 'gray', borderWidth: 1}}
                onChangeText={ text => { if(text.endsWith(' ')) text = text.replace(' ', '+'); setMin(text);} }
                value={min}
                placeholder='Duration'
              />
              <Text style={{fontSize: 16}}> minutes </Text>            
            </View>            
            <View style={{flexDirection: 'row', marginBottom: MARGIN_BOTTOM}}>
              {/* <Text style={{fontSize: 16}}> Notes: </Text> */}
              <TextInput
                style={{flex:1, height: 40, color: 'grey', fontSize: 16, borderColor: 'gray', borderWidth: 1}}
                onChangeText={ text => setNotes(text) }
                value={notes}
                placeholder='Notes'
              />
            </View>                 
            <View style={{ padding: 2, flexDirection: 'row-reverse', backgroundColor: '',}}>
              <TouchableOpacity style={styles.button} onPress={onSave}>
                <Text style={{fontSize: 18}}> Save </Text>
              </TouchableOpacity>                      
              <TouchableOpacity style={styles.button} onPress={hideAddEditDialog}>
                <Text style={{fontSize: 18}}> Cancel </Text>
              </TouchableOpacity>     
            </View>            
          </View>
        </Modal>
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'green',
    },
    content: {
      backgroundColor: 'white',
      padding: 20,
      margin: 10,
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    contentTitle: {
      fontSize: 16,
      marginBottom: 12,
    },
    button: {
        // flex:1, alignItems:'center', justifyContent:'center', alignSelf:'stretch', margin:5
      }    
   });

  export default AddEditDialog;
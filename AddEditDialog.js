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
  
    return(
      <View style={styles.container}>
        <Modal
          isVisible={true}
          onBackdropPress={() => hideAddEditDialog()}
        >
          <View style={styles.content}>
            <View style={{flexDirection: 'row', backgroundColor: yellow }}>
              <Text style={{fontSize: 20}}> Date: </Text>
              <MyDatePicker initialDate={initialDate} sendData={_dataFromDatePicker}/>
            </View>
            <View style={{flexDirection: 'row', backgroundColor: yellow}}>
              <Text style={{fontSize: 20}}> Distance: </Text>
              <TextInput
                style={{height: 40, width: 80, borderColor: 'gray', borderWidth: 1}}
                onChangeText={ text => setDistance(text) }
                keyboardType={'number-pad'}
                value={distance}
              />
              <Text style={{fontSize: 20}}> meters </Text>            
            </View>          
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 20}}> Duration: </Text>
              <TextInput
                style={{height: 40, width: 80, borderColor: 'gray', borderWidth: 1}}
                onChangeText={ text => { if(text.endsWith(' ')) text = text.replace(' ', '+'); setMin(text);} }
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
                const minFinal = min.includes('+') 
                  ? Number(min.substr(0, min.indexOf('+'))) + Number(min.substr(min.indexOf('+')+1, min.length)) 
                  : Number(min);                
                let notesFinal = min.includes('+') ? min + (notes === '' ? '' : ' , ' + notes) : notes
                sendData( {date: dateFromDatePicker, min: minFinal, distance: Number(distance), notes: notesFinal } )
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
    },
    content: {
      backgroundColor: 'white',
      padding: 22,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    contentTitle: {
      fontSize: 20,
      marginBottom: 12,
    },
   });

  export default AddEditDialog;
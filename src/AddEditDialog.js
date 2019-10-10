import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity
} from 'react-native';
import Modal from 'react-native-modal';
import MyDatePicker from './MyDatePicker';

const AddEditDialog = ({ logToEdit, hideAddEditDialog, sendData }) => {

    const [firstLoad, setFirstLoad] = useState(true);
    const inputRef = useRef(null);
    useEffect(                
      () => { 
        if(firstLoad) {            
            inputRef.current.focus();
            setFirstLoad(false);
        }
      }
    );        

    const isAddDialog = (logToEdit === null)
    const [min, setMin]= useState(isAddDialog ? '' : String(logToEdit.min))
    const [distance, setDistance]= useState(isAddDialog ? '' : String(logToEdit.distance))
    const [notes, setNotes]= useState(isAddDialog ? '' : logToEdit.notes)
    const initialDate = isAddDialog ? new Date() : logToEdit.date;
    const [dateFromDatePicker, setDateFromDatePicker] = useState(null);
  
    const _dataFromDatePicker = (data) => {    
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

    function onDurationChange(text) {
      if(text.endsWith(' ')) text = text.replace(' ', '+'); 
      setMin(text);
    }
  
    const MARGIN_BOTTOM = 10;

    return(
      <Modal
        style={styles.container}
        isVisible={true}
        onBackdropPress={() => hideAddEditDialog()}
        onBackButtonPress={() => hideAddEditDialog() }
      >
        <View style={styles.content}>
          <Text style={{fontSize: 18, marginBottom: 18, textAlign: 'center'}}>  
              { (isAddDialog ? 'Add' : 'Edit') + ' Log' }
          </Text>           
          <View style={{flexDirection: 'row', marginBottom: MARGIN_BOTTOM }}>
            <MyDatePicker initialDate={initialDate} sendData={_dataFromDatePicker}/>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: MARGIN_BOTTOM}}>
            <TextInput
              style={styles.textInput}
              onChangeText={ text => setDistance(text) }
              keyboardType={'number-pad'}
              value={distance}
              placeholder='Distance'
            />
            <Text style={{fontSize: 16}}> meters </Text>            
          </View>          
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: MARGIN_BOTTOM}}>
            <TextInput
              style={styles.textInput}
              onChangeText={ text => onDurationChange(text) }
              value={min}
              placeholder='Duration'
              ref={inputRef}
            />
            <Text style={{fontSize: 16}}> minutes </Text>            
          </View>            
          <View style={{flexDirection: 'row', marginBottom: MARGIN_BOTTOM}}>
            <TextInput
              style={styles.textInput}
              onChangeText={ text => setNotes(text) }
              value={notes}
              placeholder='Notes'
            />
          </View>                 
          <View style={{ padding: 2, flexDirection: 'row-reverse', backgroundColor: '',}}>
            <TouchableOpacity style={{marginLeft: 14}} onPress={onSave}>
              <Text style={{fontSize: 18}}> Save </Text>
            </TouchableOpacity>                      
            <TouchableOpacity onPress={hideAddEditDialog}>
              <Text style={{fontSize: 18}}> Cancel </Text>
            </TouchableOpacity>     
          </View>            
        </View>
      </Modal>
    )
  }

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

  export default AddEditDialog;
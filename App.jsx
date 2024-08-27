import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import { checkManagePermission, requestManagePermission } from 'manage-external-storage';

const StatusDownloaderApp = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Function to open document picker
  const openDocumentPicker = async () => {
    const permissionGranted = await requestStoragePermission();
    if (!permissionGranted) {
      console.log('Storage Permission Denied.');
      return;
    }

    try {
      const res = await DocumentPicker.pickDirectory({
        type: [DocumentPicker.types.allFiles],
        readContent: true,
      });

      // Output the file URI and other details
      console.log('1 ' + res);
      console.log('1 ' + res.uri);

      console.log(JSON.stringify(res));

      // try {
      //   let dirURL='/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/.Statuses/';
      //   console.log('1 ');
      //   RNFS.readDir(dirURL)
      //     .then(result => {
      //       console.log('1 GOT RESULT', result);
      //       result.forEach(file => {
      //         console.warn(file.name);
      //       });
      //     })
      //     .catch(err => {
      //       console.log('1 ' + err.message, err.code);
      //     });
      // } catch (err) {
      //   console.warn('One' + err);
      // }

      let dirURL= '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/.Statuses/';

      const files = await RNFS.readDir(dirURL);
      console.log('Files =>', files); // Log files


      RNFetchBlob.fs.ls(dirURL)
      .then((files) => {
        console.log('Files:', files); // Log files
        if (files.length === 0) {
          console.log('No files found in directory');
        } else {
          const imageFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.mp4'));
          console.log('Image Files:', imageFiles); // Log filtered image files
          setStatuses(imageFiles.map(file => ({ path: `${statusDirectory}/${file}`, name: file })));
        }
      })
      .catch(err => {
        console.log('Error reading directory:', err);
        setError('Error reading directory');
      });


    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker.');
      } else {
        console.warn('One' + err);
      }
    }
  };

  // const fetchStatuses = async () => {
  //   setLoading(true);
  //   try {
  //     const granted = await requestStoragePermission();
  //     if (granted === true) {
  //       // openDocumentPicker();

  //       setTimeout(async () => {
  //         const statusDir =
  //           // RNFS.DocumentDirectoryPath +
  //           // '/0/Android/media/com.whatsapp/WhatsApp/Media/.Statuses';
  //           '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/.Statuses/';
  //         //'/storage/emulated/0/DCIM/Camera/';

  //         RNFS.readDir(statusDir)
  //           .then(result => {
  //             //console.log('GOT RESULT', result);
  //             result.forEach(file => {
  //               console.log(file.name);
  //             });
  //           })
  //           .catch(err => {
  //             console.log('22' + err.message, err.code);
  //           });

  //         const dirExists = await RNFetchBlob.fs.isDir(statusDir);
  //         if (dirExists) {
  //           console.log(`Directory exists:` + statusDir);
  //           const statusFiles = await RNFetchBlob.fs.ls(statusDir);
  //           console.log('Status files:', statusFiles); // Log status files for debugging
  //           const statusData = statusFiles.map(file => ({
  //             uri: `file://${statusDir}/${file}`,
  //             type: file.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
  //             name: file,
  //           }));
  //           setStatuses(statusData);
  //         } else {
  //           console.warn('12345 WhatsApp status directory does not exist.');
  //           Alert.alert(
  //             'Directory Not Found',
  //             'WhatsApp status directory does not exist. Please ensure WhatsApp is installed and has statuses.',
  //           );
  //         }
  //       }, 1000);
  //     } else {
  //       console.warn(' 34567 Storage permission denied.');
  //       Alert.alert(
  //         'Permission Denied',
  //         'Storage permission is required to download WhatsApp statuses.',
  //       );
  //     }
  //   } catch (error) {
  //     console.error(' 33 fetching statuses:', error);
  //     Alert.alert('Error', `Failed to fetch statuses: ${error.message}`, [
  //       {text: 'OK'},
  //     ]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const granted = await requestStoragePermission();
      if (granted) {
        const statusDir = '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/.Statuses/';
        const dirExists = await RNFetchBlob.fs.isDir(statusDir);
  
        if (dirExists) {
          const statusFiles = await RNFetchBlob.fs.ls(statusDir);
          console.log('Status files:', statusFiles);
          const statusData = statusFiles.map(file => ({
            uri: `file://${statusDir}/${file}`,
            type: file.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
            name: file,
          }));
          setStatuses(statusData);
        } else {
          console.warn('WhatsApp status directory does not exist.');
          Alert.alert(
            'Directory Not Found',
            'WhatsApp status directory does not exist. Please ensure WhatsApp is installed and has statuses.',
          );
        }
      } else {
        console.warn('Storage permission denied.');
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download WhatsApp statuses.',
        );
      }
    } catch (error) {
      console.error('Fetching statuses error:', error);
      Alert.alert('Error', `Failed to fetch statuses: ${error.message}`, [
        {text: 'OK'},
      ]);
    } finally {
      setLoading(false);
    }
  };
  

  // const requestStoragePermission = async () => {
  //   if (Platform.OS === 'android' && Platform.Version >= 23) {
  //     try {
  //       // Request individual permissions
  //       const readExternalStorage = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  //         {
  //           title: 'Storage Permission Required',
  //           message: 'This app needs access to your storage to read statuses',
  //           buttonNeutral: 'Ask Me Later',
  //           buttonNegative: 'Cancel',
  //           buttonPositive: 'OK',
  //         },
  //       );
  
  //       const writeExternalStorage = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  //         {
  //           title: 'Storage Permission Required',
  //           message: 'This app needs access to your storage to save statuses',
  //           buttonNeutral: 'Ask Me Later',
  //           buttonNegative: 'Cancel',
  //           buttonPositive: 'OK',
  //         },
  //       );
  
  //       // return readExternalStorage === PermissionsAndroid.RESULTS.GRANTED &&
  //       //        writeExternalStorage === PermissionsAndroid.RESULTS.GRANTED;
  //       return true
  //     } catch (err) {
  //       console.warn('Permission error: ' + err);
  //       return false;
  //     }
  //   }
  //   return true;
  // };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        // const granted = await PermissionsAndroid.request(
        const granted = await PermissionsAndroid.requestMultiple(
          [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE],
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to read statuses',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage Permission Granted.');
          // Proceed to read the files
        } else {
          console.log('Storage Permission Denied.');
        }

        // check if can manage
        checkManagePermission().then((isManagePermitted) => {
          console.log(isManagePermitted);
        });

        // request rights to manage
        requestManagePermission().then((isManagePermitted) => {
          console.log(isManagePermitted);
        });

      } catch (err) {
        console.warn('44 ' + err);
      }
    }
    return true;
  };

  const downloadStatus = async status => {
    try {
      const {uri, name} = status;
      const destPath = `${RNFetchBlob.fs.dirs.DownloadDir}/${name}`;
      await RNFetchBlob.fs.cp(uri, destPath);
      console.log('Status downloaded to:', destPath);
      Alert.alert('Download Complete', 'Status downloaded successfully.', [
        {text: 'OK'},
      ]);
    } catch (error) {
      console.error('Error downloading status:', error);
      Alert.alert(
        'Download Error',
        `Failed to download status: ${error.message}`,
        [{text: 'OK'}],
      );
    }
  };

  const renderStatusItem = item => (
    <View style={{padding: 10}}>
      {item.type.startsWith('image') ? (
        <Image source={{uri: item.uri}} style={{width: 200, height: 200}} />
      ) : (
        <Video source={{uri: item.uri}} style={{width: 200, height: 200}} />
      )}
      <TouchableOpacity onPress={() => downloadStatus(item)}>
        <Text style={{marginTop: 5, textAlign: 'center', color: 'blue'}}>
          Download
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          textAlign: 'center',
          marginVertical: 10,
        }}>
        WhatsApp Status Downloader
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <FlatList
          data={statuses}
          renderItem={({item}) => renderStatusItem(item)}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{flexGrow: 1}}
          ListEmptyComponent={
            <Text style={{textAlign: 'center', marginTop: 20}}>
              000 statuses found
            </Text>
          }
        />
      )}
    </View>
  );
};

export default StatusDownloaderApp;

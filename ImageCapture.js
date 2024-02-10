import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import moment from 'moment';
import MapView, { Marker } from 'react-native-maps';
// import { MapView } from 'expo'
import AsyncStorage from '@react-native-async-storage/async-storage';
const ImageCapture = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [location, setLocation] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [imageArray, setImageArray] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    getLocation();
     // Retrieve the imageArray from AsyncStorage when the component mounts
     retrieveImageArray();
  }, []);
  useEffect(() => {
    // Save the imageArray to AsyncStorage whenever it changes
    saveImageArray();
  }, [imageArray]);

  const handleOutsidePress = () => {
    // Clear the selected image when clicking outside the MapView
    setSelectedImage(null);
  };
  const saveImageArray = async () => {
    try {
      const jsonImageArray = JSON.stringify(imageArray);
      await AsyncStorage.setItem('imageArray', jsonImageArray);
    } catch (error) {
      console.error('Error saving imageArray to AsyncStorage:', error);
    }
  };

  const retrieveImageArray = async () => {
    try {
      const jsonImageArray = await AsyncStorage.getItem('imageArray');
      if (jsonImageArray) {
        setImageArray(JSON.parse(jsonImageArray));
      }
    } catch (error) {
      console.error('Error retrieving imageArray from AsyncStorage:', error);
    }
  };
  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync();
        const imageWithLocation = await addLocationToImage(photo.uri);
        await saveToGallery(imageWithLocation);
        // Add the image information to the array
        setImageArray([
          ...imageArray,
          {
            uri: imageWithLocation,
            latitude: location.latitude,
            longitude: location.longitude,
            dateTime: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const addLocationToImage = async (uri) => {
    try {
      const { latitude, longitude } = location;
      return uri;
    } catch (error) {
      console.error('Error adding location to image:', error);
      return uri;
    }
  };

  const saveToGallery = async (uri) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync('YourAlbumName');

      if (album === null) {
        await MediaLibrary.createAlbumAsync('YourAlbumName', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      try {
        const locationData = await Location.getCurrentPositionAsync({});
        setLocation(locationData.coords);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    } else {
      console.log('Location permission denied');
    }
  };

  const handleAction = (selectedImage) => {
    setSelectedImage(selectedImage);
  };

  return (
    <View style={{ flex: 1 }}>
      {hasCameraPermission === null ? (
        <Text>Requesting camera permission</Text>
      ) : hasCameraPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
        <View style={{ flex: 1 }}>
          <Camera
            style={{ flex: 1 }}
            type={Camera.Constants.Type.back}
            ref={(ref) => setCameraRef(ref)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                padding: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
               
                  padding:10
                }}
                onPress={takePicture}
              >
                <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  Take Photo
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
          {/* {location && (
            <View>
              <Text>Latitude: {location.latitude}</Text>
              <Text>Longitude: {location.longitude}</Text>
            </View>
          )} */}
          {/* Display the captured images in a table-like format */}

          <View style={styles.headerRow}>
            <Text style={styles.header}>Image</Text>
            <Text style={styles.header}>Latitude</Text>
            <Text style={styles.header}>Longitude</Text>
            <Text style={styles.header}>Date and Time</Text>
            <Text style={styles.header}>Action</Text>
          </View>
          <FlatList
            data={imageArray}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Image source={{ uri: item.uri }} style={styles.image} />
                <Text style={styles.column}>{item.latitude}</Text>
                <Text style={styles.column}>{item.longitude}</Text>
                <Text style={styles.column}>{moment(item.dateTime).format('YYYY-MM-DD HH:mm:ss')}</Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAction(item)}
                >
                  <Text style={{ color: 'white' }}>View On map</Text>
                </TouchableOpacity>
              </View>
            )}
          />

  

{selectedImage && (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: selectedImage.latitude,
                longitude: selectedImage.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: selectedImage.latitude,
                  longitude: selectedImage.longitude,
                }}
                title="Image Location"
              />
            </MapView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 8,
  },
  column: {
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    backgroundColor: 'blue',
    padding: 8,
    borderRadius: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  header: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ImageCapture;

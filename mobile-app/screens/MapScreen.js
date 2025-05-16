import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import salonService from '../services/salonService';

const MapScreen = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const data = await salonService.getAllSalons();
        setSalons(data);
      } catch (error) {
        console.error('Erreur chargement salons', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: salons.length > 0 ? salons[0].location.latitude : 48.8566, // Paris par défaut
        longitude: salons.length > 0 ? salons[0].location.longitude : 2.3522,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {salons.map((salon) => (
        <Marker
          key={salon.id}
          coordinate={{
            latitude: salon.location.latitude,
            longitude: salon.location.longitude,
          }}
          title={salon.name}
          description={salon.address}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;

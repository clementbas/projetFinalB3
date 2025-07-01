import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
// ✅ CHANGEMENT : Importer depuis api.js au lieu de salonService.js
import { salonService } from '../services/api';

const MapScreen = () => {
  // ✅ CHANGEMENT : Initialiser avec un tableau vide pour éviter les erreurs
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        console.log('🔄 Récupération des salons...');
        const data = await salonService.getAllSalons();
        
        // ✅ CHANGEMENT : Vérifier que data est bien un tableau
        if (Array.isArray(data)) {
          setSalons(data);
          console.log('✅ Salons récupérés:', data.length);
        } else {
          console.warn('⚠️ Les données reçues ne sont pas un tableau:', data);
          setSalons([]);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des salons:', error);
        Alert.alert(
          'Erreur',
          'Impossible de charger les salons. Vérifiez votre connexion.',
          [{ text: 'OK' }]
        );
        // ✅ CHANGEMENT : S'assurer que salons reste un tableau même en cas d'erreur
        setSalons([]);
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
        latitude:
          salons.length > 0 && salons[0].location
            ? salons[0].location.latitude
            : 48.8566, // Paris par défaut
        longitude:
          salons.length > 0 && salons[0].location
            ? salons[0].location.longitude
            : 2.3522,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {/* ✅ CHANGEMENT : Vérifier que salons est un tableau avant d'utiliser filter */}
      {Array.isArray(salons) &&
        salons
          .filter(
            (salon) =>
              salon.location &&
              salon.location.latitude &&
              salon.location.longitude
          )
          .map((salon) => (
            <Marker
              key={salon._id || salon.id} // ✅ CHANGEMENT : Utiliser _id (MongoDB) ou id
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
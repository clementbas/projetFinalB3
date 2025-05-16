import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import salonService from '../services/salonService';

const SalonDetails = ({ route }) => {
  const { salonId } = route.params;
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalonDetails = async () => {
      try {
        const data = await salonService.getSalonById(salonId);
        setSalon(data);
      } catch (error) {
        console.error('Erreur chargement détails salon', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalonDetails();
  }, [salonId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!salon) {
    return (
      <View style={styles.center}>
        <Text>Salon non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {salon.image && (
        <Image source={{ uri: salon.image }} style={styles.image} />
      )}
      <Text style={styles.name}>{salon.name}</Text>
      <Text style={styles.address}>{salon.address}</Text>
      <Text style={styles.description}>{salon.description}</Text>
      {/* Tu peux ajouter d'autres infos ici (horaires, tarifs, etc.) */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SalonDetails;

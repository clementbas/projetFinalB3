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
        <ActivityIndicator size="large" color="#FF6B6B" />
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
      {(salon.imageUrl || salon.image) && (
        <Image
          source={{ uri: salon.imageUrl || salon.image }}
          style={styles.image}
        />
      )}
      <Text style={styles.name}>{salon.name || salon.nom}</Text>
      <Text style={styles.address}>{salon.address || salon.adresse}</Text>
      <Text style={styles.info}>Note: {salon.rating || salon.note} / 5</Text>
      <Text style={styles.info}>Nombre d'avis: {salon.numReviews || salon.nombreAvis}</Text>
      <Text style={styles.info}>Prix minimum: {salon.minPrice || salon.prixMin} €</Text>
      {/* Ajouter d'autres informations selon les données disponibles */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  address: {
    fontSize: 16,
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default SalonDetails;

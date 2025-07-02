import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import AppointmentCard from '../components/AppointmentCard';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
    loadAppointments();
  }, []);

  const loadProfile = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      console.log('storedUserData:', storedUserData);  // Pour voir ce qu'on récupère
      if (storedUserData) {
        const parsedUser = JSON.parse(storedUserData);
        console.log('parsedUser:', parsedUser);        // Pour vérifier le contenu
        setUser(parsedUser);
      }
    } catch (error) {
      console.log('Erreur lors du chargement du profil :', error);
    }
  };
  

  const loadAppointments = () => {
    setIsLoading(true);

    // À remplacer avec ton appel API réel plus tard
    setTimeout(() => {
      setUpcomingAppointments([]);
      setPastAppointments([]);
      setIsLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadAppointments()]);
    setRefreshing(false);
  };

  const renderAppointment = ({ item }) => (
    <AppointmentCard appointment={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mon Profil" />

      <View style={styles.profileContainer}>
        <Ionicons name="person-circle" size={80} color="#FF6B6B" />
        <Text style={styles.name}>
          {user ? user.nom || user.name : 'Chargement...'}
        </Text>
        <Text style={styles.email}>
          {user ? user.email || 'email non trouvé' : ''}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionTitle}>Rendez-vous suivants</Text>
          {upcomingAppointments.length > 0 ? (
            <FlatList
              data={upcomingAppointments}
              keyExtractor={(item) => item.id}
              renderItem={renderAppointment}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noData}>Aucun rendez-vous à venir</Text>
          )}

          <Text style={styles.sectionTitle}>Rendez-vous passés</Text>
          {pastAppointments.length > 0 ? (
            <FlatList
              data={pastAppointments}
              keyExtractor={(item) => item.id}
              renderItem={renderAppointment}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noData}>Aucun rendez-vous passé</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  noData: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default ProfileScreen;

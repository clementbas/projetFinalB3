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
import Header from '../components/Header';
import AppointmentCard from '../components/AppointmentCard';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
  });

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const mockAppointments = [
    {
      id: '1',
      salonName: 'Coiffure Élégance',
      date: '2025-06-30T10:00:00',
      status: 'upcoming',
    },
    {
      id: '2',
      salonName: 'Studio Coupe',
      date: '2025-06-15T14:30:00',
      status: 'past',
    },
    {
      id: '3',
      salonName: 'Hair Fashion',
      date: '2025-07-02T09:00:00',
      status: 'upcoming',
    },
    {
      id: '4',
      salonName: 'Coiffure Express',
      date: '2025-06-10T16:00:00',
      status: 'past',
    },
  ];

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    setIsLoading(true);

    setTimeout(() => {
      const now = new Date();
      const upcoming = mockAppointments.filter(
        (appt) => new Date(appt.date) >= now
      );
      const past = mockAppointments.filter(
        (appt) => new Date(appt.date) < now
      );

      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
      setIsLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadAppointments();
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
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
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

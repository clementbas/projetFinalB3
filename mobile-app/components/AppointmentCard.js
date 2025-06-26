import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AppointmentCard = ({ appointment }) => {
  const { salonName, date } = appointment;
  const appointmentDate = new Date(date);
  const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="cut-outline" size={30} color="#FF6B6B" />
      </View>
      <View style={styles.info}>
        <Text style={styles.salonName}>{salonName}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    marginRight: 15,
    backgroundColor: '#FFECEC',
    padding: 10,
    borderRadius: 10,
  },
  info: {
    flex: 1,
  },
  salonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});

export default AppointmentCard;

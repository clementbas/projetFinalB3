import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SalonCard = ({ salon }) => {
  const navigation = useNavigation();

  // 🔥 Valeurs par défaut sécurisées
  const salonData = {
    id: salon?.id || salon?._id || 'unknown',
    name: salon?.name || salon?.nom || 'Salon sans nom',
    rating: salon?.rating || salon?.note || 0,
    numReviews: salon?.numReviews || salon?.nombreAvis || 0,
    address: salon?.address || salon?.adresse || 'Adresse non disponible',
    minPrice: salon?.minPrice || salon?.prixMin || 0,
    distance: salon?.distance || null,
    imageUrl: salon?.imageUrl || salon?.image || null,
  };

  const renderStars = (rating) => {
    const stars = [];
    const safeRating = Math.max(0, Math.min(5, rating || 0)); // Entre 0 et 5
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={`star-${i}`} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={`star-half-${i}`} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={`star-outline-${i}`} name="star-outline" size={16} color="#FFD700" />);
      }
    }
    return stars;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SalonDetails', { salonId: salonData.id })}
    >
      <Image
        source={{ 
          uri: salonData.imageUrl || 'https://via.placeholder.com/150x120/FF6B6B/FFFFFF?text=Salon' 
        }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>{salonData.name}</Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>{renderStars(salonData.rating)}</View>
          <Text style={styles.ratingText}>
            ({salonData.numReviews > 0 ? salonData.numReviews : 'Nouveau'})
          </Text>
        </View>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {salonData.address}
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>À partir de </Text>
          <Text style={styles.price}>{salonData.minPrice}€</Text>
        </View>
        
        {salonData.distance && (
          <View style={styles.distanceContainer}>
            <Ionicons name="navigate" size={14} color="#666" />
            <Text style={styles.distanceText}>{salonData.distance} km</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 120,
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  distanceContainer: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  distanceText: {
    marginLeft: 2,
    fontSize: 12,
    color: '#666',
  },
});

export default SalonCard;
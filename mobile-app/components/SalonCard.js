import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SalonCard = ({ salon }) => {
  const navigation = useNavigation();

  // 🔥 Adaptation aux données du modèle MongoDB
  const salonData = {
    id: salon?._id || salon?.id || 'unknown',
    name: salon?.name || 'Salon sans nom',
    address: salon?.address || 'Adresse non disponible',
    ville: salon?.ville || '',
    categorie: salon?.categorie || 'mixte',
    description: salon?.description || '',
    prixMinimum: salon?.prixMinimum || 0,
    // Calculer la note moyenne à partir des commentaires
    rating: salon?.commentaires?.length > 0 
      ? salon.commentaires.reduce((sum, comment) => sum + comment.note, 0) / salon.commentaires.length 
      : 0,
    numReviews: salon?.commentaires?.length || 0,
    // Image par défaut selon la catégorie
    imageUrl: salon?.imageUrl || getDefaultImage(salon?.categorie),
    // Distance fictive pour l'exemple (à remplacer par calcul réel)
    distance: salon?.distance || null,
  };

  // Fonction pour obtenir une image par défaut selon la catégorie
  function getDefaultImage(categorie) {
    switch(categorie) {
      case 'homme':
        return 'https://via.placeholder.com/150x120/4A90E2/FFFFFF?text=Salon+Homme';
      case 'femme':
        return 'https://via.placeholder.com/150x120/E24A90/FFFFFF?text=Salon+Femme';
      case 'mixte':
      default:
        return 'https://via.placeholder.com/150x120/FF6B6B/FFFFFF?text=Salon+Mixte';
    }
  }

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

  const getCategorieIcon = (categorie) => {
    switch(categorie) {
      case 'homme': return 'man';
      case 'femme': return 'woman';
      case 'mixte': return 'people';
      default: return 'storefront';
    }
  };

  const getCategorieColor = (categorie) => {
    switch(categorie) {
      case 'homme': return '#4A90E2';
      case 'femme': return '#E24A90';
      case 'mixte': return '#FF6B6B';
      default: return '#666';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SalonDetails', { salonId: salonData.id })}
    >
      <Image
        source={{ uri: salonData.imageUrl }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.name} numberOfLines={2}>{salonData.name}</Text>
          <View style={styles.categorieContainer}>
            <Ionicons 
              name={getCategorieIcon(salonData.categorie)} 
              size={16} 
              color={getCategorieColor(salonData.categorie)} 
            />
            <Text style={[styles.categorieText, { color: getCategorieColor(salonData.categorie) }]}>
              {salonData.categorie}
            </Text>
          </View>
        </View>
        
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>{renderStars(salonData.rating)}</View>
          <Text style={styles.ratingText}>
            {salonData.rating > 0 ? `${salonData.rating.toFixed(1)}` : 'Nouveau'}
          </Text>
          <Text style={styles.reviewsText}>
            ({salonData.numReviews} avis)
          </Text>
        </View>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {salonData.address}{salonData.ville ? `, ${salonData.ville}` : ''}
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>À partir de </Text>
          <Text style={styles.price}>{salonData.prixMinimum}€</Text>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  categorieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categorieText: {
    marginLeft: 2,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
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
    color: '#333',
    fontWeight: '600',
  },
  reviewsText: {
    marginLeft: 2,
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
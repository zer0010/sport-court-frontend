import React, { memo, useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapView from "react-native-map-clustering";
import { defaultStyles } from "@/constants/Styles";
import { VenueListItem } from "@/interfaces/types";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface Props {
  venues: VenueListItem[];
}

const INITIAL_REGION = {
  latitude: 31.5204, // Lahore, Pakistan as default
  longitude: 74.3587,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const debouncedRenderMarkers = (
  data: VenueListItem[],
  setDebouncedData: React.Dispatch<React.SetStateAction<VenueListItem[]>>
) => {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  return () => {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      setDebouncedData(data);
    }, 100);
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  };
};

const VenuesMap = memo(({ venues }: Props) => {
  const venuesRef = useRef<VenueListItem[]>(venues);
  const [debouncedVenues, setDebouncedVenues] = React.useState<VenueListItem[]>([]);

  const debouncedRender = useCallback(
    debouncedRenderMarkers(venuesRef.current, setDebouncedVenues),
    [setDebouncedVenues]
  );

  const onMarkerSelected = (venue: VenueListItem) => {
    router.push(`/venue/${venue.id}`);
  };

  useEffect(() => {
    venuesRef.current = venues;
    const cleanup = debouncedRender();
    return cleanup;
  }, [venues, debouncedRender]);

  const renderCluster = (cluster: any) => {
    const { id, properties, geometry, onPress } = cluster;
    const points = properties.point_count;

    return (
      <Marker
        key={id}
        onPress={onPress}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        }}
      >
        <View style={styles.cluster}>
          <Text style={{ fontFamily: "mon-sb", fontSize: 14 }}>{points}</Text>
        </View>
      </Marker>
    );
  };

  return (
    <View style={defaultStyles.container}>
      <MapView
        animationEnabled={false}
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
        provider={PROVIDER_DEFAULT}
        clusterColor="#fff"
        clusterTextColor="#000"
        clusterFontFamily="mon-sb"
        renderCluster={renderCluster}
      >
        {debouncedVenues.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={{
              latitude: venue.latitude,
              longitude: venue.longitude,
            }}
            onPress={() => onMarkerSelected(venue)}
          >
            <View style={styles.marker}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Text style={styles.markerText}>
                Rs. {venue.min_price}/hr
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
});

// Keep old name as alias for backward compatibility
const ListingsMap = memo(({ listingData }: { listingData: any[] }) => {
  // Convert old format to new format or pass empty array
  return <VenuesMap venues={[]} />;
});

export { VenuesMap };
export default ListingsMap;

const styles = StyleSheet.create({
  marker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderColor: "#A3A3A3",
    borderWidth: StyleSheet.hairlineWidth,
    padding: 6,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: {
      width: 1,
      height: 10,
    },
  },
  markerText: {
    fontSize: 14,
    fontFamily: "mon-sb",
  },
  cluster: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    padding: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: {
      width: 1,
      height: 10,
    },
  },
});

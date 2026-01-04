import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  ListRenderItem,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from "react-native";
import { defaultStyles } from "@/constants/Styles";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
} from "@gorhom/bottom-sheet";
import VenueCard from "./VenueCard";
import { VenueListItem } from "@/interfaces/types";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import VenueCardSkeleton from "@/components/skeletons/VenueCardSkeleton";

interface Props {
  category: string;
  venues?: VenueListItem[];
  loading?: boolean;
}

const ListingsBottomSheet = ({ category, venues = [], loading = false }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<VenueListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const snapPoints = useMemo(() => ["8%", "100%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetListRef = useRef<BottomSheetFlatListMethods>(null);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

  // Filter venues by sport type (category)
  const filteredVenues = useMemo(() => {
    if (category === "All" || !category) {
      return venues;
    }
    return venues.filter((venue) => {
      // Backend uses 'sports', frontend may expect 'sport_types'
      const sportList = venue.sports || venue.sport_types || [];
      return sportList.some(
        (sport) => sport.toLowerCase() === category.toLowerCase()
      );
    });
  }, [category, venues]);

  useEffect(() => {
    loadInitialItems();
    scrollToTop(false);
    bottomSheetRef.current?.expand();
  }, [category, venues]);

  const loadInitialItems = useCallback(() => {
    setIsLoading(true);
    const initialData = filteredVenues.slice(0, 20);
    setData(initialData);
    setCurrentPage(1);
    setIsLoading(false);
  }, [filteredVenues]);

  const loadMoreData = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    const startIndex = currentPage * 20;
    const endIndex = startIndex + 20;
    const moreData = filteredVenues.slice(startIndex, endIndex);
    if (moreData.length > 0) {
      setData((prevData) => [...prevData, ...moreData]);
      setCurrentPage((prevPage) => prevPage + 1);
    }
    setIsLoading(false);
  }, [isLoading, currentPage, filteredVenues]);

  const RenderRow: ListRenderItem<VenueListItem> = ({ item }) => {
    return <VenueCard venue={item} />;
  };

  const scrollToTop = (animated = true) => {
    if (bottomSheetListRef.current) {
      bottomSheetListRef.current?.scrollToOffset({
        offset: 0,
        animated: animated,
      });
      setShowScrollToTopButton(false);
    }
  };

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      setShowScrollToTopButton(currentOffset > 900);
    },
    []
  );

  const showMap = () => {
    bottomSheetRef.current?.collapse();
  };

  return (
    <BottomSheet
      style={styles.sheetContainer}
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      handleIndicatorStyle={{ backgroundColor: Colors.grey }}
    >
      <View style={styles.listHeader}>
        <Text
          style={{
            textAlign: "center",
            fontFamily: "mon-sb",
            fontSize: 14,
            color: "#333",
          }}
        >
          {loading ? "Loading..." : `${filteredVenues.length} ${filteredVenues.length === 1 ? "Venue" : "Venues"}`}
        </Text>
      </View>
      <View style={[defaultStyles.container, { paddingHorizontal: 16 }]}>
        {loading ? (
          <View style={{ marginTop: 10 }}>
            {[1, 2, 3].map((i) => (
              <VenueCardSkeleton key={i} />
            ))}
          </View>
        ) : data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={48} color={Colors.grey} />
            <Text style={styles.emptyText}>No venues found</Text>
            <Text style={styles.emptySubtext}>
              {category !== "All"
                ? `No ${category} venues in this area`
                : "Search for venues near you"}
            </Text>
          </View>
        ) : (
          <BottomSheetFlatList
            ref={bottomSheetListRef}
            data={data}
            renderItem={RenderRow}
            keyExtractor={(item: VenueListItem) => item.id}
            windowSize={6}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            onScrollEndDrag={handleScroll}
          />
        )}
      </View>
      <View style={styles.absoluteBtn}>
        <TouchableOpacity style={styles.btn} onPress={showMap}>
          <Text style={{ fontFamily: "mon-sb", fontSize: 14, color: "#fff" }}>
            Map
          </Text>
          <Ionicons name="map" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {showScrollToTopButton && (
        <TouchableOpacity
          onPress={() => scrollToTop()}
          style={styles.scrollTopBtn}
        >
          <Ionicons name="arrow-up" style={{ color: "white" }} size={24} />
        </TouchableOpacity>
      )}
    </BottomSheet>
  );
};

export default ListingsBottomSheet;

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: "#fff",
    borderRadius: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: {
      width: 2,
      height: 2,
    },
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingBottom: 18,
    paddingHorizontal: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontFamily: "mon-sb",
    fontSize: 18,
    color: Colors.dark,
    marginTop: 16,
  },
  emptySubtext: {
    fontFamily: "mon",
    fontSize: 14,
    color: Colors.grey,
    marginTop: 8,
  },
  absoluteBtn: {
    position: "absolute",
    alignItems: "center",
    bottom: 30,
    width: "100%",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: Colors.dark,
    opacity: 0.8,
  },
  scrollTopBtn: {
    position: "absolute",
    bottom: 32,
    right: 23,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 26,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6,
  },
});

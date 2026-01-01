import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { ScrollView } from "react-native";
import * as Haptics from "expo-haptics";

// Sport types for filtering venues
const categories = [
  {
    name: "All",
    icon: "view-grid-outline",
  },
  {
    name: "Cricket",
    icon: "cricket",
  },
  {
    name: "Football",
    icon: "soccer",
  },
  {
    name: "Badminton",
    icon: "badminton",
  },
  {
    name: "Tennis",
    icon: "tennis",
  },
  {
    name: "Basketball",
    icon: "basketball",
  },
  {
    name: "Volleyball",
    icon: "volleyball",
  },
  {
    name: "Table Tennis",
    icon: "table-tennis",
  },
  {
    name: "Swimming",
    icon: "swim",
  },
];

interface Props {
  onCategoryChanged: (category: string) => void;
}

const ExploreHeader = ({ onCategoryChanged }: Props) => {
  const scrollRef = useRef<ScrollView>(null);
  const catRef = useRef<Array<TouchableOpacity | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectCategory = (index: number) => {
    const selected = catRef.current[index];
    setActiveIndex(index);

    selected?.measure((x) => {
      scrollRef.current?.scrollTo({ x: x - 16, y: 0, animated: true });
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCategoryChanged(categories[index].name);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.searchBtn}>
            <Ionicons name="search" size={24} color={Colors.dark} />
            <View>
              <Text style={{ fontFamily: "mon-sb", color: Colors.dark }}>
                Find a court
              </Text>
              <Text style={{ fontFamily: "mon", color: Colors.grey }}>
                Near you • Any time
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={26} color={Colors.dark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            gap: 16,
            paddingHorizontal: 18,
            paddingVertical: 4,
          }}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index + cat.name}
              onPress={() => selectCategory(index)}
              ref={(el) => (catRef.current[index] = el)}
              style={
                activeIndex === index
                  ? styles.categoryBtnActive
                  : styles.categoryBtn
              }
            >
              <MaterialCommunityIcons
                name={cat.icon as any}
                size={26}
                color={activeIndex === index ? Colors.primary : "#959595"}
              />
              <Text
                style={
                  activeIndex === index
                    ? styles.categoryTextActive
                    : styles.categoryText
                }
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ExploreHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    height: 132,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 10,
  },
  filterBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 24,
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderColor: "#c2c2c2",
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    padding: 10,
    borderRadius: 30,
    backgroundColor: "#fff",

    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "mon-sb",
    color: "#959595",
  },
  categoryTextActive: {
    fontSize: 14,
    fontFamily: "mon-sb",
    color: Colors.primary,
  },
  categoryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
    minWidth: 84,
  },
  categoryBtnActive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
    minWidth: 84,
    borderBottomColor: Colors.primary,
    borderBottomWidth: 2,
  },
});

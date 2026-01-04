import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
} from "react-native";
import Colors from "@/constants/Colors";
import * as Haptics from "expo-haptics";

interface Props {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    daysToShow?: number;
}

const DatePicker = ({ selectedDate, onDateSelect, daysToShow = 7 }: Props) => {
    const getDates = () => {
        const dates: Date[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const dates = getDates();

    const formatDayName = (date: Date) => {
        if (isToday(date)) return "Today";
        if (isTomorrow(date)) return "Tomorrow";
        return date.toLocaleDateString("en-US", { weekday: "short" });
    };

    const formatDayNumber = (date: Date) => {
        return date.getDate().toString();
    };

    const formatMonth = (date: Date) => {
        return date.toLocaleDateString("en-US", { month: "short" });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isTomorrow = (date: Date) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    };

    const isSelected = (date: Date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    const handleDatePress = (date: Date) => {
        if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onDateSelect(date);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Date</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {dates.map((date, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dateItem,
                            isSelected(date) && styles.dateItemSelected,
                        ]}
                        onPress={() => handleDatePress(date)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.dayName,
                            isSelected(date) && styles.dayNameSelected,
                            isToday(date) && !isSelected(date) && styles.todayText,
                        ]}>
                            {formatDayName(date)}
                        </Text>
                        <Text style={[
                            styles.dayNumber,
                            isSelected(date) && styles.dayNumberSelected,
                        ]}>
                            {formatDayNumber(date)}
                        </Text>
                        <Text style={[
                            styles.month,
                            isSelected(date) && styles.monthSelected,
                        ]}>
                            {formatMonth(date)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default DatePicker;

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    title: {
        fontFamily: "mon-sb",
        fontSize: 18,
        color: Colors.dark,
        marginBottom: 12,
    },
    scrollContent: {
        gap: 10,
        paddingRight: 16,
    },
    dateItem: {
        width: 70,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: Colors.lightGrey || "#f5f5f5",
        borderWidth: 2,
        borderColor: "transparent",
    },
    dateItemSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    dayName: {
        fontFamily: "mon",
        fontSize: 12,
        color: Colors.grey,
        marginBottom: 4,
    },
    dayNameSelected: {
        color: "#fff",
    },
    todayText: {
        color: Colors.primary,
        fontFamily: "mon-sb",
    },
    dayNumber: {
        fontFamily: "mon-b",
        fontSize: 20,
        color: Colors.dark,
        marginBottom: 2,
    },
    dayNumberSelected: {
        color: "#fff",
    },
    month: {
        fontFamily: "mon",
        fontSize: 11,
        color: Colors.grey,
    },
    monthSelected: {
        color: "rgba(255,255,255,0.8)",
    },
});

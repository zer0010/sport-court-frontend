import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { apiService, getErrorMessage } from "@/services/api";

interface ReviewModalProps {
    visible: boolean;
    onClose: () => void;
    bookingId: string;
    onReviewSubmitted: () => void;
}

export default function ReviewModal({ visible, onClose, bookingId, onReviewSubmitted }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!bookingId) return;

        try {
            setSubmitting(true);
            await apiService.submitReview(bookingId, { rating, comment });
            Alert.alert("Thank You", "Your review has been submitted!");
            onReviewSubmitted();
            onClose();
        } catch (error) {
            console.error("Submit review error:", error);
            Alert.alert("Error", getErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContent}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Rate Experience</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={Colors.grey} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setRating(star)}
                                        style={styles.starButton}
                                    >
                                        <Ionicons
                                            name={star <= rating ? "star" : "star-outline"}
                                            size={40}
                                            color={Colors.primary}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.ratingLabel}>
                                {rating === 5 ? "Excellent!" :
                                    rating === 4 ? "Very Good" :
                                        rating === 3 ? "Good" :
                                            rating === 2 ? "Fair" : "Poor"}
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Share your experience (optional)"
                                placeholderTextColor={Colors.grey}
                                multiline
                                numberOfLines={4}
                                value={comment}
                                onChangeText={setComment}
                            />

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit Review</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontFamily: "mon-sb",
        fontSize: 20,
        color: Colors.dark,
    },
    starsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        marginBottom: 12,
    },
    starButton: {
        padding: 4,
    },
    ratingLabel: {
        textAlign: "center",
        fontFamily: "mon-sb",
        fontSize: 16,
        color: Colors.primary,
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.lightGrey || "#e0e0e0",
        borderRadius: 12,
        padding: 16,
        paddingTop: 16, // For multiline vertical alignment
        height: 120,
        fontFamily: "mon",
        fontSize: 16,
        color: Colors.dark,
        marginBottom: 24,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    submitButtonText: {
        color: "#fff",
        fontFamily: "mon-sb",
        fontSize: 16,
    },
});

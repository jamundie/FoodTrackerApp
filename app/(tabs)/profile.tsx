import React from "react";
import { ScrollView } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import ProfileForm from "../../components/ProfileForm";
import { useTracking } from "../../hooks/TrackingContext";
import { styles } from "../../styles/food.styles";
import { profileStyles } from "../../styles/profile.styles";

export default function ProfileScreen() {
  const { userProfile, updateUserProfile } = useTracking();

  return (
    <ScrollView style={[styles.container, profileStyles.container]}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          My Profile
        </ThemedText>

        <ProfileForm profile={userProfile} onSave={updateUserProfile} />
      </ThemedView>
    </ScrollView>
  );
}

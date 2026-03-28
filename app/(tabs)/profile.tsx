import React from "react";
import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import ProfileForm from "../../components/ProfileForm";
import { useTracking } from "../../hooks/TrackingContext";
import { useAuth } from "../../hooks/AuthContext";
import { styles } from "../../styles/food.styles";
import { profileStyles } from "../../styles/profile.styles";

export default function ProfileScreen() {
  const { userProfile, updateUserProfile } = useTracking();
  const { signOut, user } = useAuth();

  return (
    <ScrollView style={[styles.container, profileStyles.container]}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          My Profile
        </ThemedText>

        {user?.email && (
          <View style={profileStyles.card}>
            <Text style={[profileStyles.fieldLabel, { color: '#666', fontSize: 13 }]}>
              Signed in as
            </Text>
            <Text style={[profileStyles.fieldLabel, { color: '#333', fontWeight: '500', textTransform: 'none', letterSpacing: 0 }]}>
              {user.email}
            </Text>
          </View>
        )}

        <ProfileForm profile={userProfile} onSave={updateUserProfile} />

        <TouchableOpacity
          style={[profileStyles.saveButton, { backgroundColor: '#ff3b30', marginTop: 16, marginBottom: 32 }]}
          onPress={signOut}
        >
          <Text style={profileStyles.saveButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

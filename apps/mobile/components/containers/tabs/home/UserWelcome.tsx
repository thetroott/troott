import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

interface UserWelcomeProps {
  firstName: string;
}

const UserWelcome: React.FC<UserWelcomeProps> = ({ firstName }) => {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good morning");
      } else if (hour < 18) {
        setGreeting("Good afternoon");
      } else {
        setGreeting("Good evening");
      }
    };

    updateGreeting();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {greeting}, {firstName}! 👋
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default UserWelcome;

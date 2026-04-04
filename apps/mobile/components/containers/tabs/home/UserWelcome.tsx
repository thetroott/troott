import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Text from "@/components/ui/text";

interface UserWelcomeProps {
  firstName: string;
}

const UserWelcome: React.FC<UserWelcomeProps> = ({ firstName }) => {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <View className="py-2.5">
      <Text size="lg" weight="semiBold" className="text-neutral-100">
        {greeting}, {firstName}!
      </Text>
    </View>
  );
};

export default UserWelcome;

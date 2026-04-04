import React from "react";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";

const SeeMore = ({ onPress }: { onPress?: () => void }) => {
  return (
    <Button
      variant="outline"
      className="h-auto w-auto rounded-full border-neutral-500 px-4 py-1"
      onPress={onPress}
    >
      <Text size="xs" className="text-neutral-100">
        See more
      </Text>
    </Button>
  );
};

export default SeeMore;

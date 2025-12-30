import { Skeleton } from "moti/skeleton";
import React from "react";
import { View } from "react-native";

const SkeletonLoadingEvents = () => {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <View
          key={i}
          className="flex-row bg-white rounded-xl p-4 shadow-sm mb-4 border-border border-solid border-2"
        >
          {/* Thumbnail Skeleton */}
          <Skeleton
            colorMode="light"
            width={96}
            height={96}
            radius={8}
            show={true}
          />

          {/* Content Skeleton */}
          <View className="flex-1 ml-4">
            {/* Title */}
            <Skeleton
              colorMode="light"
              width="80%"
              height={20}
              radius={4}
              show={true}
            >
              <View className="h-5 mb-2" />
            </Skeleton>

            {/* Location */}
            <Skeleton
              colorMode="light"
              width="60%"
              height={16}
              radius={4}
              show={true}
            >
              <View className="h-4 mb-2" />
            </Skeleton>

            {/* Date & Time */}
            <Skeleton
              colorMode="light"
              width="70%"
              height={16}
              radius={4}
              show={true}
            >
              <View className="h-4 mb-2" />
            </Skeleton>

            {/* Bottom Row */}
            <View className="flex-row items-center justify-between mt-2">
              {/* Participants */}
              <Skeleton
                colorMode="light"
                width={80}
                height={16}
                radius={4}
                show={true}
              >
                <View className="h-4" />
              </Skeleton>

              {/* Join Button */}
              <Skeleton
                colorMode="light"
                width={80}
                height={32}
                radius={16}
                show={true}
              >
                <View className="h-8" />
              </Skeleton>
            </View>
          </View>
        </View>
      ))}
    </>
  );
};

export default SkeletonLoadingEvents;

import { trpc } from "@/lib/trpc";
import { Image, Text, View } from "react-native";

interface ProfilePictureGroupProps {
  userIds: string[];
  showNames?: boolean;
}

function generateNamesText(firstNames: string[]): string {
  if (firstNames.length === 0) return "";

  if (firstNames.length === 1) {
    return `${firstNames[0]} is going`;
  }

  if (firstNames.length === 2) {
    return `${firstNames[0]} and ${firstNames[1]} are going`;
  }

  if (firstNames.length >= 3) {
    const displayed = firstNames.slice(0, 2).join(", ");
    const remaining = firstNames.length - 2;
    return `${displayed}, and ${remaining} others are going`;
  }

  return "";
}
// TODO: my user's pfp doesn't get rendered here or in the hosted by section when i created on ios and then switch to android
export default function ProfilePictureGroup({
  userIds,
  showNames = true,
}: ProfilePictureGroupProps) {
  const numberOfPeople = userIds.length;
  const {
    data: users,
    isLoading,
    error,
  } = trpc.users.getAvatarUrlsFromIds.useQuery({ userIds: userIds });

  const pfpUserList = (users ?? []).slice(0, 5);
  const extraPicturesCount = Math.max(0, numberOfPeople - 5);
  const namesList = (users ?? []).map((user) => user.firstName);
  const namesListText = generateNamesText(namesList);

  const profilePictureStyles =
    "rounded-full overflow-hidden w-12 h-12 border-2 border-white";

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error getting avatars</Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 py-1">
        {pfpUserList.length > 0 ? (
          <>
            <View className="flex-row items-center">
              {pfpUserList.map(({ userId, avatarUrl }, idx) => (
                <View
                  key={userId}
                  className={
                    idx === 0
                      ? profilePictureStyles
                      : `${profilePictureStyles} -ml-2`
                  }
                >
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-full w-full bg-gray-300 items-center justify-center">
                      <Text className="text-xs text-gray-600">?</Text>
                    </View>
                  )}
                </View>
              ))}

              {extraPicturesCount > 0 && (
                <View
                  className={`${profilePictureStyles} -ml-2 bg-gray-200 items-center justify-center`}
                >
                  <Text className="text-xs text-gray-500">
                    +{extraPicturesCount}
                  </Text>
                </View>
              )}
            </View>
            {showNames && (
              <View className="flex-row items-center pt-2">
                <Text>{namesListText}</Text>
              </View>
            )}
          </>
        ) : (
          <Text className="text-center">No attendees yet</Text>
        )}
      </View>
    </>
  );
}

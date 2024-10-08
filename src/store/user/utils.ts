import {
  FolderV2,
  FolderV3,
  PasswordItemV2,
  PasswordItemV3,
  User,
  UserAllVersions,
  UserDataV2,
  UserDataV3,
  UserV2,
  UserV3,
} from "./types";

// Remove keys from T2 that are present in T1
type SubtractKeys<T2, T1> = Exclude<keyof T2, keyof T1>;

type AddOrUpdateKeyVector<NewType> = Partial<{
  [NewKey in keyof NewType]: NewType[NewKey];
}>;

type TypeUpdateVector<OldType, NewType> = {
  keysToAddOrUpdate?: AddOrUpdateKeyVector<NewType>;
  keysToRemove?: Set<SubtractKeys<OldType, NewType>>;
};

export const updateType = <OldType extends object, NewType extends object>(
  oldObject: OldType,
  updateVector: TypeUpdateVector<OldType, NewType>
): NewType => {
  const newObj = {} as NewType;
  type GetTypeOfSet<T extends Set<any>> = T extends Set<infer U> ? U : never;

  Object.keys(oldObject).forEach((key) => {
    if (updateVector.keysToRemove) {
      const keyToRemove = key as GetTypeOfSet<typeof updateVector.keysToRemove>;
      if (updateVector.keysToRemove.has(keyToRemove)) {
        return;
      }
    }

    if (updateVector.keysToAddOrUpdate) {
      const keyToAddOrUpdate =
        key as keyof typeof updateVector.keysToAddOrUpdate;
      if (keyToAddOrUpdate in updateVector.keysToAddOrUpdate) {
        newObj[keyToAddOrUpdate] = updateVector.keysToAddOrUpdate[
          keyToAddOrUpdate
        ] as any;
        return;
      }
    }

    newObj[key as keyof NewType] = oldObject[key as keyof OldType] as any;
  });
  return newObj;
};

const UserVersionIncrementor = {
  1: (user: any): UserV2 => ({ ...user, version: 2 }),
  2: (user: UserV2): UserV3 => {
    const incrementFolderV2 = (folder: FolderV2): FolderV3 => {
      return updateType<FolderV2, FolderV3>(folder, {
        keysToAddOrUpdate: {
          contents: folder.contents.map((item) => {
            if ("contents" in item) {
              return incrementFolderV2(item);
            }
            return updateType<PasswordItemV2, PasswordItemV3>(item, {
              keysToAddOrUpdate: {
                type: "UNKOWN",
                userId: item.username,
              },
              keysToRemove: new Set(["username"]),
            });
          }),
        },
      });
    };
    const newUser = updateType<UserV2, UserV3>(user, {
      keysToAddOrUpdate: {
        userData: updateType<UserDataV2, UserDataV3>(user.userData, {
          keysToAddOrUpdate: {
            directory: updateType<FolderV2, FolderV3>(user.userData.directory, {
              keysToAddOrUpdate: {
                contents: incrementFolderV2(user.userData.directory).contents,
              },
            }),
          },
        }),
        version: 3,
      },
    });
    return newUser;
  },
};

type IncrementorFunction =
  (typeof UserVersionIncrementor)[keyof typeof UserVersionIncrementor];

const latestVerstion = 3;
const chainIncrementUserVersion = <CurrentVersion extends number>(
  user: Parameters<IncrementorFunction>[0],
  currentVersion: CurrentVersion
) => {
  for (let i = currentVersion; i < latestVerstion; i++) {
    user =
      UserVersionIncrementor[i as keyof typeof UserVersionIncrementor](user);
  }
  return user as User;
};

export const getDataCompatibleUser = <T extends UserAllVersions>(
  value: T
): User => {
  const userVersion = value.version ?? 1;

  // ================ ADJUSTMENTS FOR STR TO OBJ =====================
  const handleTaggedSets = (user: T): T => {
    const tagged = user.userData.tagged;
    if (!tagged) return user;
    const newTagged = Object.keys(tagged).reduce((acc, key) => {
      const typedKey = key as keyof typeof tagged;
      const originalVal: any = tagged[typedKey];
      if (userVersion === 1 || Object.keys(originalVal).length === 0) {
        acc[typedKey] = new Set();
      } else {
        acc[typedKey] = new Set(originalVal ?? []);
      }
      return acc;
    }, {} as User["userData"]["tagged"]);
    return { ...user, userData: { ...user.userData, tagged: newTagged } };
  };

  // =================

  const updateVersion = (user: T): User => {
    if (user.version) {
      return chainIncrementUserVersion(user, user.version);
    }
    return chainIncrementUserVersion(user, 1);
  };

  const tagHandledUser = handleTaggedSets(value);
  const backwardsCompatibleUser = updateVersion(tagHandledUser);
  return backwardsCompatibleUser as User;
};

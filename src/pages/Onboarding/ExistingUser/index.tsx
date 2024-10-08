import { Button } from "@/components/ui/button";
import { UserListItem } from "@/hooks/useUserList";
import React, { useState } from "react";
import UserComboBox from "./UserComboBox";
import CompoundInput from "@/components/ui/compound-input";
import useGlobalNavigator from "@/context/GlobalNavigator";
import {
  authenticateUserWithPassword,
  authenticateUserWithPrivateKey,
} from "@/lib/account-utils";
import { safeParse } from "@/lib/utils";
import useUserStore from "@/store/user";

type ExistingUserProps = {
  userList: UserListItem[];
};

const ExistingUser = ({ userList }: ExistingUserProps) => {
  const { goBack, goTo, backStackLength } = useGlobalNavigator();
  const setNewUserStage = () => goTo("onboarding/new");

  // State of combo-box selected value
  const userComboBoxValueState = useState(
    userList.length === 1 ? userList[0].username : ""
  );
  const [userComboBoxValue] = userComboBoxValueState;

  // Get user object frol selected value
  const userItemByValue = userList.find(
    (user) => user.username === userComboBoxValue
  );
  const [credential, setCredential] = useState("");
  const [showCredential, setShowCredential] = useState(false);

  const initializeUser = useUserStore((state) => state.initializeUser);

  const handleLogin = async (
    user: UserListItem | undefined,
    credential: string
  ) => {
    if (!user) return;
    const authType = user?.authType;
    if (credential.length < (authType === "0" ? 66 : 8)) return;

    let userDisplayName: string;
    let userData: string;

    if (authType === "0") {
      [userDisplayName, userData] = await authenticateUserWithPrivateKey(
        user.username,
        credential
      );
    } else {
      [userDisplayName, userData] = await authenticateUserWithPassword(
        user.username,
        credential
      );
    }

    initializeUser({
      displayName: userDisplayName,
      username: user.username,
      usesPassword: user.authType === "1",
      userData: safeParse(userData),
      credential,
      avatarHex: user.avatarHex,
      version: 2 as const,
    });
  };

  return (
    <>
      {backStackLength === 0 && (
        <div className="mt-2 mb-10 pb-6 w-full flex items-center gap-4 border-b border-b-border">
          <img src="/assets/images/icon-textured.png" className="h-8" />
          <h1 className="font-bold text-3xl">Cryptophile</h1>
        </div>
      )}
      <div className="flex items-center w-full gap-2">
        {backStackLength > 0 && (
          <Button onClick={goBack} size={"sm"} variant={"ghost"}>
            <i className="fa-regular fa-chevron-left"></i>
          </Button>
        )}
        <h1 className="font-bold text-xl">Log In</h1>
      </div>
      {userList.length === 0 ? (
        <div className="w-full mt-4">
          <h2>You do not have any existing accounts on this device.</h2>
        </div>
      ) : (
        <div className="mt-2 flex flex-col gap-2 w-full">
          <span className="">
            Select an account and enter the password or private key to log in.
          </span>
          <div className="w-full flex items-center justify-center mt-4">
            <UserComboBox
              userListItems={userList}
              valueState={userComboBoxValueState}
            />
          </div>
          {userItemByValue && (
            <div className="w-full mt-1">
              {" "}
              <CompoundInput
                className="flex-1"
                type={showCredential ? "text" : "password"}
                placeholder={`Enter ${
                  userItemByValue.authType === "0" ? "Private Key" : "Password"
                }`}
                value={credential}
                onChange={(evt) => setCredential(evt.target.value)}
                autoComplete="current-password"
                disabled={false}
              >
                <Button
                  variant={"ghost"}
                  className="shrink-none w-16"
                  onClick={() => setShowCredential((prev) => !prev)}
                >
                  {showCredential ? "Hide" : "Show"}
                </Button>
              </CompoundInput>
            </div>
          )}
        </div>
      )}
      <div
        className={`w-full flex items-center ${
          userList.length === 0 ? "justify-end" : "justify-between"
        } mt-12`}
      >
        {userList.length === 0 ? (
          <Button onClick={setNewUserStage}>Create New Account</Button>
        ) : (
          <>
            <Button variant={"outline"} onClick={setNewUserStage}>
              Create New Account
            </Button>
            <Button
              disabled={
                !userItemByValue ||
                (userItemByValue.authType === "0"
                  ? credential.length < 66
                  : credential.length < 8)
              }
              onClick={() => {
                handleLogin(userItemByValue, credential);
              }}
            >
              Log in
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default ExistingUser;

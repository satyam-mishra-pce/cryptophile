import React from "react";
import Onboarding from "./pages/Onboarding";
import useUserList from "./hooks/useUserList";
import { GlobalNavigatorProvider } from "./context/GlobalNavigator";
import Main from "./pages/Main";
import useUserStore from "./store/user";

const AppWithProviders = () => {
  return <AppWithGlobalNavigatorProvider />;
};
const AppWithGlobalNavigatorProvider = () => {
  const userList = useUserList();
  return (
    <GlobalNavigatorProvider
      initialRouteItem={userList.length === 0 ? "home" : "onboarding/existing"}
    >
      <App />
    </GlobalNavigatorProvider>
  );
};

const App = () => {
  const userInfo = useUserStore((state) => state.userInfo);

  return (
    <div className="w-full h-full">{userInfo ? <Main /> : <Onboarding />}</div>
  );
};

export default AppWithProviders;

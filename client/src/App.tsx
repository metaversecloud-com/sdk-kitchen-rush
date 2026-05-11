import { useContext, useEffect, useMemo, useState } from "react";

import { Home } from "@/pages";
import { GlobalDispatchContext } from "@/context/GlobalContext";
import { InteractiveParams, SET_HAS_INTERACTIVE_PARAMS } from "@/context/types";
import { setupBackendAPI } from "@/utils";

const readInteractiveParams = (search: string): InteractiveParams => {
  const params = new URLSearchParams(search);
  return {
    assetId: params.get("assetId") || "",
    displayName: params.get("displayName") || "",
    identityId: params.get("identityId") || "",
    interactiveNonce: params.get("interactiveNonce") || "",
    interactivePublicKey: params.get("interactivePublicKey") || "",
    profileId: params.get("profileId") || "",
    sceneDropId: params.get("sceneDropId") || "",
    uniqueName: params.get("uniqueName") || "",
    urlSlug: params.get("urlSlug") || "",
    username: params.get("username") || "",
    visitorId: params.get("visitorId") || "",
  };
};

const App = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);
  const [hasMissingParams, setHasMissingParams] = useState(false);

  const interactiveParams = useMemo(() => readInteractiveParams(window.location.search), []);

  useEffect(() => {
    if (!interactiveParams.assetId) {
      setHasMissingParams(true);
      return;
    }
    if (dispatch) {
      dispatch({ type: SET_HAS_INTERACTIVE_PARAMS, payload: { hasInteractiveParams: true } });
    }
  }, [interactiveParams, dispatch]);

  useEffect(() => {
    if (hasInitBackendAPI || !interactiveParams.assetId) return;
    setupBackendAPI(interactiveParams)
      .catch((error) => console.error(error?.response?.data?.message))
      .finally(() => setHasInitBackendAPI(true));
  }, [hasInitBackendAPI, interactiveParams]);

  if (hasMissingParams) {
    return (
      <div className="flex flex-col gap-4 text-center justify-center h-screen">
        <h2>Missing Interactive Parameters</h2>
        <p>Required interactive parameters are missing, please access this app inside of a Topia world.</p>
        <p className="p2">
          To ensure the app loads correctly, it must be added as an interactive asset in the world with the correct
          Developer Public Key and "Add player session credentials to asset interactions" toggled on. View our{" "}
          <a
            className="text-success"
            href="https://docs.google.com/presentation/d/12F72CH-MsvcfbEMZ4mO-OyLhViJeq1IfLgjk9xadEaw/edit?usp=sharing"
          >
            SDK Tutorial
          </a>{" "}
          for more details.
        </p>
        <p className="p2">
          <i>If you believe this is an error, please contact support.</i>
        </p>
      </div>
    );
  }

  return <Home />;
};

export default App;

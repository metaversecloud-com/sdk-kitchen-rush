import { ReactNode, useContext } from "react";

import { Loading } from "./Loading";
import { GlobalStateContext } from "@/context/GlobalContext";

export const PageContainer = ({
  children,
  isLoading,
  headerText,
}: {
  children: ReactNode;
  isLoading: boolean;
  headerText?: string;
}) => {
  const { error } = useContext(GlobalStateContext);

  if (isLoading) return <Loading />;

  return (
    <div className="p-2 mb-28">
      {headerText && <h2 className="pb-3">{headerText}</h2>}
      {children}
      {error && <p className="p3 pt-10 text-center text-error">{error}</p>}
    </div>
  );
};

export default PageContainer;

import { ReactNode, useContext, useState } from "react";

// components
import { AdminView, AdminIconButton, Loading } from "@/components";

// context
import { GlobalStateContext } from "@context/GlobalContext";

// hooks
import {useAppNavigate} from "../hooks/useAppNavigate"

export const PageContainer = ({
  children,
  isLoading,
  headerText,
}: {
  children: ReactNode;
  isLoading: boolean;
  headerText?: string;
}) => {
  const { error, isAdmin } = useContext(GlobalStateContext);
  const navigate = useAppNavigate();

  if (isLoading) return <Loading />;

  return (
    <div className="p-4 mb-28">
      {isAdmin && (
        <AdminIconButton
          setShowSettings={() => navigate('/leaderboard')}
          showSettings={false}
        />
      )}
      {headerText && <div className="pb-6"><h2>{headerText}</h2></div>}
      {children}
      {error && <p className="p3 pt-10 text-center text-error">{error}</p>}
    </div>
  );
};

export default PageContainer;

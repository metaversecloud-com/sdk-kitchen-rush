import { useNavigate, useSearchParams } from "react-router-dom";

export const useAppNavigate = () => {
  const navigate = useNavigate();
  // grab current search params to preserve them across navigation
  const [searchParams] = useSearchParams();

  return (path: string | number, options?: object) => {
    // if path is a number (e.g. -1), navigate directly without appending params
    if (typeof path === "number") {
      navigate(path);
    } else {
    // append existing search params to the new path so they aren't lost
      navigate(`${path}?${searchParams.toString()}`, options);
    }
  };
};
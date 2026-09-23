import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApiGetMeQuery } from "@/src/redux/api";
import { setUser, removeUser } from "@/src/redux/reducers/authSlice";
import { useDispatch } from "react-redux";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: userdata, error, isLoading } = useApiGetMeQuery({});

  useEffect(() => {
    if (isLoading) return;
    if (userdata?.success && userdata?.data?.user) {
      dispatch(setUser({ user: userdata.data.user }));
      
    } else if (error) {
      dispatch(removeUser());
      navigate("/login", { replace: true });
    }
  }, [userdata, error, dispatch, isLoading]);

  return <>{children}</>;
}

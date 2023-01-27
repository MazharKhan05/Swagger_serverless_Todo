import React, { useState } from "react";
import "./App.css";
import Todos from "./components/Todos";
import { useCookies, CookiesProvider } from "react-cookie";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginRedirect from "./auth/cognitoRedirect";

const App: React.FC = () => {
  const [isChanged, setIsChanged] = useState<boolean>(true);
  const [cookies, setCookie, removeCookie] = useCookies([
    "id_token",
    "access_token",
    "refresh_token",
    "email",
    "userId",
  ]);
  return (
    <div className="px-4 py-2">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              !cookies.access_token ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "100vh" }}
                >
                  <a
                    href={`https://auth.koknirecipe.com/login?client_id=${process.env.REACT_APP_COGNITO_CLIENT_ID}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+profile&redirect_uri=${process.env.REACT_APP_COGNITO_CALLBACK_URL}`}
                  >
                    <button className="rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2">
                      Login with Cognito
                    </button>
                  </a>
                </div>
              ) : (
                <>
                  <CookiesProvider>
                    <Todos isChanged={isChanged} setIsChanged={setIsChanged} />
                  </CookiesProvider>
                </>
              )
            }
          />
          <Route path="/auth/cognitoRedirect" element={<LoginRedirect />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;

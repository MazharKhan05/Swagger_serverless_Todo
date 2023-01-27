import { useEffect, useState } from "react";
import queryString from "query-string";
import { useCookies } from "react-cookie";
import axios from "axios";
import qs from "qs";
import { useNavigate } from "react-router-dom";

interface jwtKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}

const LoginRedirect = () => {
  const [text, setText] = useState("Loading...");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  let params = queryString.parse(window.location.search);
  const [cookies, setCookie] = useCookies([
    "id_token",
    "access_token",
    "refresh_token",
    "email",
    "userId",
  ]);
  const navigate = useNavigate();

  const jwksUrl = `https://cognito-idp.us-east-1.amazonaws.com/${process.env.REACT_APP_COGNITO_POOL_ID}/.well-known/jwks.json`;
  const adminBasicToken = btoa(
    process.env.REACT_APP_COGNITO_CLIENT_ID +
      ":" +
      process.env.REACT_APP_COGNITO_SECRET
  ); //added extra authorization header for cognito-token endpoint
  // const client = jwksClient({
  //     cache: true,
  //     cacheMaxEntries: 5, // Default value
  //     cacheMaxAge: ms('10h'), // Default value
  //     strictSsl: true, // Default value
  //     jwksUri: jwksUrl,
  // });

  async function awsCallTokenEndpoint(grantType: string, accessToken: string) {
    const data = {
      grant_type: grantType,
      client_id: process.env.REACT_APP_COGNITO_CLIENT_ID,
      code: accessToken,
      scope: "profile",
      redirect_uri: process.env.REACT_APP_COGNITO_CALLBACK_URL,
    };

    const p: object = {
      method: "post",
      data: qs.stringify(data),
      url: `${process.env.REACT_APP_COGNITO_DOMAIN}/oauth2/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${adminBasicToken}`,
      },
      auth: {
        username: process.env.REACT_APP_COGNITO_CLIENT_ID,
        password: process.env.REACT_APP_COGNITO_SECRET,
      },
    };
    const awsResponse = await axios(p);

    return awsResponse;
  }
  useEffect(() => {
    const callTokenEndpoint = async (code: string) => {
      const awsAuthorizationCodeResponse = await awsCallTokenEndpoint(
        "authorization_code",
        code
      );

      let expires = new Date();
      expires.setTime(
        expires.getTime() + awsAuthorizationCodeResponse.data.expires_in * 1000
      );
      setCookie("id_token", awsAuthorizationCodeResponse.data.id_token, {
        path: "/",
        expires,
      });
      setCookie(
        "access_token",
        awsAuthorizationCodeResponse.data.access_token,
        { path: "/", expires }
      );
      setCookie(
        "refresh_token",
        awsAuthorizationCodeResponse.data.refresh_token,
        { path: "/", expires }
      );
      if (awsAuthorizationCodeResponse.data.id_token) {
        setText("You have successfully loggedIn, will be redirect to homepage");
        setIsAuthenticated(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };
    if (params && params.code) {
      callTokenEndpoint(params.code as string);
    }
  }, [params.code]);

  return <p>{text}</p>;
};

export default LoginRedirect;

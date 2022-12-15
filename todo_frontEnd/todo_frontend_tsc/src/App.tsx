import React, { useState } from 'react';
import './App.css';
import Todos from './components/Todos';
import { useCookies,CookiesProvider } from 'react-cookie'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginRedirect from './auth/cognitoRedirect';

const App: React.FC = () => {
  const [isChanged, setIsChanged] = useState<boolean>(true);
  const [cookies, setCookie, removeCookie] = useCookies(['id_token','access_token', 'refresh_token', 'email', 'userId'])
  const handleLogout= (event: React.MouseEvent<HTMLButtonElement>)=>{
      event.preventDefault()
      removeCookie("id_token");
      removeCookie("access_token");
      removeCookie("refresh_token");
  }
  return (
    <div className="px-4 py-2">
      
        <Router>
          <Routes>
            <Route path="/"  element={
              !cookies.access_token ? 
                <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
                  <a href={`https://serverless-todos.auth.us-east-1.amazoncognito.com/login?client_id=2rb2lfu93hvutava8ra1ho0imb&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+profile&redirect_uri=http://localhost:3000/auth/cognitoRedirect`}>
                      <button className="rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2">Login with Cognito</button>
                  </a>
                </div> : 
                <>
                  <div className='d-flex justify-content-between px-2 py-1'>
                    <h2 className='text-center text-2xl font-semibold'>Todos Serverless</h2>
                    {cookies.access_token ? <button onClick={handleLogout} className=" rounded-md border border-transparent py-1 px-2 text-sm text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2">Logout</button> : <></>}
                  </div>
                  <CookiesProvider>
                    <Todos isChanged={isChanged} setIsChanged={setIsChanged} />
                  </CookiesProvider>
                </>
            } />
            <Route path="/auth/cognitoRedirect" element={<LoginRedirect />} />
          </Routes>
        </Router>
      
    </div>
    
  );
}

export default App;

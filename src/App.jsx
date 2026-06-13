import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Trend from "./pages/Trend";

//////////////////////////////////////////////////
// PRIVATE ROUTE
//////////////////////////////////////////////////

function PrivateRoute({ children }) {

  const isLogin =
    localStorage.getItem("isLogin");

  return isLogin
    ? children
    : <Navigate to="/" />;
}

//////////////////////////////////////////////////
// APP
//////////////////////////////////////////////////

function App() {

  return (

    <div className="app-root">

      <BrowserRouter>

        <Routes>

          {/* LOGIN */}
          <Route
            path="/"
            element={<Login />}
          />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* HISTORY */}
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />

          {/* TREND */}
          <Route
            path="/trend"
            element={
              <PrivateRoute>
                <Trend />
              </PrivateRoute>
            }
          />

        </Routes>

      </BrowserRouter>

    </div>
  );
}

export default App;
import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import BuyTransactions from "../pages/BuyTransactions";
import Login from "../pages/Login";
import MyProducts from "../pages/MyProducts";
import ProductCreate from "../pages/ProductCreate";
import ProductDetail from "../pages/ProductDetail";
import ProductEdit from "../pages/ProductEdit";
import ProductList from "../pages/ProductList";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import ReviewPage from "../pages/ReviewPage";
import SellTransactions from "../pages/SellTransactions";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/products" replace /> },
      { path: "/products", element: <ProductList /> },
      { path: "/products/:id", element: <ProductDetail /> },
      {
        path: "/products/create",
        element: (
          <ProtectedRoute>
            <ProductCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: "/products/:id/edit",
        element: (
          <ProtectedRoute>
            <ProductEdit />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my/products",
        element: (
          <ProtectedRoute>
            <MyProducts />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my/buy-transactions",
        element: (
          <ProtectedRoute>
            <BuyTransactions />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my/sell-transactions",
        element: (
          <ProtectedRoute>
            <SellTransactions />
          </ProtectedRoute>
        ),
      },
      {
        path: "/transactions/:id/review",
        element: (
          <ProtectedRoute>
            <ReviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;

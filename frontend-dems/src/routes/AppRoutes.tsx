// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../screens/Dashboard";
import Buyer from "../screens/Buyer";
import Home from "../screens/Home";
import Seller from "../screens/Seller";

import Layout from "../components/Layout";

const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/buyer" element={<Buyer />} />
        <Route path="/seller" element={<Seller />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;

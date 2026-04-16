import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

const DonorPage = lazy(() => import("./pages/DonorPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<main className="container">Loading dashboard...</main>}>
        <Routes>
          <Route path="/" element={<Navigate to="/donor" replace />} />
          <Route path="/donor" element={<DonorPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

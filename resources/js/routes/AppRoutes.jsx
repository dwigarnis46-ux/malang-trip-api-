import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';

import Login from '../Login';
import Dashboard from '../Dashboard';

import MainLayout from '../Layouts/MainLayout';

import Kategori from '../Pages/Kategori/Index';
import Wisata from '../Pages/Wisata/Index';
import Galeri from '../Pages/Galeri/Index';
import Video from '../Pages/Video/Index';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('admin_token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AdminLayout({ children }) {
    return (
        <ProtectedRoute>
            <MainLayout>
                {children}
            </MainLayout>
        </ProtectedRoute>
    );
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <AdminLayout>
                            <Dashboard />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/kategori"
                    element={
                        <AdminLayout>
                            <Kategori />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/wisata"
                    element={
                        <AdminLayout>
                            <Wisata />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/galeri"
                    element={
                        <AdminLayout>
                            <Galeri />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/video"
                    element={
                        <AdminLayout>
                            <Video />
                        </AdminLayout>
                    }
                />

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar() {
    const navigate = useNavigate();

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: '⌂',
        },
        {
            name: 'Kategori',
            path: '/kategori',
            icon: '▤',
        },
        {
            name: 'Wisata',
            path: '/wisata',
            icon: '♧',
        },
        {
            name: 'Galeri',
            path: '/galeri',
            icon: '▣',
        },
        {
            name: 'Video',
            path: '/video',
            icon: '▶',
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
        navigate('/login');
    };

    return (
        <aside className="sidebar">

            {/* LOGO */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    ◈
                </div>

                <div className="logo-text">
                    <span>Explore</span>
                    <strong>Malang</strong>
                </div>
            </div>

            {/* MENU */}
            <nav className="sidebar-menu">

                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-menu-item ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        <span className="sidebar-icon">
                            {item.icon}
                        </span>

                        <span>{item.name}</span>
                    </NavLink>
                ))}

                {/* LOGOUT */}
                <button
                    type="button"
                    className="sidebar-menu-item sidebar-logout"
                    onClick={handleLogout}
                >
                    <span className="sidebar-icon">
                        ⇥
                    </span>

                    <span>Logout</span>
                </button>

            </nav>

        </aside>
    );
}

export default Sidebar;
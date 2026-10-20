
import Sidebar from '../components/Sidebar';

function MainLayout({ children }) {
    return (
        <>
            <style>{`
                * {
                    box-sizing: border-box;
                }

                html,
                body,
                #root {
                    width: 100%;
                    min-height: 100%;
                    margin: 0;
                }

                body {
                    overflow-x: hidden;
                }

                .admin-layout {
                    display: flex;
                    align-items: flex-start;
                    width: 100%;
                    min-height: 100vh;
                    height: auto;
                    overflow: visible;
                    background: #F8FCFF;
                }

                .main-content {
                    flex: 1;
                    width: calc(100% - 253px);
                    min-width: 0;
                    min-height: 100vh;
                    height: auto;
                    margin-left: 253px;
                    padding: 3px 5px;
                    background: #F8FCFF;
                    overflow: visible;
                    box-sizing: border-box;
                }

                @media (max-width: 700px) {
                    .main-content {
                        width: calc(100% - 230px);
                        margin-left: 230px;
                        padding: 10px;
                    }
                }
            `}</style>

            <div className="admin-layout">
                <Sidebar />

                <main className="main-content">
                    {children}
                </main>
            </div>
        </>
    );
}

export default MainLayout;
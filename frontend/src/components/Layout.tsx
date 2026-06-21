import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : "");

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand" onClick={() => navigate("/search")}>
            <div className="logo">CR</div>
            <div>
              <div className="title">ChiRews</div>
              <div className="subtitle">
                Отзывы, рекомендации и аналитика по заказам из Китая
              </div>
            </div>
          </div>
          <nav className="nav">
            <NavLink to="/search" className={navClass}>
              Поиск
            </NavLink>
            <NavLink to="/new" className={navClass}>
              Оставить отзыв
            </NavLink>
            <NavLink to="/analytics" className={navClass}>
              Аналитика
            </NavLink>
            <NavLink to="/profile" className={navClass}>
              Профиль
            </NavLink>
            {user ? (
              <a
                href="#logout"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                  navigate("/search");
                }}
              >
                Выйти ({user.display_name || user.email})
              </a>
            ) : (
              <NavLink to="/auth" className={navClass}>
                Войти
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { UserProvider } from './contexts/UserContext'
import { PrizeProvider } from './contexts/PrizeContext'
import Registration from './components/Registration'
import { CheckCircle } from 'lucide-react'
import { useUser } from './contexts/UserContext'

function RegistrationApp() {
  const { currentUser } = useUser();

  if (currentUser) {
    return (
      <div className="container center-screen">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ margin: '0 auto 20px', color: '#4ade80' }}><CheckCircle size={64} /></div>
          <h1>您已注册成功！</h1>
          <p style={{ margin: '20px 0', color: '#ccc' }}>
            请关注大屏幕，祝您中奖！
          </p>
          <div className="winner-card" style={{ justifyContent: 'center', margin: '20px auto' }}>
            <img src={currentUser?.avatarUrl} className="avatar-md" />
            <div className="winner-info" style={{ textAlign: 'left' }}>
              <h3>{currentUser?.name}</h3>
              <span>{currentUser?.employeeId}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Registration />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <PrizeProvider>
        <RegistrationApp />
      </PrizeProvider>
    </UserProvider>
  </StrictMode>,
)

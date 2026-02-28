import type { Chat } from '../../types/recipe';
import { LogOut, PlusCircle, User, MessageSquare } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  chatHistory: Chat[];
  activeChatId?: string | null;
  onSelectChat: (id: string) => void;
  onLogout: () => void;
  onNewChat: () => void;
  userEmail?: string;
}

export const Sidebar = ({ chatHistory, activeChatId, onSelectChat, onLogout, onNewChat, userEmail }: SidebarProps) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">History</h3>
        <button className="new-chat-btn" onClick={onNewChat} title="New Recipe Search">
          <PlusCircle size={20} />
        </button>
      </div>

      <div className="history-list">
        {chatHistory.length === 0 ? (
          <p className="empty-msg">No history yet</p>
        ) : (
          chatHistory.map((chat) => (
            <div 
              key={chat.id} 
              className={`history-item chat-item ${activeChatId === chat.id ? 'active' : ''}`} 
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="chat-icon">
                <MessageSquare size={16} />
              </div>
              <div className="info">
                <span className="title">{chat.title}</span>
                <span className="date">
                  {chat.created_at ? new Date(chat.created_at).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        {userEmail && (
          <div className="user-info-badge">
            <div className="user-icon">
              <User size={16} />
            </div>
            <span className="user-email-text">{userEmail}</span>
          </div>
        )}
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

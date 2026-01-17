'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  senderUserId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  messages: Message[];
}

interface User {
  id: string;
  name: string;
  role: 'student' | 'mentor';
}

export default function MessagesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur actuel et tous les utilisateurs
  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      router.push('/login');
      return;
    }

    // Charger l'utilisateur actuel
    const userData = localStorage.getItem(`user_${userId}`);
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    // Charger tous les utilisateurs
    const users: User[] = [];
    for (const key in localStorage) {
      if (key.startsWith('user_')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const user = JSON.parse(data);
            if (user.id !== userId) {
              users.push(user);
            }
          } catch (e) {
            console.error('Erreur lors de la lecture de l\'utilisateur', e);
          }
        }
      }
    }
    setAllUsers(users);

    // Sélectionner le premier utilisateur par défaut
    if (users.length > 0) {
      setSelectedUserId(users[0].id);
    }

    setIsLoading(false);
  }, [router]);

  // Charger les messages de la conversation
  useEffect(() => {
    if (!currentUser || !selectedUserId) return;

    const conversationId = [currentUser.id, selectedUserId].sort().join('_');
    const conversationData = localStorage.getItem(`conversation_${conversationId}`);

    if (conversationData) {
      try {
        const conversation: Conversation = JSON.parse(conversationData);
        setMessages(conversation.messages);
      } catch (e) {
        console.error('Erreur lors de la lecture de la conversation', e);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentUser, selectedUserId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser || !selectedUserId) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderUserId: currentUser.id,
      senderName: currentUser.name,
      text: newMessage,
      timestamp: Date.now(),
    };

    const conversationId = [currentUser.id, selectedUserId].sort().join('_');
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    // Sauvegarder la conversation
    const conversation: Conversation = {
      id: conversationId,
      user1Id: currentUser.id,
      user2Id: selectedUserId,
      messages: updatedMessages,
    };

    localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(conversation));
    setNewMessage('');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Chargement...</div>;
  }

  if (!currentUser) {
    return null;
  }

  const selectedUser = allUsers.find((u) => u.id === selectedUserId);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Mes Messages</h1>

      {allUsers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-gray-700 mb-4">Aucun autre utilisateur trouvé</p>
          <p className="text-sm text-gray-600">
            Crée un autre compte pour commencer à discuter!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Liste des utilisateurs */}
          <div className="lg:col-span-1 bg-secondary rounded-lg border border-border p-4">
            <h2 className="text-lg font-semibold mb-4">Utilisateurs</h2>
            <div className="space-y-2">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    selectedUserId === user.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <div className="font-semibold">
                    {user.role === 'mentor' ? '👨‍🏫' : '👨‍🎓'} {user.name}
                  </div>
                  <div className="text-xs opacity-75">
                    {user.role === 'mentor' ? 'Mentor' : 'Étudiant'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Zone de chat */}
          <div className="lg:col-span-3 bg-background rounded-lg border border-border flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-secondary border-b border-border p-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">
                {selectedUser?.role === 'mentor' ? '👨‍🏫' : '👨‍🎓'} {selectedUser?.name}
              </h2>
              <p className="text-sm text-gray-600">
                Tu es: {currentUser.role === 'mentor' ? '👨‍� Mentor' : '👨‍� Étudiant'}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Aucun message pour le moment. Commence la conversation!
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderUserId === currentUser.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderUserId === currentUser.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {msg.senderUserId !== currentUser.id && (
                        <div className="text-xs font-semibold opacity-90">{msg.senderName}</div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <div className="text-xs opacity-75 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {/* Prévisualisation du message en cours */}
              {newMessage.trim() && (
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-100 text-blue-900 opacity-75 italic border-2 border-blue-300">
                    <p className="text-sm">{newMessage}</p>
                    <div className="text-xs opacity-60 mt-1">En cours...</div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4 bg-white rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Écris ton message..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

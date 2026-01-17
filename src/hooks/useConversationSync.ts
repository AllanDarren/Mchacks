'use client';

/**
 * Hook pour synchroniser les messages en temps réel entre les onglets
 * Utilise le localStorage pour communiquer entre les onglets
 */

import { useEffect, useState, useCallback } from 'react';

export interface Message {
  id: string;
  senderUserId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  messages: Message[];
}

export function useConversationSync(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  // Charger les messages initiaux
  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  // Écouter les changements dans les autres onglets
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `conversation_${conversationId}`) {
        loadMessages();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [conversationId]);

  // Écouter les changements avec un intervalle pour les mêmes onglets
  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem(`conversation_${conversationId}`);
      if (current) {
        try {
          const conversation: Conversation = JSON.parse(current);
          setMessages(conversation.messages);
        } catch (e) {
          console.error('Erreur lors de la lecture de la conversation', e);
        }
      }
    }, 500); // Vérifier toutes les 500ms

    return () => clearInterval(interval);
  }, [conversationId]);

  const loadMessages = useCallback(() => {
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
  }, [conversationId]);

  const addMessage = useCallback(
    (message: Message) => {
      const conversationData = localStorage.getItem(`conversation_${conversationId}`);
      let conversation: Conversation;

      if (conversationData) {
        conversation = JSON.parse(conversationData);
      } else {
        // Créer une nouvelle conversation si elle n'existe pas
        const [user1Id, user2Id] = conversationId.split('_');
        conversation = {
          id: conversationId,
          user1Id,
          user2Id,
          messages: [],
        };
      }

      conversation.messages.push(message);
      localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(conversation));
      setMessages(conversation.messages);
    },
    [conversationId]
  );

  return { messages, addMessage };
}

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp, getDoc, doc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { MessageCircle, Trash2 } from 'lucide-react';
import Loading from './Loading';

export default function Messaging() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            fetchChats();
        }
    }, [currentUser]);

    const fetchChats = async () => {
        if (!currentUser) return;

        try {
            const chatsRef = collection(db, 'chats');
            const q = query(
                chatsRef,
                where('participants', 'array-contains', currentUser.uid)
            );

            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const chatsMap = new Map();

                for (const docSnap of snapshot.docs) {
                    const chat = { id: docSnap.id, ...docSnap.data() };

                    const otherParticipantId = chat.participants.find(id => id !== currentUser.uid);
                    if (otherParticipantId) {
                        try {
                            const userDoc = await getDoc(doc(db, 'users', otherParticipantId));
                            if (userDoc.exists()) {
                                const userData = userDoc.data();
                                chat.otherUser = {
                                    id: otherParticipantId,
                                    name: userData.name || userData.username || 'Unknown User',
                                    role: userData.role || 'learner',
                                    photoURL: userData.photoURL || '',
                                    location: userData.location || ''
                                };
                            } else {
                                chat.otherUser = {
                                    id: otherParticipantId,
                                    name: chat.participantNames?.[otherParticipantId] || 'Unknown User',
                                    role: 'learner',
                                    photoURL: '',
                                    location: ''
                                };
                            }
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                            chat.otherUser = {
                                id: otherParticipantId,
                                name: chat.participantNames?.[otherParticipantId] || 'Unknown User',
                                role: 'learner',
                                photoURL: '',
                                location: ''
                            };
                        }

                        const participantKey = [currentUser.uid, otherParticipantId].sort().join('_');

                        const existingChat = chatsMap.get(participantKey);

                        if (!existingChat) {
                            chatsMap.set(participantKey, chat);
                        } else {
                            const existingTime = existingChat.lastMessageAt?.toDate?.() || existingChat.createdAt?.toDate?.();
                            const currentTime = chat.lastMessageAt?.toDate?.() || chat.createdAt?.toDate?.();

                            if (currentTime > existingTime) {
                                chatsMap.set(participantKey, chat);
                                await deleteDuplicateChat(existingChat.id);
                            } else {
                                await deleteDuplicateChat(chat.id);
                            }
                        }
                    }
                }

                const uniqueChatsList = Array.from(chatsMap.values());
                setChats(uniqueChatsList);
                setLoading(false);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error fetching chats:', error);
            setLoading(false);
        }
    };

    const deleteDuplicateChat = async (chatId) => {
        try {
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            const messagesSnapshot = await getDocs(messagesRef);

            const deletePromises = messagesSnapshot.docs.map(messageDoc =>
                deleteDoc(doc(db, 'chats', chatId, 'messages', messageDoc.id))
            );

            await Promise.all(deletePromises);

            await deleteDoc(doc(db, 'chats', chatId));

            console.log(`Deleted duplicate chat: ${chatId}`);
        } catch (error) {
            console.error('Error deleting duplicate chat:', error);
        }
    };

    const fetchMessages = (chatId) => {
        if (!chatId) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesList = [];
            snapshot.forEach(doc => {
                messagesList.push({ id: doc.id, ...doc.data() });
            });
            setMessages(messagesList);
        });

        return unsubscribe;
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        try {
            await addDoc(collection(db, 'chats', selectedChat, 'messages'), {
                text: newMessage,
                sender: currentUser.uid,
                senderName: currentUser.username || currentUser.name || 'You',
                timestamp: serverTimestamp()
            });

            const chatRef = doc(db, 'chats', selectedChat);
            await updateDoc(chatRef, {
                lastMessage: newMessage,
                lastMessageAt: serverTimestamp()
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    const handleChatSelect = (chatId) => {
        setSelectedChat(chatId);
        const unsubscribe = fetchMessages(chatId);
        return unsubscribe;
    };

    const getLastMessageTime = (chat) => {
        if (!chat.lastMessageAt) return 'No messages yet';
        const date = chat.lastMessageAt.toDate ? chat.lastMessageAt.toDate() : new Date(chat.lastMessageAt);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="h-[calc(100vh-140px)] flex bg-white rounded-lg shadow-sm border border-gray-200 m-6">
            <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {chats.length} conversation{chats.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => handleChatSelect(chat.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {chat.otherUser?.photoURL ? (
                                    <img
                                        src={chat.otherUser.photoURL}
                                        alt={chat.otherUser.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {chat.otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {chat.otherUser?.name || 'Unknown User'}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {getLastMessageTime(chat)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">
                                        {chat.otherUser?.role && (
                                            <span className="capitalize text-xs bg-gray-100 px-2 py-1 rounded-full">
                                                {chat.otherUser.role}
                                            </span>
                                        )}
                                    </p>
                                    {chat.lastMessage && (
                                        <p className="text-sm text-gray-500 truncate mt-1">
                                            {chat.lastMessage}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {chats.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold mb-2">No conversations yet</h3>
                            <p className="text-sm">Connect with people to start messaging!</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        <div className="p-4 border-b border-gray-200 bg-white">
                            <div className="flex items-center gap-3">
                                {chats.find(c => c.id === selectedChat)?.otherUser?.photoURL ? (
                                    <img
                                        src={chats.find(c => c.id === selectedChat)?.otherUser?.photoURL}
                                        alt={chats.find(c => c.id === selectedChat)?.otherUser?.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {chats.find(c => c.id === selectedChat)?.otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {chats.find(c => c.id === selectedChat)?.otherUser?.name || 'Unknown User'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {chats.find(c => c.id === selectedChat)?.otherUser?.role && (
                                            <span className="capitalize">
                                                {chats.find(c => c.id === selectedChat)?.otherUser?.role}
                                            </span>
                                        )}
                                        {chats.find(c => c.id === selectedChat)?.otherUser?.location && (
                                            <span className="ml-2">• {chats.find(c => c.id === selectedChat)?.otherUser?.location}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MessageCircle className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.sender === currentUser.uid
                                                ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-black rounded-br-none'
                                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                                                } shadow-sm`}
                                        >
                                            <p className="text-sm">{message.text}</p>
                                            <p className="text-xs opacity-70 mt-1 text-right">
                                                {message.timestamp?.toDate?.()?.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) || 'Sending...'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none"
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="bg-gradient-to-r from-blue-400 to-blue-500 text-black px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <span>Send</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                            <p>Choose a chat from the list to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
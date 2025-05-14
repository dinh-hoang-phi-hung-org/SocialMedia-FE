import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { IoSend } from "react-icons/io5";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoCallOutline } from "react-icons/io5";
import { IoVideocamOutline } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { IoImageOutline } from "react-icons/io5";
import { BsMic } from "react-icons/bs";

// Sample data for contacts
const contacts = [
  {
    id: 1,
    name: "John Doe",
    profilePicture: "/assets/images/sample-avatar.jpeg",
    lastMessage: "Hey, how are you doing?",
    lastMessageTime: "2h",
    isOnline: true,
    unreadCount: 2,
  },
  {
    id: 2,
    name: "Jane Smith",
    profilePicture: "/assets/images/sample-avatar.jpeg",
    lastMessage: "Did you see my latest post?",
    lastMessageTime: "5h",
    isOnline: true,
    unreadCount: 0,
  },
  {
    id: 3,
    name: "Mike Johnson",
    profilePicture: "/assets/images/sample-avatar.jpeg",
    lastMessage: "Let's meet tomorrow at 9 am",
    lastMessageTime: "1d",
    isOnline: false,
    unreadCount: 0,
  },
  {
    id: 4,
    name: "Sarah Williams",
    profilePicture: "/assets/images/sample-avatar.jpeg",
    lastMessage: "Thanks for the help!",
    lastMessageTime: "2d",
    isOnline: false,
    unreadCount: 0,
  },
  {
    id: 5,
    name: "Alex Brown",
    profilePicture: "/assets/images/sample-avatar.jpeg",
    lastMessage: "Check out this link",
    lastMessageTime: "3d",
    isOnline: false,
    unreadCount: 5,
  },
];

// Sample messages for the selected conversation
const sampleMessages = [
  {
    id: 1,
    senderId: 1,
    text: "Hey there! How are you doing?",
    timestamp: "Today 10:30 AM",
    isOwn: false,
  },
  {
    id: 2,
    senderId: "me",
    text: "I'm good, thanks for asking! Just working on some new designs.",
    timestamp: "Today 10:32 AM",
    isOwn: true,
  },
  {
    id: 3,
    senderId: 1,
    text: "That sounds interesting. Can you share some of your work?",
    timestamp: "Today 10:34 AM",
    isOwn: false,
  },
  {
    id: 4,
    senderId: "me",
    text: "Sure, I'll send you some screenshots soon.",
    timestamp: "Today 10:36 AM",
    isOwn: true,
  },
  {
    id: 5,
    senderId: 1,
    text: "Great! Looking forward to seeing them.",
    timestamp: "Today 10:37 AM",
    isOwn: false,
  },
  {
    id: 6,
    senderId: "me",
    text: "Also, are you coming to the team meeting tomorrow?",
    timestamp: "Today 10:40 AM",
    isOwn: true,
  },
  {
    id: 7,
    senderId: 1,
    text: "Yes, I'll be there. Do you need me to prepare anything specific?",
    timestamp: "Today 10:45 AM",
    isOwn: false,
  },
];

const ChatInterface = () => {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(sampleMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter contacts based on search term
  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Scroll to bottom of messages on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg = {
      id: messages.length + 1,
      senderId: "me",
      text: newMessage,
      timestamp: "Just now",
      isOwn: true,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[90vh] w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Left sidebar - Contacts */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-center">Messages</h2>
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-purple"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                selectedContact.id === contact.id ? "bg-gray-100" : ""
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={contact.profilePicture}
                    alt={contact.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 ml-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{contact.name}</span>
                  <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 truncate max-w-[150px]">{contact.lastMessage}</p>
                  {contact.unreadCount > 0 && (
                    <span className="bg-primary-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={selectedContact.profilePicture}
                alt={selectedContact.name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="ml-3">
              <h3 className="font-semibold">{selectedContact.name}</h3>
              <p className="text-xs text-gray-500">{selectedContact.isOnline ? "Active now" : "Offline"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-primary-purple">
              <IoCallOutline size={22} />
            </button>
            <button className="text-gray-600 hover:text-primary-purple">
              <IoVideocamOutline size={24} />
            </button>
            <button className="text-gray-600 hover:text-primary-purple">
              <IoIosInformationCircleOutline size={24} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                {!message.isOwn && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    <Image
                      src={selectedContact.profilePicture}
                      alt={selectedContact.name}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? "bg-primary-purple text-white rounded-tr-none"
                      : "bg-white border border-gray-200 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isOwn ? "text-gray-200" : "text-gray-500"}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-primary-purple p-2">
              <IoImageOutline size={22} />
            </button>
            <button className="text-gray-500 hover:text-primary-purple p-2">
              <BsEmojiSmile size={20} />
            </button>
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
              <textarea
                className="flex-1 bg-transparent outline-none resize-none max-h-20 text-sm"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
              />
              {newMessage.trim() === "" ? (
                <button className="text-gray-500 hover:text-primary-purple ml-2">
                  <BsMic size={20} />
                </button>
              ) : (
                <button className="text-primary-purple hover:text-primary-purple-dark ml-2" onClick={handleSendMessage}>
                  <IoSend size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

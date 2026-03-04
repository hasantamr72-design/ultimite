// 🔥 projict Chat - PRO MAX + SECRET ADMIN PANEL 🔥
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function UltimateChat() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [bannedUsers, setBannedUsers] = useState([]);

  useEffect(() => {
    signInAnonymously(auth);
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(newMessages);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (xp >= 500) {
      const lvlUp = Math.floor(xp / 500);
      setLevel(prev => prev + lvlUp);
      setXp(xp % 500);
    }
  }, [xp]);

  if (bannedUsers.includes(username)) {
    return <div style={{color:"red",fontSize:"30px",textAlign:"center"}}>🚫 You Are Banned</div>;
  }

  if (!loggedIn) {
    return (
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#3b82f6"}}>
        <div style={{background:"white",padding:"30px",borderRadius:"20px"}}>
          <h2>Ultimate 🔥</h2>
          <input placeholder="Enter PIN" maxLength={4} value={pin} onChange={(e)=>setPin(e.target.value)} />
          <input placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <button onClick={()=>{
            if(pin === "6767"){ setLoggedIn(true); }
            if(pin === "9999"){ setLoggedIn(true); setIsAdmin(true); }
          }}>Login</button>
        </div>
      </div>
    );
  }

  const sendMessage = async () => {
    if (!message.trim()) return;
    const words = message.trim().split(/\s+/).length;
    setXp(prev => prev + words * 100);

    await addDoc(collection(db, "messages"), {
      text: message,
      user: username,
      createdAt: new Date()
    });
    setMessage("");
  };

  const banUser = (user) => {
    setBannedUsers([...bannedUsers, user]);
  };

  const deleteMessage = async (id) => {
    await deleteDoc(doc(db, "messages", id));
  };

  const clearChat = async () => {
    messages.forEach(async (msg) => {
      await deleteMessage(msg.id);
    });
  };

  return (
    <div style={{background:"#eff6ff",minHeight:"100vh",padding:"20px"}}>
      <h1 style={{background:"#2563eb",color:"white",padding:"15px"}}>Ultimate 💬</h1>

      <div style={{display:"flex",gap:"20px"}}>
        <div style={{flex:2,background:"white",padding:"15px"}}>
          <div style={{height:"300px",overflowY:"auto"}}>
            {messages.map((msg)=>(
              <div key={msg.id} style={{borderBottom:"1px solid #ddd",marginBottom:"5px"}}>
                <strong>{msg.user}</strong>: {msg.text}
                {isAdmin && (
                  <>
                    <button onClick={()=>banUser(msg.user)}> 🚫 Ban </button>
                    <button onClick={()=>deleteMessage(msg.id)}> 🗑 Delete </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <input maxLength={200} value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Write message..." />
          <button onClick={sendMessage}>Send 🚀</button>
        </div>

        <div style={{flex:1,background:"white",padding:"15px"}}>
          <h3>👤 Profile</h3>
          <p>Level: {level}</p>
          <p>XP: {xp}/500</p>

          {isAdmin && (
            <div style={{marginTop:"20px",padding:"10px",border:"2px solid red"}}>
              <h4>🔐 SECRET ADMIN PANEL</h4>
              <button onClick={clearChat} style={{background:"red",color:"white"}}>Clear Entire Chat</button>
              <p>Total Messages: {messages.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

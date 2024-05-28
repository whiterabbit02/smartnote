import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheet/UserProfile.css';
import '../stylesheet/global.css';

const UserProfile = ({ user, onGoBack, onUpdateUser}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user.nickname);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [tempNickname, setTempNickname] = useState(user.nickname);
  const [tempUsername, setTempUsername] = useState(user.username);
  const [tempEmail, setTempEmail] = useState(user.email);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedUser = {
      nickname: tempNickname,
      username: tempUsername,
      email: tempEmail
    };

    axios.put('http://localhost:5000/api/user', updatedUser, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setNickname(tempNickname);
        setUsername(tempUsername);
        setEmail(tempEmail);
        setIsEditing(false);

        // Обновление состояния пользователя в App.js
        if (onUpdateUser) {
          onUpdateUser({
            nickname: tempNickname,
            username: tempUsername,
            email: tempEmail
          });
        }
      })
      .catch(error => {
        console.error('Error updating profile', error);
      });
  };

    const handleCancel = () => {
    setTempNickname(nickname);
    setTempUsername(username);
    setTempEmail(email);
    setIsEditing(false);
  };

  return (
    <div className="container">
      <div className="profile">
        <div className="profile-pic">PIC</div>

        <div className="nickname">
         {isEditing ? (
           <input value={tempNickname} onChange={(e) => setTempNickname(e.target.value)} />
         ) : (
           <span>{nickname}</span>
         )}
        </div>
      </div>

      <div className="user-info">
        <p>Username: {isEditing ? <input value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} /> : <span>{username}</span>}</p>
        <p>Email: {isEditing ? <input value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} /> : <span>{email}</span>}</p>
      </div>

      <div className="buttons">
        {isEditing ? (
          <>
            <button className="done" onClick={handleSave}>Готово</button>
            <button className="cancel" onClick={handleCancel}>Отмена</button>
          </>
          ) : (
          <button className="edit" onClick={handleEdit}>Изменить</button>
          )}
        </div>
        <div className="back-but-cont">
          <div className="back-button" onClick={onGoBack}>
            <a href="#">&#8592;</a>
          </div>
        </div>
    </div>
      
  );
};

export default UserProfile;


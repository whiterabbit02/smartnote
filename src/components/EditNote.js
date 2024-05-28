import React, { useState, useRef } from 'react';
import axios from '../api/axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../stylesheet/EditNote.css';
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module-react';

Quill.register('modules/imageResize', ImageResize);

const EditNote = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const quillRef = useRef(null);

  const handleSave = () => {
    onSave({ ...note, title, content });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const range = quillRef.current.getEditor().getSelection();
      quillRef.current.getEditor().insertEmbed(range.index, 'image', response.data.url);
    } catch (error) {
      console.error('Ошибка при загрузке файла', error);
    }
  };

  return (
    <div className="edit-content">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="edit-note-title"
        placeholder="Заголовок"
      />
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={setContent}
        className="edit-note-content"
        placeholder="Содержание"
        modules={{
          toolbar: [
            [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
            [{size: []}],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, 
             {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'image'],
            ['clean']
          ],
          imageResize: {
            displayStyles: {
              backgroundColor: 'black',
              border: 'none',
              color: 'white'
            },
            modules: ['Resize', 'DisplaySize', 'Toolbar']
          }
        }}
      />
      <div className="edit-note-actions">
        <input type="file" onChange={handleFileUpload} />
        <button onClick={handleSave} className="save-button">Сохранить</button>
        <button onClick={onCancel} className="cancel-button">Отменить</button>
      </div>     
    </div>
  );
};

export default EditNote;

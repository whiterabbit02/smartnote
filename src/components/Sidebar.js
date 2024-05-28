import React, { useState } from 'react';
import '../stylesheet/Sidebar.css';
import '../stylesheet/global.css';

const Sidebar = ({ folders, onSelectFolder, addFolder, isOpen, toggleSidebar }) => {
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const handleSelectFolder = (folder) => {
    setSelectedFolderId(folder.id);
    onSelectFolder(folder);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="pools-container">
        <div className="pools">POOLS</div>
      </div>
      <div className="folders">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`sidebar-item ${folder.id === selectedFolderId ? 'active' : ''}`}
            onClick={() => handleSelectFolder(folder)}
          >
            {folder.name}
          </div>
        ))}
      </div>
      <div className="sidebar-item add-folder" onClick={addFolder}>+</div>
      <button className="close-sidebar" onClick={toggleSidebar}>×</button>
    </div>
  );
};

export default Sidebar;

import { useEffect, useState, useRef } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState({
    path: "",
    files: [],
  });
  const [parent, setParent] = useState(" ");
  const fileInputRef = useRef();
  const [folderName, setFolderName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then(response => response.json())
      .then(response => {
        setParent("");
        setData(response);
      },
        (error) => {
          console.log(error)
        })
  }, [])

  const ClickHandler = (event) => {
    event.preventDefault();
    //console.log(event.target.attributes.href.value)
    fetch("http://localhost:8000/?path=" + event.target.attributes.href.value)
      .then(response => response.json())
      .then(result => {
        let linkArr = result.path.split("/");
        console.log(linkArr);
        linkArr.pop();
        setParent(linkArr.join("/"));
        setData(result);
      }, (error) => {
        console.log(error)
      }
      );
  }

  // Upload file handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", data.path);
    await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData
    });
    setUploading(false);
    // Refresh file list
    fetch("http://localhost:8000/?path=" + data.path)
      .then(response => response.json())
      .then(setData);
  };

  // Create folder handler
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName) return;
    await fetch("http://localhost:8000/mkdir", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: data.path, name: folderName })
    });
    setFolderName("");
    // Refresh file list
    fetch("http://localhost:8000/?path=" + data.path)
      .then(response => response.json())
      .then(setData);
  };

  // Delete file/folder handler
  const handleDelete = async (name) => {
    if (!window.confirm(`Видалити '${name}'?`)) return;
    await fetch("http://localhost:8000/delete", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: data.path, name })
    });
    // Refresh file list
    fetch("http://localhost:8000/?path=" + data.path)
      .then(response => response.json())
      .then(setData);
  };

  return (
    <div className='file-manager'>
      <div>
        <span className="material-symbols-outlined">
          step_out
        </span>
        <a href={parent} onClick={ClickHandler}>
          LEVEL UP
        </a>
      </div>
      <div className="current-level">
        current: {data.path === "" ? "/" : data.path}
      </div>
      <ul className="folder-list">
        {data.files.map(item => {
          if (item.dir) {
            return <li key={item.name} className="fm-list-item">
              <a href={data.path + "/" + item.name} onClick={ClickHandler}>
                <span className="material-symbols-outlined folder">folder</span>
                {item.name.toUpperCase()}
              </a>
              <button className="fm-btn fm-delete" onClick={() => handleDelete(item.name)}>Видалити</button>
            </li>
          }
          else {
            return <li key={item.name} className="fm-list-item">
              <span className="material-symbols-outlined file" >file_open</span>
              {item.name}
              <button className="fm-btn fm-delete" onClick={() => handleDelete(item.name)}>Видалити</button>
            </li>
          }
        })}
      </ul>

      <form className="fm-form">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} disabled={uploading} className="fm-input" />
        {uploading && <span className="fm-uploading">Uploading...</span>}
      </form>

      <form onSubmit={handleCreateFolder} className="fm-form">
        <input type="text" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="New folder name" className="fm-input" />
        <button type="submit" className="fm-btn">Create Folder</button>
      </form>
    </div>
  )
}

export default App

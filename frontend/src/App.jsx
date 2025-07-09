import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState({
    path: "",
    files: [],
  });
  const [parent, setParent] = useState(" ");

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
            return <li key={item.name}>
              <a href={data.path + "/" + item.name} onClick={ClickHandler}>
                <span className="material-symbols-outlined folder">folder</span>
                {item.name.toUpperCase()}
              </a>

            </li>
          }
          else {
            return <li key={item.name}>
              <a href="">
                <span className="material-symbols-outlined file" >
                  file_open
                </span>
                {item.name}
              </a>

            </li>

          }
        })}
      </ul>
    </div>
  )
}

export default App

import React, { useState, useRef, useEffect } from 'react'

const Input = () => {

  const inputRef = useRef()
  const dropRef = useRef()
  const [file, setFile] = useState({
    name: '',
    lastModified: 0,
    lastModifiedDate: '',
    webkitRelativePath: "",
    size: 0,
    type: '',
  })

  useEffect(() => {
    function drop(e) {
      e.stopPropagation();
      e.preventDefault();
      const dt = e.dataTransfer;
      const files = dt.files;
      readFiles(files);
    }

    dropRef.current.addEventListener("dragenter", dragEnterOver, false);
    dropRef.current.addEventListener("dragover", dragEnterOver, false);
    dropRef.current.addEventListener("drop", drop, false);
  }, [])

  function dragEnterOver(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  const readFiles = (files) => {
    const file = files.item(0)
    setFile(file)
    const reader = new FileReader()
    reader.onloadend = (theFile) => {
      console.log('theFile:', theFile)
      var data = {
        blob: theFile.target.result,
        name: file.name,
      };
      console.log('data:', data)
    };
    reader.readAsDataURL(file);
  }
  const getFiles = (e) => {
    console.log(inputRef.current.files)
    const file = inputRef.current.files.item(0)
    setFile(file)
    const reader = new FileReader()
    reader.onloadend = (theFile) => {
      console.log('theFile:', theFile)
      var data = {
        blob: theFile.target.result,
        name: file.name,
      };
      console.log('data:', data)
    };
    reader.readAsDataURL(file);
  }


  function returnFileSize(number) {
    if (number < 1024) {
      return number + ' bytes';
    } else if (number > 1024 && number < 1048576) {
      return (number / 1024).toFixed(1) + ' KB';
    } else if (number > 1048576) {
      return (number / 1048576).toFixed(1) + ' MB';
    }
  }

  const handleFiles = () => {
    inputRef.current.click()
  }



  const { name, lastModifiedDate, size, type } = file
  return (
    <div>
      <input
        style={{ display: 'none' }}
        ref={inputRef}
        type="file"
        name="file"
        accept="audio/*"
        multiple={false}
        onChange={getFiles}
      />
      <button id="fileSelect" onClick={handleFiles}>Select some files</button>
      <p className="fileattrs" ref={dropRef}>
        name: {name} <br />
        lastModifiedDate: {lastModifiedDate.toString()}<br />
        size: {returnFileSize(size)}<br />
        type: {type}
      </p>

    </div >
  )
}

export default Input

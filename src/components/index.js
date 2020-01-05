import React, { useState, useRef, useEffect } from 'react'
import Meyda from 'meyda'

const Input = () => {

  const inputRef = useRef()
  const dropRef = useRef()
  const [file, setFile] = useState({
    name: '',
    lastModified: 0,
    size: 0,
    type: '',
  })
  const [means, setMeans] = useState({mean1:0,mean2:0})

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
    console.log('files:', files, inputRef.current.files.item(0))
    // const file = files ? files.item(0) : inputRef.current.files.item(0)
    const file = inputRef.current.files.item(0)

    setFile(file)
    const reader = new FileReader()
    reader.onloadend = (theFile) => {
      console.log('theFile:', theFile.target.result)
      var data = {
        blob: theFile.target.result,
        name: file.name,
      }
      // console.log('data:', data)


      const f32a = new Int32Array(data.blob)
      // console.log('f32a:', f32a)
      // const cut = f32a.subarray(0,512)
      // console.log('cut:', cut)

      const results = []
      for (let i = 0; i < f32a.length - 512; i += 512) {
        const r = Meyda.extract('rms', f32a.slice(i, i + 512))
        results.push(r)
      }
      const avg = results.reduce((acc, num) => {
        return acc + num
      }, 0)
      const mean = avg / f32a.length
      const mean2 = avg / (f32a.length - 512)
      console.log('mean:', mean, mean2)
      setMeans({mean1:mean,mean2:mean2})
      // console.log('results:', results)
      // const r = Meyda.extract('rms', f32a)
      // console.log('r:', r)
    }
    reader.onerror = (err) => {throw new Error(err)}
    if (file) reader.readAsArrayBuffer(file)
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

  const openFileInput = () => {
    inputRef.current.click()
  }



  const { name, lastModified, size, type } = file
  return (
    <div>
      <input
        style={{ display: 'none' }}
        ref={inputRef}
        type="file"
        name="file"
        accept="audio/*"
        multiple={false}
        onChange={readFiles}
      />
      <button id="fileSelect" onClick={openFileInput}>Select some files</button>
      {/* handle file = null */}
      <p className="fileattrs" ref={dropRef}>
        filename: {name} <br />
        lastModifiedDate: {new Date(lastModified).toLocaleString()}<br />
        size: {returnFileSize(size)}<br />
        type: {type}
      </p>
      <p className="means">
        rms1: {means.mean1} <br />
        rms2: {means.mean2}
      </p>

    </div >
  )
}

export default Input

import React, { useState, useRef, useEffect } from 'react'
import Meyda from 'meyda'
import './styles.css'
// no need for browserify, create-react-app handles requires also
var qmean = require('compute-qmean')


const Input = () => {
  const BUFFER_OFFSET = 128 //1024 //4096 // 512
  const inputRef = useRef()
  const dropRef = useRef()
  const [file, setFile] = useState({
    name: '',
    lastModified: 0,
    size: 0,
    type: '',
  })
  const [means, setMeans] = useState({ mean1: 0, mean2: 0 })
  const [qMean, setQmean] = useState(0)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    function drop(e) {
      e.stopPropagation();
      e.preventDefault();
      const dt = e.dataTransfer;
      const files = dt.files;
      readFiles(files);
    }
    function dragEnterOver(e) {
      e.stopPropagation();
      e.preventDefault();
    }

    dropRef.current.addEventListener("dragenter", dragEnterOver, false);
    dropRef.current.addEventListener("dragover", dragEnterOver, false);
    dropRef.current.addEventListener("drop", drop, false);
  }, [])


  const readFiles = (files) => {
    setCalculating(true)
    // console.log('files:', files, inputRef.current.files.item(0))
    const hasFiles = files?.item?.(0)
    // console.log('hasFiles:', hasFiles)
    const file = hasFiles ? files.item(0) : inputRef.current.files.item(0)
    // const file = inputRef.current.files.item(0)

    setFile(file)
    const reader = new FileReader()
    reader.onloadend = async (arrBuffer) => {
      // console.log('arrBuffer:', arrBuffer.target.result)
      var data = {
        blob: arrBuffer.target.result,
        name: file.name,
      }

      const audioCtx = new AudioContext()
      const int32Arr = await audioCtx.decodeAudioData(data.blob)
        .then(decodedData => {
          // console.log('decodedData:', decodedData)
          return decodedData.getChannelData(0)
        })
      //   .catch(err) {
      //     throw new Error(err)
      // }

      // console.log('int32Arr:', int32Arr)

      // const f32a = new Int32Array(decodedData)
      const f32a = int32Arr
      const qrsm = qmean(f32a)
      // console.log('qrsm:', qrsm)
      setQmean(qrsm)
      const results = []

      for (let i = 0; i < f32a.length - BUFFER_OFFSET; i += BUFFER_OFFSET) {
        const r = Meyda.extract('rms', f32a.slice(i, i + BUFFER_OFFSET))
        // console.log('r:', r)
        results.push(r)
      }
      const sum = results.reduce((acc, num) => {
        return acc + num
      }, 0)

      const mean = sum / results.length
      const mean2 = sum / (results.length - BUFFER_OFFSET)
      setMeans({ mean1: mean, mean2: mean2 })
      setCalculating(false)
    }
    reader.onerror = (err) => { throw new Error(err) }
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
      <button id="fileSelect" onClick={openFileInput}>Valitse äänitiedosto</button>
      {/* TODO: handle file = null */}
      <p className="fileattrs" ref={dropRef}>
        filename: {name} <br />
        lastModifiedDate: {new Date(lastModified).toLocaleString()}<br />
        size: {returnFileSize(size)}<br />
        type: {type}
      </p>
      {calculating && <p className="calculating">Lasketaan matikkaa<span className="calculating-css"></span></p>}
      <p className="means">
        <a href="https://github.com/meyda/meyda">meyda</a> rms: {means.mean1} <br />
        <a href="https://github.com/meyda/meyda">meyda</a> rms (BUFFER_OFFSET {BUFFER_OFFSET}): {means.mean2} <br />
        <a href="https://github.com/compute-io/qmean">qMean rms:</a> {qMean}
      </p>

    </div >
  )
}

export default Input

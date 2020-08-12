import { repeat, mergeRight } from '../node_modules/ramda/src/index.mjs'
import {
  DICTIONARY_SIZE1,
  DICTIONARY_SIZE2,
  DICTIONARY_SIZE3,
  CMP_INVALID_DICTSIZE,
  BINARY_COMPRESSION,
  ASCII_COMPRESSION,
  CMP_INVALID_MODE,
  CMP_ABORT,
  ChBitsAsc,
  ChCodeAsc,
  ExLenBits,
  LenBits,
  LenCode
} from './common.mjs'

const setup = (compressionType, dictionarySize) => {
  return new Promise((resolve, reject) => {
    const state = {
      nChBits: repeat(0, 0x306),
      nChCodes: repeat(0, 0x306)
    }

    switch (dictionarySize) {
      case DICTIONARY_SIZE3:
        state.dictionarySizeBits = 6
        state.dictionarySizeMask = 0x3f
        break
      case DICTIONARY_SIZE2:
        state.dictionarySizeBits = 5
        state.dictionarySizeMask = 0x1f
        break
      case DICTIONARY_SIZE1:
        state.dictionarySizeBits = 4
        state.dictionarySizeMask = 0x0f
        break
      default:
        reject(new Error(CMP_INVALID_DICTSIZE))
        return
    }

    switch (compressionType) {
      case BINARY_COMPRESSION:
        for (let nChCode = 0, nCount = 0; nCount < 0x100; nCount++) {
          state.nChBits[nCount] = 9
          state.nChCodes[nCount] = nChCode
          nChCode = (nChCode & 0xffff) + 2
        }
        break
      case ASCII_COMPRESSION:
        for (let nCount = 0; nCount < 0x100; nCount++) {
          state.nChBits[nCount] = ChBitsAsc[nCount] + 1
          state.nChCodes[nCount] = ChCodeAsc[nCount] * 2
        }
        break
      default:
        reject(new Error(CMP_INVALID_MODE))
        return
    }

    let nCount = 0x100
    for (let i = 0; i < 0x10; i++) {
      if (1 << ExLenBits[i]) {
        for (let nCount2 = 0; nCount2 < 1 << ExLenBits[i]; nCount2++) {
          state.nChBits[nCount] = ExLenBits[i] + LenBits[i] + 1
          state.nChCodes[nCount] = (nCount2 << (LenBits[i] + 1)) | ((LenCode[i] & 0xffff00ff) * 2) | 1
          nCount++
        }
      }
    }

    resolve(state)
  })
}

const processChunkData = state => {
  return new Promise((resolve, reject) => {
    resolve()
  })
}

const implode = (compressionType, dictionarySize) => {
  let state = {
    isFirstChunk: true,
    dictionarySizeBytes: dictionarySize,
    compressionType: compressionType,
    outputBuffer: Buffer.from([]),
    onInputFinished: callback => {
      if (state.needMoreInput) {
        callback(new Error(CMP_ABORT))
      } else {
        callback(null, state.outputBuffer)
      }
    }
  }

  return function (chunk, encoding, callback) {
    state.needMoreInput = false

    let work
    if (state.isFirstChunk) {
      state.isFirstChunk = false
      this._flush = state.onInputFinished
      state.inputBuffer = chunk
      work = setup(compressionType, dictionarySize).then(newState => {
        state = mergeRight(state, newState)
        return state
      })
    } else {
      state.inputBuffer = Buffer.concat([state.inputBuffer, chunk])
      work = Promise.resolve(state)
    }

    work
      .then(processChunkData)
      .then(() => {
        callback(null, Buffer.from([]))
      })
      .catch(e => {
        callback(e)
      })
  }
}

export default implode

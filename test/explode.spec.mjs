/* global describe, it */

import assert from 'assert'
import fs from 'fs'
import explode, { parseFirstChunk, generateAsciiTables, generateDecodeTables } from '../src/explode.mjs'
import { CMP_BAD_DATA, CMP_INVALID_DICTSIZE } from '../src/common.mjs'
import { isPromise, through } from './helpers.mjs'

describe('parseFirstChunk', () => {
  it('is a function', () => {
    assert.equal(typeof parseFirstChunk, 'function')
  })

  it('takes a buffer and returns a promise', () => {
    assert.ok(isPromise(parseFirstChunk(Buffer.from([]))))
  })

  it('rejects with CPM_BAD_DATA, when given buffer is shorter, than 5', async () => {
    await assert.rejects(parseFirstChunk(Buffer.from([0, 0, 0, 0])), new Error(CMP_BAD_DATA))
  })

  it('rejects with CMP_INVALID_DICTSIZE, when 2nd byte is not between 4 and 6', async () => {
    await assert.rejects(parseFirstChunk(Buffer.from([0, 2, 0, 0, 0])), new Error(CMP_INVALID_DICTSIZE))
    await assert.rejects(parseFirstChunk(Buffer.from([0, 8, 0, 0, 0])), new Error(CMP_INVALID_DICTSIZE))
  })
})

describe('generateAsciiTables', () => {
  it('is a function', () => {
    assert.equal(typeof generateAsciiTables, 'function')
  })
})

describe('generateDecodeTables', () => {
  it('is a function', () => {
    assert.equal(typeof generateDecodeTables, 'function')
  })
})

describe('explode', () => {
  it('is a function', () => {
    assert.equal(typeof explode, 'function')
  })
  it('can decode in ascii mode', done => {
    const CHUNK_SIZE_IN_BYTES = 300

    const readControl = () => {
      return new Promise((resolve, reject) => {
        const chunks = []
        fs.createReadStream('test/files/large.unpacked', { highWaterMark: CHUNK_SIZE_IN_BYTES })
          .on('error', reject)
          .on('data', chunk => {
            chunks.push(chunk)
          })
          .on('end', function () {
            resolve(Buffer.concat(chunks))
          })
      })
    }

    const readTest = () => {
      return new Promise((resolve, reject) => {
        const chunks = []
        fs.createReadStream('./test/files/large.ascii', { highWaterMark: CHUNK_SIZE_IN_BYTES })
          .pipe(
            through(explode())
              .on('error', reject)
              .on('data', chunk => {
                chunks.push(chunk)
              })
              .on('finish', function () {
                resolve(Buffer.concat(chunks))
              })
          )
          .on('error', reject)
      })
    }

    Promise.all([readControl(), readTest()])
      .then(([control, test]) => {
        assert.ok(control.equals(test))
      })
      .then(done, done)
  })
})

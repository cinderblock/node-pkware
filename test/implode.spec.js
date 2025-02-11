const assert = require('assert')
const { beforeEach, describe, it } = require('mocha')
const { isFunction, isPlainObject } = require('ramda-adjunct')
const {
  COMPRESSION_BINARY,
  DICTIONARY_SIZE_LARGE,
  DICTIONARY_SIZE_SMALL,
  DICTIONARY_SIZE_MEDIUM
} = require('../src/constants.js')
const { InvalidDictionarySizeError, InvalidCompressionTypeError } = require('../src/errors.js')
const ExpandingBuffer = require('../src/helpers/ExpandingBuffer.js')
const { setup, outputBits, processChunkData, implode } = require('../src/implode.js')

describe('setup', () => {
  let state
  beforeEach(() => {
    state = {
      inputBuffer: new ExpandingBuffer(),
      outputBuffer: new ExpandingBuffer(),
      dictionarySizeBits: DICTIONARY_SIZE_LARGE,
      compressionType: COMPRESSION_BINARY
    }
  })
  it('is a function', () => {
    assert.ok(isFunction(setup), `${setup} is not a function`)
  })
  it('throws an InvalidDictionarySizeError, when given state has dictionarySizeBits out of the range of 4..6', () => {
    state.dictionarySizeBits = 12
    assert.throws(() => {
      setup(state)
    }, InvalidDictionarySizeError)
  })
  it('throws an InvalidCompressionTypeError, when given state has compressionType other than 0 or 1', () => {
    state.compressionType = -7
    assert.throws(() => {
      setup(state)
    }, InvalidCompressionTypeError)
  })
  it('gets a state object and sets nChBits key to it', () => {
    setup(state)
    assert.ok(typeof state.nChBits !== 'undefined')
  })
  it('gets a state object and sets nChCodes key to it', () => {
    setup(state)
    assert.ok(typeof state.nChCodes !== 'undefined')
  })
  it('sets state.dictionarySizeMask to 0b1111, when dictionary size is small', () => {
    state.dictionarySizeBits = DICTIONARY_SIZE_SMALL
    setup(state)
    assert.strictEqual(state.dictionarySizeMask, 0b1111)
  })
  it('sets state.dictionarySizeMask to 0b11111, when dictionary size is medium', () => {
    state.dictionarySizeBits = DICTIONARY_SIZE_MEDIUM
    setup(state)
    assert.strictEqual(state.dictionarySizeMask, 0b11111)
  })
  it('sets state.dictionarySizeMask to 0b111111, when dictionary size is large', () => {
    state.dictionarySizeBits = DICTIONARY_SIZE_LARGE
    setup(state)
    assert.strictEqual(state.dictionarySizeMask, 0b111111)
  })
})

describe('outputBits', () => {
  it('is a function', () => {
    assert.ok(isFunction(outputBits), `${outputBits} is not a function`)
  })

  // TODO: create tests
})

describe('processChunkData', () => {
  it('is a function', () => {
    assert.ok(isFunction(processChunkData), `${processChunkData} is not a function`)
  })

  // TODO: create tests
})

describe('implode', () => {
  it('is a function', () => {
    assert.ok(isFunction(implode), `${implode} is not a function`)
  })
  it('returns a function when called', () => {
    const handler = implode()
    assert.ok(isFunction(handler), `${handler} is not a function`)
  })
  describe('returned handler', () => {
    it('has a _state variable, which is an object', () => {
      const handler = implode()
      assert.ok(isPlainObject(handler._state), `${handler._state} is not an object`)
    })
  })
})


// Parsers for multi-types, e.g. boolean|string

import htmlColors from '../assets/htmlColors.json' 

const COLOR_REGX = /^#([a-f0-9]{3,4}|[a-f0-9]{4}(?:[a-f0-9]{2}){1,2})\b$/i 
const COLORS = Object.keys(htmlColors)

const numberParser = {
    type: 'number',
    get(x, plain) {
        if (typeof x !== 'number') throw 'not num'
        return plain ?? JSON.stringify(x)
    },
    set(x) {
        let num = parseFloat(x)
        if (num !== num) throw 'not num';
        return num
    }
}

const intParser = {
    type: 'integer',
    get(x) {
        if (typeof x !== 'number' || x % 1 !== 0) throw 'not int'
        return JSON.stringify(x)
    },
    set(x) {
        let num = parseInt(x)
        if (num !== num) throw 'not int';
        return num
    }
}

const boolParser = {
    type: 'boolean',
    get(x) {
        if (typeof x !== 'boolean') throw 'not bool'
        return JSON.stringify(x)
    },
    set(x) {
        if (typeof x !== 'string') throw 'not bool'
        let v = x.trim()
        switch(v) {
            case 'true': return true
            case 'false': return false
            default: throw 'not bool'
        }
    }
}

const arrayParser = {
    type: 'array',
    get(x) {
        if (!Array.isArray(x)) throw 'not arr'
        return JSON.stringify(x)
    },
    set(x) {
        if (typeof x !== 'string') throw 'not arr'
        let v = x.trim()
        if (x[0] !== '[') throw 'not arr'
        return JSON.parse(x)
    }
}

const objectParser = {
    type: 'object',
    get(x) {
        if (typeof x !== 'object') throw 'not obj'
        return JSON.stringify(x)
    },
    set(x) {
        if (typeof x !== 'string') throw 'not obj'
        let v = x.trim()
        if (x[0] !== '{') throw 'not obj'
        return JSON.parse(x)
    }
}

const colorParser = {
    type: 'color',
    get(x) {
        if (typeof x !== 'string') throw 'not col'
        let v = x.trim().toLowerCase()
        if (!COLOR_REGX.test(v) && !COLORS.includes(v)) {
            throw 'not col'
        }
        return v  
    },
    set(x) {
        if (typeof x !== 'string') throw 'not col'
        let v = x.trim().toLowerCase()
        if (!COLOR_REGX.test(v) && !COLORS.includes(v)) {
            throw 'not col'
        }
        return v
    }
}

const stringParser = {
    type: 'string',
    get(x) {
        if (typeof x !== 'string') throw 'not str'
        return x
    },
    set(x) {
        return x
    }
}


export default [
    numberParser,
    intParser,
    boolParser,
    arrayParser,
    objectParser, 
    colorParser,
    stringParser
]
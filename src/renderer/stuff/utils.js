
import IndexedArray from 'arrayslicer'
import Const from './constants.js'
import { Const as NvConst } from 'night-vision'
const OV_REGEX = /\[OVERLAY[\s]+([\s\S]*?)\]/gm
const PROP_SPLIT = /prop[\s]*?\([\s\S]*?\)/gm 
const PROP_REGEX = /prop[\s\S]*?\(*?([_$a-zA-Z0-9-]+)[\s\S]*?\{([\s\S]*?)\}[\s\S]*\)/gm

export default {

    clamp(num, min, max) {
        return num <= min ? min : num >= max ? max : num
    },

    addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i
    },

    // Start of the day (zero millisecond)
    dayStart(t) {
        let start = new Date(t)
        return start.setUTCHours(0,0,0,0)
    },

    // Start of the month
    monthStart(t) {
        let date = new Date(t)
        return Date.UTC(
            date.getFullYear(),
            date.getMonth(), 1
        )
    },

    // Start of the year
    yearStart(t) {
        return Date.UTC(new Date(t).getFullYear())
    },

    getYear(t) {
        if (!t) return undefined
        return new Date(t).getUTCFullYear()
    },

    getMonth(t) {
        if (!t) return undefined
        return new Date(t).getUTCMonth()
    },

    // Nearest in array
    nearestA(x, array) {
        let dist = Infinity
        let val = null
        let index = -1
        for (var i = 0; i < array.length; i++) {
            var xi = array[i]
            if (Math.abs(xi - x) < dist) {
                dist = Math.abs(xi - x)
                val = xi
                index = i
            }
        }
        return [index, val]
    },

    // Nearest value by time (in timeseries)
    nearestTs(t, ts) {
        let dist = Infinity
        let val = null
        let index = -1
        for (var i = 0; i < ts.length; i++) {
            var ti = ts[i][0]
            if (Math.abs(ti - t) < dist) {
                dist = Math.abs(ti - t)
                val = ts[i]
                index = i
            }
        }
        return [index, val]
    },

    // Nearest value by index (in timeseries)
    nearestTsIb(i, ts, offset) {
        let index = Math.floor(i - offset) + 1
        let val = ts[index] || null
        return [index, val]
    },

    round(num, decimals = 8) {
        return parseFloat(num.toFixed(decimals))
    },

    // Strip? No, it's ugly floats in js
    strip(number) {
        return parseFloat(
            parseFloat(number).toPrecision(12)
        )
    },

    getDay(t) {
        return t ? new Date(t).getDate() : null
    },

    // Update array keeping the same reference
    overwrite(arr, new_arr) {
        arr.splice(0, arr.length, ...new_arr)
    },

    // Get full list of overlays on all panes
    allOverlays(panes = []) {
        return panes.map(x => x.overlays || []).flat()
    },

    // Detects a timeframe of the data
    detectTimeframe(data) {
        let len = Math.min(data.length - 1, 99)
        let min = Infinity
        data.slice(0, len).forEach((x, i) => {
            let d = data[i+1][0] - x[0]
            if (d === d && d < min) min = d
        })
        // This saves monthly chart from being awkward
        if (min >= Const.MONTH && min <= Const.DAY * 30) {
            return Const.DAY * 31
        }
        return min
    },

    now() { return (new Date()).getTime() },

    pause(delay) {
        return new Promise((rs, rj) => setTimeout(rs, delay))
    },

    // Apply opacity to a hex color
    applyOpacity(c, op) {
        if (c.length === 7) {
            let n = Math.floor(op * 255)
            n = this.clamp(n, 0, 255)
            c += n.toString(16)
        }
        return c
    },

    // Parse timeframe or return value in ms
    // TODO: add full parser
    // (https://github.com/tvjsx/trading-vue-js/
    // blob/master/src/helpers/script_utils.js#L98)
    parseTf(smth) {
        if (typeof smth === 'string') {
            return Const.MAP_UNIT[smth]
        } else {
            return smth
        }
    },

    uuid(temp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx') {
        return temp
            .replace(/[xy]/g, c => {
            var r = Math.random() * 16 | 0, v = c == 'x' ?
                r :
                (r & 0x3 | 0x8)
            return v.toString(16)
        })
    },

    uuid2() {
        return this.uuid('xxxxxxxxxxxx')
    },

    uuid3() {
        return Math.random().toString().slice(2).replace(/^0+/, '')
    },

    // Checks if it's time to make a script update
    // (based on execInterval in ms)
    delayedExec(v) {
        if (!v.script || !v.script.execInterval)
            return true
        let t = this.now()
        let dt = v.script.execInterval
        if (!v.settings.$last_exec ||
            t > v.settings.$last_exec + dt) {
            v.settings.$last_exec = t
            return true
        }
        return false
    },

    // Format names such 'RSI, $length', where
    // length - is one of the settings
    formatName(ov) {
        if (!ov.name) return undefined

        let name = ov.name

        for (var k in ov.settings || {}) {
            let val = ov.settings[k]
            let reg = new RegExp(`\\$${k}`, 'g')
            name = name.replace(reg, val)
        }

        return name
    },

    // Default cursor mode
    xMode() {
        return this.is_mobile ? 'explore' : 'default'
    },

    defaultPrevented(event) {
        if (event.original) {
            return event.original.defaultPrevented
        }
        return event.defaultPrevented
    },

    // Get a view from the data by the name
    /*view(data, name) {
        if (!data.views) return data
        let v = data.views.find(x => x.name === name)
        if (!v) return data
        return v.data
    },*/

    /*concatArrays(arrays) {
        var acc = []
        for (var a of arrays) {
            acc = acc.concat(a)
        }
        return acc
    },*/

    // Call
    afterAll(object, f, time) {
        clearTimeout(object.__afterAllId__)
        object.__afterAllId__ = setTimeout(() => f(), time)
    },

    // Default auto-precision sampler for a generic
    // timeseries-element: [time, x1, x2, x3, ...]
    defaultPreSampler(el) {
        if (!el) return []
        let out = []
        for (var i = 1; i < el.length; i++) {
            if (typeof el[i] === 'number') {
                out.push(el[i])
            }
        }
        return out
    },

    // Get scales by side id (0 - left, 1 - right)
    getScalesBySide(side, layout) {
        if (!layout) return []
        let template = layout.settings.scaleTemplate
        return template[side]
            .map(id => layout.scales[id])
            .filter(x => x) // Clean undefined
    },

    // If scaleTemplate is changed there could be a
    // situation when user forget to reset scaleSideIdxs.
    // Here we attemp to get them in sync
    autoScaleSideId(S, sides, idxs) {
        if (sides[S].length) {
            if (!idxs[S] || !sides[S].includes(idxs[S])) {
                idxs[S] = sides[S][0]
            }
        } else {
            idxs[S] = undefined
        }
    },

    // Debug function, shows how many times
    // this method is called per second
    callsPerSecond() {
        if (window.__counter__ === undefined) {
            window.__counter__ = 0
        }
        window.__counter__++
        if (window.__cpsId__) return
        window.__cpsId__ = setTimeout(() => {
            console.log(window.__counter__, 'upd/sec')
            window.__counter__ = 0
            window.__cpsId__ = null
        }, 1000)
    },

    // Calculate an index offset for a timeseries
    // against the main ts. (for indexBased mode)
    findIndexOffset(mainTs, ts) {
        let set1 = {} // main set of time => index
        let set2 = {} // another set
        for (var i = 0; i < mainTs.length; i++) {
            set1[mainTs[i][0]] = i
        }
        for (var i = 0; i < ts.length; i++) {
            set2[ts[i][0]] = i
        }
        let deltas = []
        for (var t in set2) {
            if (set1[t] !== undefined) {
                let d = set1[t] - set2[t]
                if (!deltas.length || deltas[0] === d) {
                    deltas.unshift(d)
                }
                // 3 equal deltas means that we likely found
                // the true index offset
                if (deltas.length === 3) {
                    return deltas.pop()
                }
            }
        }
        return 0 // We didn't find the offset
    },

    // Format cash values
    formatCash(n) {
        if (n == undefined) return 'x'
        if (typeof n !== 'number') return n
        if (n < 1e3) return n.toFixed(0)
        if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(2) + "K"
        if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(2) + "M"
        if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(2) + "B"
        if (n >= 1e12) return +(n / 1e12).toFixed(2) + "T"
    },

    // Time range of a data subset (from i0 to iN-1)
    realTimeRange(data) {
        if (!data.length) return 0
        return data[data.length - 1][0] - data[0][0]
    },

    parseTagProps(src) {

        OV_REGEX.lastIndex = 0 
        let m = OV_REGEX.exec(src)
        if (!m || !m[1]) return {}
    
        let obj = {}
        let pairs = m[1].split(',')
        for (var p of pairs) {
            let [key, val] = p.split('=')
            obj[key.trim()] = val.trim()
        }
        return obj
    },

    parseOvProps(src, name) {
        PROP_SPLIT.lastIndex = 0
        let m // Match
        let list = []
        let env = `
            let $props = {}
            let $opt = {}
            let $core = { colors: ${JSON.stringify(NvConst.COLORS)} }
            function prop(name, obj) {
                $props[name] = obj.def
                $opt[name] = obj
            }
        `
        while (m = PROP_SPLIT.exec(src)) {
            PROP_REGEX.lastIndex = 0 
            let m2 = PROP_REGEX.exec(m[0])
            if (m2 && m2[1] && m2[2]) {
                env += `prop('${m2[1]}', {${m2[2]}})\n`
            } else {
                console.log(`Error in props of ${name}`)
            }
        }
        // Merge all options with defaults
        env += `
            for (var k in $opt) {
               $opt[k].def = $props[k]
            }
        `
        env += 'return $opt'

        return new Function('', env)()

    },

    // WTF with modern web development
    isMobile: (w => 'onorientationchange' in w &&
       (!!navigator.maxTouchPoints ||
        !!navigator.msMaxTouchPoints ||
        ('ontouchstart' in w ||
        (w.DocumentTouch &&
        document instanceof w.DocumentTouch))))
        (typeof window !== 'undefined' ? window : {})

}

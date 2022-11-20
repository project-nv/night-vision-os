<script>

import HsvPicker from './ColorPicker.svelte'
import { createEventDispatcher, onMount } from 'svelte'
    import { c } from '@freecodecamp/strip-comments/lib/languages';

const dispatch = createEventDispatcher()

let startColor = parse(self.store.picker.color)[0]
let startAlpha = parse(self.store.picker.color)[1] 
let x
let y
let drag = null

export function update() {
    // TODO: implement
}

onMount(() => {

    x = self.store.picker.x
    y = self.store.picker.y

    document.onmousemove = onMouseMove
    document.onmouseup = onMouseUp
    document.onmouseleave = onMouseUp

})

function onMouseDown(event) {
    drag = {
        offsetX: event.layerX,
        offsetY: event.layerY
    }
}

function onMouseMove(event) {
    if (drag) {
        x = event.clientX - drag.offsetX
        y = event.clientY - drag.offsetY
    }
}

function onMouseUp(event) {
    drag = null
}

function onClose() {
    self.store.picker = null
    dispatch('close')
}

function parse(c) {

    if (c.length === 7) {
        return [c, 1]
    }
    if (c.length > 7) {
        var rgb = c.slice(0, 7) 
        var a = c.slice(7, 9) 
        return [rgb, parseInt(a, 16) / 255]
    }
    if (c.length < 7) {
        var cc = `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
        if (c.length === 5) {
            var a = `${c[4]}${c[4]}`
            return [cc, parseInt(a, 16) / 255]
        } else {
            return [cc, 1]
        }
    }
}

function colorChange(event) {
    let c = rgba2hexa(event.detail)
    self.store.picker.color = c
    self.store.picker.callback()
}

function rgba2hexa(rgba)
{
    let color = '#' +
        (rgba.r | 1 << 8).toString(16).slice(1) +
        (rgba.g | 1 << 8).toString(16).slice(1) +
        (rgba.b | 1 << 8).toString(16).slice(1) +
        ((rgba.a * 255) | 1 << 8).toString(16).slice(1)

    if (rgba.a === 1) return color.slice(0, 7)

    return color
}

$:style = `
    top: ${y}px;
    left: ${x}px;
`

</script>
<style>
.hsv-picker {
    position: absolute;
    z-index: 10;
    color: #222;
    border-radius: 5px;
    border: 1px solid #555;
    overflow: hidden;
}
.picker-header {
    width: 100%;
    height: 30px;
    text-align: center;
    background-color: #14151c;
    color: #444;
    user-select: none;
    line-height: 25px;
    cursor:move;
}
.close {
    position: absolute;
    color: #555;
    /*float: right;*/
    right: 3px;
    top: -3px;
    cursor: pointer;
    padding: 5px;
}
.close:hover {
    color: #888;
}
</style>
<div class="hsv-picker" {style}>
    <div class="picker-header" on:mousedown={onMouseDown}>
        :::::
        <div class="close" on:click={onClose}
            on:keypress={() => {}}>
            ✕
        </div>
    </div>
    <HsvPicker {startColor} {startAlpha}
        on:colorChange={colorChange}/>
</div>

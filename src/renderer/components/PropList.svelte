<script>
import { createEventDispatcher } from 'svelte'
import Toggle from 'svelte-toggle'
import typeParsers from '../core/typeParsers.js'
import htmlColors from '../assets/htmlColors.json' 
import Utils from '../stuff/utils.js' 

const dispatch = createEventDispatcher()

const COLOR_REGX = /^#([a-f0-9]{3,4}|[a-f0-9]{4}(?:[a-f0-9]{2}){1,2})\b$/i 
const COLORS = Object.keys(htmlColors)

let props = []
let ov = null

export function setSelected({ov: $ov, props: $props}) {
    props = $props 
    ov = $ov
    initProps()

    // Percived the values
    for (var k in ov.props) {
        let val = ov.props[k]
        let prop = props.find(x => x.name === k)
        if (prop) {
            setValue(prop, val)
        }
    }

}

// Init props
function initProps() {
    for (let prop of props) {
        let type = prop.type.toLowerCase()
        let types = getTypes(prop)
        Object.defineProperty(prop, "parser", {
            get: function () {
                if (!this.error) {
                    for (var tp of typeParsers) {
                        if (!types.includes(tp.type)) continue
                        try { 
                            return tp.get(
                                this.value, 
                                this.plainText
                            )
                        } catch(err) {}
                    }
                }
                return this.plainText
            },
            set: function (val) {
                this.error = false
                this.plainText = val
                for (var tp of typeParsers) {
                    if (!types.includes(tp.type)) continue
                    try {
                        this.error = false
                        this.value = tp.set(val)
                        break
                    } catch (err) {
                        this.error = true
                    }
                }
            }
        })
        setValue(prop, prop.def)
    }
}

function setValue(prop, val) {
    if (typeof val !== 'string') {
        prop.parser = JSON.stringify(val)
    } else {
        prop.parser = val
    }
}

$:values = props.filter(x => !x.error)
    .map(x => x.value)

$:chartUpdate(values)  

function chartUpdate() {

    // Dump good props into overlay's 'prop' object 
    for (var prop of props.filter(x => !x.error)) {
        ov.props[prop.name] = prop.value
    }
    
    self.chart.update('grid')
}

function getTypes(prop) {
    let tuple = (prop.type || 'string').split('|')
    return tuple.map(x => x.toLowerCase())
}

function op(c, op) {
    let n = Math.floor(op * 255)
    n = Utils.clamp(n, 0, 255).toString(16)
    
    if (c.length > 7) {
        c = c.slice(0, 7) 
    }
    if (c.length < 7) {
        c = `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
    }
    return c + n
}

function showPicker(prop, e) {
    let rect = e.target.getBoundingClientRect()
    dispatch('show-picker', {
        x: rect.right + 19, 
        y: rect.top - 5,
        color: prop.value,
        callback: () => {
            changeColor(prop) 
        }
    })
}

function changeColor(prop) {
    prop.value = self.store.picker.color
    props = props
}

function onColorChange(prop, e) {
    dispatch('picker-color', {
        color: prop.value,
    })
}

</script>
<style>
.prop-list {
    margin-right: 5px;
}
.prop {
    position: relative;
    display: flex;
    line-height: 35px;
    user-select: none;
    color: #818989;
    margin: 2px;
    border-radius: 3px;
    cursor: pointer;
    overflow: hidden;
    /*border: 1px dotted rgba(170, 159, 170, 0.5);*/
}
.prop-name {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 50%;
    text-align: left;
}
.prop-value {
    align-self: end;
    width: 50%;
}
input {
    width: calc(100% - 10px);
    height: 25px;
    background: #fff1;
    border: none;/*1px dotted gray;*/
    border-radius: 3px;
    color: #aaa;
    padding-top: 3px;
    padding-left: 5px;
    font-size: 1em;
    outline:none;
    outline-color: transparent;
    transition: outline-color 0.25s ease-out;
    text-align: center;
}
input:focus {
  outline: solid;
  outline-width: 2px;
  outline-color: #4b9f65;
}

input[type=number] {
    padding-left: 15px;
    width: calc(100% - 20px);
}
.input-error {
    outline-color: #ce2934 !important;
    outline: solid;
}
/*input[type=number]::-webkit-inner-spin-button {
}*/
.prop-color {
    position: absolute;
    right: 5px;
    width: 5px;
    height: 17px;
    margin-top: 7px;
    border-radius: 3px;
    border: 2px solid #14151c;
    transition: width 0.15s ease-out;
}
.prop:hover .prop-color {
    width: 17px;
}
.props-hint {
    padding: 7%;
    opacity: 0.2;
    transition: opacity 0.25s ease-out;
}
.props-hint:hover {
    opacity: 0.4;
}
</style>
<div class="component-header">
    PROPS
</div>
<div class="prop-list">
    {#each props as prop, i}
    {@const types = getTypes(prop)}
    <div class="prop">
        <span class="prop-name">
            {prop.name}
        </span>
        <span class="prop-value">
            {#if types.length > 1}
            <!-- multi-type -->
            <input type="text" bind:value={prop.parser}
                class:input-error={prop.error}>
            {:else if types[0] === 'string'}
            <input type="text" bind:value={prop.value}>
            {:else if types[0] === 'number'}
            <input type="number" bind:value={prop.value}
                min={prop.min}
                max={prop.max}
                step={prop.step || 'any'}>
            {:else if types[0] === 'integer'}
            <input type="number" bind:value={prop.value}>
            {:else if types[0] === 'boolean'}
            <Toggle style="
                margin-bottom: 6px; 
                margin-left: calc(50% - 20px);"
                label=""
                switchColor="#ccc"
                toggledColor="#4b9f65"
                untoggledColor="#fff1"
                bind:toggled={prop.value}
            />
            {:else if types[0] === 'color'}
            <input type="text" bind:value={prop.parser}
                on:input={e => onColorChange(prop, e)}
                class:input-error={prop.error}>
            {:else if types[0] === 'array'}
            <input type="text" bind:value={prop.parser}
                class:input-error={prop.error}>
            {:else if types[0] === 'object'}
            <input type="text" bind:value={prop.parser}
                class:input-error={prop.error}>
            {/if}
        </span>
        {#if types.includes('color') && !prop.error}
        <span class="prop-color" 
            on:click={e => showPicker(prop, e)}
            on:keypress={() => {}}
            style={`
                background-color: ${prop.value};
                box-shadow: 0 0 15px ${op(prop.value, 0.15)};
            `}>
        </span>
        {/if}
    </div>
    {/each}
    {#if !props.length}
        <p class="props-hint">
            <i>1) Create a custom overlay with the name "SomeType"</i>
            <br/><br/>
            <i>2) Add a dataset with this custom overlay ('type' field should be "SomeType")</i>
            <br/><br/>
            <i>3) Click on the legend name of your custom overlay</i>
        </p>
    {/if}
</div>
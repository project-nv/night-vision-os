<!-- App.svelte -->
<script>
import.meta.hot
import { HSplitPane, VSplitPane } from 'svelte-split-pane'
import { onMount } from 'svelte'
import Chartbox from './components/Chartbox.svelte';
import Codebox from './components/Codebox.svelte';
import Sidebar from './components/Sidebar.svelte';
import PickerPopup from './components/PickerPopup.svelte';
import FileDb from './core/fileDb.js'    
import Utils from './stuff/utils.js'    

// TODO: should make Svelte store 
self.store = {
    dsIndex: 0,
    ovIndex: 0
}

// Initial editor code
const startCode = {
    src: '// Code editor',
    type: 'javascript'
}

let code = startCode
let codeRef = null
let sidebarRef = null
let hardReset = 0
let swPicker = false
let pickerRef = null
let ovdb = null

onMount(() => {
    // Set custom overlays
    ovdb = new FileDb(DATA_ROOT + '/overlays/', 'navy')
    let data = ovdb.loadAll()
    self.chart.scripts = Object.values(data)
})

// Set new editor source code 
function setCode($code) {
    code = $code.detail
    codeRef.setValue(code.src, code.type)
}

// Show color picker
function showPicker(event) {
    swPicker = false
    setTimeout(() => {
        self.store.picker = event.detail
        swPicker = true
    })
}

// Update picker color when user changes input
// field (doesnt work for now)
function pickerColor(event) {
    if (!self.store.picker) return 
    self.store.picker.color = event.detail.color
    if (pickerRef) pickerRef.update()
}

// When user selected overlay on the chart
async function ovSelect(event) {

    if(!event.detail.ov) {
        // TODO: deselect
        return
    }

    let ov = event.detail.ov
    let m // Match
    let list = Object.values(ovdb.loadAll())
        .map(x => ({
            type: Utils.parseTagProps(x).name,
            src: x
        }))
    if (m = list.find(x => x.type === ov.type)) {
        // Custom overlay
        sidebarRef.setSelected('Overlays', {item: ov.type})
        // Wait, init props & go to the props tab
        await Utils.pause(10)
        let props = getProps(ov, m.src)
        sidebarRef.setSelected('Props', {item: {
            ov, props
        }})
    } else {
        // TODO: Built-in
    }

}

// Get props definitions from the .navy source
function getProps(ov ,src) {

    let propObj = Utils.parseOvProps(src, ov.type)

    let props = []
    for (var name in propObj) {
        let prop = propObj[name]
        prop.name = name 
        props.push(prop)
    }

    return props
}

// Reset props when the overlay source is changed
function resetProps(event) {
    
    let ov = event.detail.ov
    let src = event.detail.src
    let props = getProps(ov, src)

    sidebarRef.setSelected('Props', {item: {
        ov, props
    }})
}

// Catch chart errors 
self.addEventListener('unhandledrejection', (event) => {
    // TODO: reset chart screen 
})

self.reset = function() {
    hardReset++
}

</script>
<style>
.App {
    height: 100%;
    width: 100%;
    position: absolute;
}
left, right, top, down {
    width: 100%;
    height: 100%;
    display: block;
    text-align: center;
}
:global(.separator) {
    background-color: #aaaaaa2e !important;
}
</style>
<div class="App">
    <HSplitPane leftPaneSize="20%" rightPaneSize="80%" >
        <left slot="left">
            <Sidebar bind:this={sidebarRef}
                on:set-code={setCode} 
                on:show-picker={showPicker}
                on:picker-color={pickerColor}
                on:reset-props={resetProps}/>
        </left>
        <right slot="right">
            <VSplitPane topPanelSize="70%" downPanelSize="30%">
                <top slot="top">
                    {#key hardReset}
                    <Chartbox on:overlay-select={ovSelect}/>
                    {/key}
                </top>
                <down slot="down">
                    <Codebox {code} bind:this={codeRef}/>
                </down>
            </VSplitPane>
        </right>
    </HSplitPane>
    {#if swPicker}
    <PickerPopup on:close={() => swPicker = false}
        bind:this={pickerRef}/>
    {/if}
</div>

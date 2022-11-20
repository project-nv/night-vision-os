<script>

import { createEventDispatcher } from 'svelte'
import List from './List.svelte'
import Confirm from './Confirm.svelte'
import FileDb from '../core/fileDb.js'
import Utils from '../stuff/utils.js'

const dispatch = createEventDispatcher()
let toConfirm = null
let listRef = null

let db = new FileDb('./overlays/', 'navy')
let templDb = new FileDb('./templates/')
let ovTemplate = templDb.load('newOverlay.txt')

let data = db.loadAll()
let items = []

export function setSelected(name) {
    let item = items.find(x => x.name === name)
    if (item) listRef.setSelected(item)
}

setTimeout(() => {
    listRef.setSelected(items[self.store.ovIndex] || items[0])
})

for (let item in data) {
    items.push({
        name: Utils.parseTagProps(data[item]).name,
        fileName: item
    })
}

items.push({
    type: 'add',
    name: 'add overlay',
})

function onItemSelected(item) {
    let data = db.load(item.detail.name)
    if (data) {
        self.store.ovIndex = items.indexOf(item.detail)
        dispatch('set-code', {
            src: data,
            type: 'javascript',
            button: {
                showOnChange: true,
                text: 'Save',
                handler: (src) => {
                    saveChanges(item.detail, src)
                }
            }
        })
    }
}

function onAddItem() {
    dispatch('set-code', {
        src: ovTemplate,
        type: 'javascript',
        button: {
            text: 'Create',
            handler: (src) => {
                let name = Utils.parseTagProps(src).name
                if (!name) {
                    alert('Overlay should have name')
                    return
                }
                if (items.find(x => x.name === name)) { 
                    alert(`Dataset ${name} already exists`)
                    return 
                }
                loadNewOverlay(name, src)
            }
        }
    })
}

function onRemoveItem(item) {
    toConfirm = () => {
        items = items.filter(x => x !== item.detail)
        db.remove(item.detail.name)
        // TODO: chart update 
    }
}

function loadNewOverlay(name, src) {
    let theAdd = items.pop()
    let theNew = {
        name: name,
        fileName: name
    }
    items.push(theNew, theAdd)
    items = items

    db.save(name, src)
    listRef.setSelected(theNew)
}

function saveChanges(item, src) {
    try {
        // TODO: find the diffences b/w old & new
        db.save(item.fileName, src)
        data[item.fileName] = src 
        self.chart.scripts = Object.values(data)
     
        let all = self.chart.hub.allOverlays()
        let ovs = all.filter(x => x.type === item.name)
        let ov = ovs[0]
        if (ov ) {
            dispatch('reset-props', {ov, src})
        }
    } catch (err) {
        alert(err)
    }
}

</script>
<style>
</style>
<div class="component-header">
    OVERLAYS
</div>
<List {items} bind:this={listRef} color='#4a71b5'
    on:selected-item={onItemSelected}
    on:add-item={onAddItem}
    on:remove-item={onRemoveItem}
/>
<Confirm f={toConfirm} 
    on:answer={() => toConfirm = null}/>
<script>

import { createEventDispatcher, onMount } from 'svelte'
import strip from '@freecodecamp/strip-comments'
import Degen from '@nvjs/data-gen'
import List from './List.svelte'
import Confirm from './Confirm.svelte'
import FileDb from '../core/fileDb.js'

const dispatch = createEventDispatcher()
let toConfirm = null
let listRef = null

let db = new FileDb('./datasets/', 'json')
let templDb = new FileDb('./templates/')
let dsTemplate = templDb.load('newDataset.txt')
let items = db.list().map(x => ({ name: x }))
items.push({
    type: 'add',
    name: 'add dataset',
})

export function setSelected(name) {
    let item = items.find(x => x.name === name)
    if (item) listRef.setSelected(item)
}

// Waiting for monaco webworkers
setTimeout(() => {
    listRef.setSelected(items[self.store.dsIndex] || items[0])
}, 100) 

function onItemSelected(item) {
    let data = db.load(item.detail.name)
    if (data) {
        self.store.dsIndex = items.indexOf(item.detail)
        dispatch('set-code', {
            src: JSON.stringify(data, null, 2),
            type: 'json',
            button: {
                showOnChange: true,
                text: 'Save',
                handler: (src) => {
                    saveChanges(item.detail, src)
                }
            }
        })
        self.chart.data = data
        self.chart.fullReset() 
    }
}

function onAddItem() {
    dispatch('set-code', {
        src: dsTemplate,
        type: 'javascript',
        button: {
            text: 'Create',
            handler: (src) => {
                src = strip(src) // remove comments
                let tuple = src.split(';')
                let name = tuple.shift().trim()
                name = name.substr(1, name.length - 2)
                if (items.find(x => x.name === name)) { 
                    alert(`Dataset ${name} already exists`)
                    return 
                }
                let code = tuple.join(';')
                loadDataset(name, code)
            }
        }
    })
}

function onRemoveItem(item) {
    toConfirm = () => {
        items = items.filter(x => x !== item.detail)
        db.remove(item.detail.name)
        if (items.length > 1) {
            listRef.setSelected(items[0])
        } else {
            dispatch('set-code', {
                src: '// code editor',
                type: 'javascript'
            })
            self.chart.data = {}
        }
    }
}

async function loadDataset(name, code) {
    let theAdd = items.pop()
    let theNew = {
        name: name,
        type: 'loading'
    }
    items.push(theNew, theAdd)
    items = items

    let degen = new Degen()
    let data = await degen.get(code)
    // TODO: add the loader code to 'meta' field 
    // Can be used to update datasets 
    delete theNew.type 
    items = items

    data.meta = { dataGenCode: code }    
    db.save(name, data)
    listRef.setSelected(theNew)
    /*dispatch('set-code', {
        src: JSON.stringify(data, null, 2),
        type: 'json'
    })*/
}

function saveChanges(item, src) {
    try {
        let data = JSON.parse(src) 
        db.save(item.name, data)
        self.chart.data = data 
        self.chart.fullReset()
    } catch (err) {
        alert(err)
    }
}

</script>
<style>
</style>
<div class="component-header">
    DATASETS
</div>
<List {items} bind:this={listRef}
    on:selected-item={onItemSelected}
    on:add-item={onAddItem}
    on:remove-item={onRemoveItem}
/>
<Confirm f={toConfirm} 
    on:answer={() => toConfirm = null}/>
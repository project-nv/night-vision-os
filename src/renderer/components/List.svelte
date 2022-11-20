<script>

import { createEventDispatcher } from 'svelte'
import Spinner from './Spinner.svelte'

const dispatch = createEventDispatcher()

export function setSelected(item) {
    selected = item
    dispatch('selected-item', item);
}

export let items = []
export let color = '#4b9f65' 

let selected = null //items[0]

function itemStyle(item) {
    let bg = item === selected ? '#232429' : '#d7f6fa08'
    return `
        color: ${
            item === selected ? color : 'auto'
        };
        border: ${
            item.type === 'add' ? '1px dotted #81898955' : 'auto'
        };
        background: ${
            item.type === 'add' ? 'none' : bg
        };
    ` 
} 

function onItemClick(item) {
    if (item.type === 'add') {
        dispatch('add-item', {});
        return 
    }
    selected = item
    dispatch('selected-item', item);
}

function onRemoveClick(item) {
    dispatch('remove-item', item);
}

</script>
<style>
.item-list {
    margin-right: 2px;
}
.item {
    line-height: 35px;
    user-select: none;
    color: #818989;
    margin: 2px;
    border-radius: 3px;
    cursor: pointer;
    overflow: hidden;
}
.item-name {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    padding-left: 5px;
    padding-right: 5px;
}
.item:hover {
    filter: brightness(1.25) !important;
}
.item.selected:hover {
    filter: brightness(1.05) !important;
}
.item:hover > .item-rm {
    opacity: 1.0;
}
.item-rm {
    position: absolute;
    top: 0px;
    right: 0px;
    background-image: url(/assets/remove2.png);
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(1) brightness(0.5);
    background-size: cover;
    width: 12px;
    height: 12px;
    margin-right: 2px;
    opacity: 0.0;
    /*margin: 12px;*/
    border: 12px solid transparent;
    border-left: 12px solid transparent;
}
.add::before {
    content: "+"; 
    background-image: url(/assets/add.png);
    width: 16px;
    height: 16px;
    margin-left: -8px;
}
.item-rm:hover {
    background-color: #89818110;
    outline: 2px solid #89818110;
}
.item.selected .item-rm:hover { 
    background-color: #89818125 !important;
    outline: 2px solid #89818125 !important;
}
</style>
{#key selected}
<div class="item-list">
    {#each items as item, i}
    <div class="item" style={itemStyle(item)} 
        class:add="{item.type === 'add'}"
        class:selected="{item === selected}"
        on:click={() => onItemClick(item)}
        on:keypress={() => {}}>
        <span class="item-name">
            {#if item.type === 'loading'}
                <Spinner/> 
            {:else}
                {item.name}
            {/if}
        </span>
        {#if !item.type}
        <span class="item-rm" 
            on:click|stopPropagation={() => onRemoveClick(item)}
            on:keypress={() => {}}>
        </span>
        {/if}
    </div>
    {/each}
</div>
{/key}
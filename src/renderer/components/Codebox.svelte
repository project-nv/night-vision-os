<script>
    import * as monaco from 'monaco-editor';
    import { onMount } from 'svelte';
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
    import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
    import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
    import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
    import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

    export function setValue(src, lang) {
        trackChanges = false
        changed = false
        editor.getModel().language = lang
        editor.setValue(src)
        editor.setScrollPosition({scrollTop: 0});
        setTimeout(() => trackChanges = true, 100)
    }

    export let code = {}
    let divEl = null;
    let editor = null;
    let changed = false
    let trackChanges = false
    let Monaco;

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
        validate: false
    });

    onMount(async () => {
        // @ts-ignore
        self.MonacoEnvironment = {
            getWorker: function (_moduleId, label) {
                if (label === 'json') {
                    return new jsonWorker();
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                    return new cssWorker();
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                    return new htmlWorker();
                }
                if (label === 'typescript' || label === 'javascript') {
                    return new tsWorker();
                }
                return new editorWorker();
            }
        };

        Monaco = await import('monaco-editor');
        Monaco.editor.defineTheme('myTheme', {
            base: 'vs-dark',
            inherit: true,
            rules: [{ background: '#14151c' }],
            colors: {
                'editor.background': '#14151c'
            }
        });
        editor = Monaco.editor.create(divEl, {
            value: code.src,
            language: code.type,
            theme: 'myTheme',
            minimap: { enabled: false }
        });

        editor.onDidChangeModelContent((event) => {
            onChange(editor.getValue(), event)
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            if (changed && code.button && code.button.text === 'Save') {
                code.button.handler(editor.getValue())
                changed = false
            }
        })

        editor.addCommand(monaco.KeyCode.Escape, () => {
            editor.setValue(code.src)
            changed = false
        })
        
        resizeTracker(editor)

        return () => {
            editor.dispose();
        };
    }); 


    function resizeTracker(editor) {

        const resizeObserver = new ResizeObserver((entries) => {
            editor.layout();
        })
        resizeObserver.observe(divEl)
    }

    // TODO: ctrl-s => save, Esc => reset 

    function onChange(src, event) {
        if (trackChanges) {
            if (code.onChange) {
                code.onChange(src, event)
            }
            changed = true
        }
    }

</script>
<style>
#code-box {
    width: 100%;
    height: 100%;
    text-align: left;
    min-height:100%;
    min-width:100%;
}
.action-button {
    position: absolute;
    bottom: 10px;
    right: 22px;
    z-index: 10;
    background: #14151c;
    padding: 10px 30px;
    border-radius: 7px;
    border: 2px solid green;
    user-select: none;
    cursor: pointer;
    /*box-shadow: 0px 0px 40px 10px #00800025;*/
}
.action-button:hover {
    filter: brightness(1.25);
}
</style>

<div bind:this={divEl} id="code-box">
    {#if code.button && (
        (changed && code.button.showOnChange) ||
        code.button.showOnChange === undefined
    )}
    <div class="action-button" 
        on:click={() => { 
            code.button.handler(editor.getValue())
            changed = false
        }}
        on:keypress={() => {}}>
        {code.button.text}
    </div>
    {/if}
</div>


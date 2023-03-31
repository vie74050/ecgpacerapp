import { IDomNodes, IDomInputNodes } from '../Interfaces';
import { rhythms } from '../Presets/InnateRythms';
import { SetContent } from './SetContent';
import $ from "jquery";
import * as Display from './DisplayPanel';
import { getDomInputNodes, findGetParameters } from "../helpers";

export var INPUTS: IDomInputNodes;
export function Setup(id: string) {
    INPUTS = getDomInputNodes(id); //console.log(INPUTS);

    const displayNodes: IDomNodes = Display.DisplayNodes;
    const nX: HTMLInputElement = Display.nX;

    handleURLLoad();

    const reset_btn = document.getElementById('reset_btn');
    reset_btn.onclick = (event: Event) => {
        resetInputsToDefault();
        Array.from(document.getElementsByTagName('select')).forEach(sel => {
            sel.selectedIndex = 0;
            sel.dispatchEvent(new Event('change'));
        });
    }

    const save_btn = document.getElementById('save_btn');
    save_btn.onclick = (event: Event) => {
        let filename = '';
        let content = {};

        Object.keys(INPUTS).forEach( (k) => {
            let data = INPUTS[k];
            let val = data.type === 'checkbox'? data.checked : data.value ;

            // omit if same as default
            if (data.type == 'checkbox' && val != data.defaultChecked
                || val != data.defaultValue) {
                content[k] = val;
            }
        });
       
        do {
            filename = prompt('Enter file name to save as.');
        } while (filename.length===0 || filename == null);

        if (filename.length>0){
            content['title'] = filename;
            filename = 'ECGAPP_'+filename+'.txt';
            download(JSON.stringify(content), filename, 'text/plain' );
            alert(filename + '... Saved to your local Downloads folder.');
        }        
    }

    const load_btn = document.getElementById('load_btn');
    load_btn.onclick = (event: Event) => {
        load(INPUTS);
    }

    const url_btn = document.getElementById('url_btn');
    url_btn.onclick = (event: Event) => {
        let root = window.location.origin 
                ? window.location.origin + window.location.pathname
                : window.location.protocol + '/' + window.location.host + window.location.pathname;
                
        let settings_str = Object.keys(INPUTS).reduce( (acc, curr, i) => {
            const data = INPUTS[curr];
            let val = data.type == 'checkbox'? data.checked : data.value;
            let newparam = acc.length==0? curr + '=' + val : '&' + curr + '=' + val;

            // omit if same as default
            if (data.type == 'checkbox' && val == data.defaultChecked
                || val === data.defaultValue) {
                newparam = '';
            }
            
            return acc + newparam;   
        }, "");
        
        let msg = root + '?settings=0';
        msg += (settings_str.length > 0)? '&' + settings_str : '';
     
        if(window.confirm(msg)) {
           window.open(msg, 'new window open');
        };

    }

    const hide_settings_btn: HTMLSelectElement = <HTMLSelectElement>document.getElementById('hide_settings_btn');
    hide_settings_btn.onclick = (event: Event) => {
        var target = document.getElementById('_settings');
        target.classList.toggle('_mini');
    }

    // Preset innate rhythm selection options
    const presets_sel = (document.getElementById('innate-sel')) as HTMLSelectElement;
    const presets_rhythms = rhythms;
    // create preset options
    let k: keyof typeof presets_rhythms;
    for (k in presets_rhythms) {
        
        let data =  presets_rhythms[k];        
        if (data) {
            let newoption = document.createElement('option');
            newoption.value = k;
            newoption.textContent = data['title']? data['title'] : k;
            presets_sel.add(newoption);
        } 
    }
    presets_sel.onchange = (event: Event) => {
        let key = (event.target as HTMLInputElement).value;
        const contents = rhythms[key];
        if (contents) {
            SetContent(key, contents, INPUTS);
        }
        //console.log(contents);
    };

    const snr_btn = INPUTS['sn_r'];
    snr_btn.onchange = (event: Event) => {
        INPUTS['av_r'].value = snr_btn.value; 
    };

    const sys_btn = INPUTS['sys_r'];
    sys_btn.onchange = (event: Event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        displayNodes['sys_display_v'].textContent = newV.toString();
    };
    sys_btn.defaultValue = sys_btn.value;
    sys_btn.dispatchEvent(new Event('change'));

    const dia_btn = INPUTS['dia_r'];
    dia_btn.onchange = (event: Event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        displayNodes['dia_display_v'].textContent = newV.toString();
    };
    dia_btn.defaultValue = dia_btn.value;
    dia_btn.dispatchEvent(new Event('change'));

    const ui_show_cbs = (document.getElementsByClassName('uishow_cb')) as HTMLCollectionOf<HTMLInputElement>;
    for (let i = 0; i < ui_show_cbs.length; i++) {
        ui_show_cbs[i].onchange = (event: Event) => {
            const targ = (event.currentTarget as HTMLInputElement);
            const targClassname = '._' + targ.id;
            if (targ.checked) {
                $(targClassname)?.show(); 
            }else {
                $(targClassname)?.hide(); 
            };
        };
    
    }

    const innateInputs = $('._innateSettings input');
    for (let i = 0; i < innateInputs.length; i++) {
        innateInputs[i].addEventListener("change", (e) => { 
            nX.dispatchEvent(new Event('change')); // redraw graphs
        });
    }
}

/** Gets all input elements and resets to default value */
function resetInputsToDefault() {
    Array.from(document.getElementsByTagName('input')).forEach(input => {
        input.value = input.defaultValue;
        
        if (input.type == 'checkbox') {
            input.checked = input.defaultChecked;
        }
        
        input.dispatchEvent(new Event('change'));
    });
}

/** Saves settings as json txt file to local folder. 
 *  Prompts user for filename to save as. */
function download(content, fileName, contentType) {
    var a = document.createElement('a');
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

/** Prompts user to select a local saved txt file to load. */
function load(SETTINGS: IDomInputNodes) {
    let input = document.createElement('input') as HTMLInputElement;
    input.type = 'file';

    input.onchange = e => { 
        let file = (e.currentTarget as HTMLInputElement).files[0]; 
        let reader = new FileReader();
        reader.readAsText(file); 

        reader.onload = readerEvent => {
            let content = readerEvent.target.result; 
            if (content) {
                let data = JSON.parse(content as string);
                SetContent(file.name, data, SETTINGS);
            }
        }
    }
    input.click();
}

/** Load from URL */
function handleURLLoad() {
    /** Hide DOM element based on URL params: classid=0
    * NB: must prefix class id with `_` in index.html if hideable
    * e.g. ?pacer=0&bpgraph=0&settings=0 
    */
    let setup_params = findGetParameters();
    let initdata = {};
    setup_params.forEach( (v,i)=>{
        let key = decodeURI(v[0]).toString();
        let val = decodeURI(v[1]).toString();

        // check for DOM element target, `_{id}`, to hide
        if (val==='false' || val==='none' || val==='0') {
            $('._'+v[0])?.hide();
        }

        // check for custom rhythm settings
        if (INPUTS[v[0]]) {    
            
            //console.log(SETTINGS_INPUTS[decodeURI(v[0])],decodeURI(v[1]));
            initdata[key] = val;
        }

        if (key === 'title') initdata['title'] = val;
    });
    if (Object.keys(initdata).length>0) {
        let title = initdata['title'] || 'Custom'; console.log(setup_params);
        SetContent(title, initdata, INPUTS);
    }
}
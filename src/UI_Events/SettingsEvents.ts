import { IDomNodes, IDomInputNodes } from '../Interfaces';
import { rhythms } from '../Presets/InnateRythms';

export function Setup(DISPLAY_ELEMS: IDomNodes, SETTINGS_INPUTS: IDomInputNodes) {
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

        Object.keys(SETTINGS_INPUTS).map( (k) => {
            let data = SETTINGS_INPUTS[k];
            content[k] = data.type === 'checkbox'? data.checked : data.value ;
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
        load(SETTINGS_INPUTS);
    }

    const hide_settings_btn: HTMLSelectElement = <HTMLSelectElement>document.getElementById('hide_settings_btn');
    hide_settings_btn.onclick = (event: Event) => {
        var target = document.getElementById('setup-area');
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
            setContent(key, contents, SETTINGS_INPUTS);
        }
        //console.log(contents);
    };

    const snr_btn = SETTINGS_INPUTS['snr_v'];
    snr_btn.onchange = (event: Event) => {
        SETTINGS_INPUTS['avr_v'].value = snr_btn.value;
    };

    const sys_btn = SETTINGS_INPUTS['sys_v'];
    sys_btn.onchange = (event: Event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        DISPLAY_ELEMS['sys_display_v'].textContent = newV.toString();
    };
    sys_btn.defaultValue = sys_btn.value;
    sys_btn.dispatchEvent(new Event('change'));

    const dia_btn = SETTINGS_INPUTS['dia_v'];
    dia_btn.onchange = (event: Event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        DISPLAY_ELEMS['dia_display_v'].textContent = newV.toString();
    };
    dia_btn.defaultValue = dia_btn.value;
    dia_btn.dispatchEvent(new Event('change'));
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
function load(SETTINGS_INPUTS: IDomInputNodes) {
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
                setContent(file.name, data, SETTINGS_INPUTS);
            }
        }
    }
    input.click();
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
/** Applies the data to settings inputs.
 *  Adds to Settings Presets options if new.
 */
function setContent(fname: string, data: any, SETTINGS_INPUTS: IDomInputNodes) {
    let k: keyof typeof data;
    for (k in data) {
        // set Settings
        let target = SETTINGS_INPUTS[k];
        if (target){
            if( target.type === 'number') target.value = data[k];
            else if (target.type === 'checkbox') target.checked = data[k];

            target.dispatchEvent(new Event('change'));
        }      
    }

    if (!(fname in rhythms)) {
        const presets_sel = (document.getElementById('innate-sel')) as HTMLSelectElement;
       
        rhythms[fname] = data;
        let newoption = document.createElement('option') as HTMLOptionElement;
            newoption.value = fname;
            newoption.textContent = data['title']? data['title'] : fname;

        presets_sel.add(newoption);
        presets_sel.value = fname;
        //console.log(rhythms);

    } 
}

import { IDomInputNodes } from '../Interfaces';
import { rhythms } from '../Presets/InnateRythms';

/** Applies the data to settings inputs.
 *  Adds to Settings Presets options if new.
 */
export function SetContent(fname: string, data: any, SETTINGS_INPUTS: IDomInputNodes) {
    let k: keyof typeof data;
    for (k in data) {
        // set Settings
        let target = SETTINGS_INPUTS[k];
        if (target) {
            if (target.type === 'number')
                target.value = data[k];
            else if (target.type === 'checkbox')
                target.checked = data[k] === true || data[k] === 'true';

            target.dispatchEvent(new Event('change'));
        }
    }

    if (!(fname in rhythms)) {
        const presets_sel = (document.getElementById('innate-sel')) as HTMLSelectElement;

        rhythms[fname] = data;
        let newoption = document.createElement('option') as HTMLOptionElement;
        newoption.value = fname;
        newoption.textContent = data['title'] ? data['title'] : fname;

        //loaded element will be added to top -- becomes new default data for reset    
        presets_sel.add(newoption, presets_sel.options[0]);
        presets_sel.value = fname;
        //console.log(rhythms);
    }
}

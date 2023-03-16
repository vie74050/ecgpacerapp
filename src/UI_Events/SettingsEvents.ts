import { IPresetFunctions, IDomNodes, IDomInputNodes } from "../Interfaces";

export function Setup(DISPLAY_ELEMS: IDomNodes, SETTINGS_INPUTS: IDomInputNodes) {
    const reset_btn = document.getElementById("reset_btn");
    reset_btn.onclick = (event: Event) => {
        Array.from(document.getElementsByTagName('input')).forEach(input => {
            input.value = input.defaultValue;
            input.dispatchEvent(new Event('change'));

            if (input.type == "checkbox") {
                input.checked = input.defaultChecked;
            }
        });
        Array.from(document.getElementsByTagName('select')).forEach(sel => {
            sel.selectedIndex = 0;
            sel.dispatchEvent(new Event('change'));
        });
    }

    const save_btn = document.getElementById("save_btn");
    save_btn.onclick = (event: Event) => {
        let filename = '';
        let content = {};

        Object.keys(SETTINGS_INPUTS).map( k => content[k] = SETTINGS_INPUTS[k].value);
       
        do {
            filename = prompt('Enter file name.');
        } while (filename.length===0 || filename == null);

        if (filename.length>0){
            filename = 'ecgapp/'+filename+'.txt';
            download(JSON.stringify(content), filename, 'text/plain' );
            alert(filename + "... Saved to your local Downloads folder.");
        }        
    }

    const hide_settings_btn: HTMLSelectElement = <HTMLSelectElement>document.getElementById("hide_settings_btn");
    hide_settings_btn.onclick = (event: Event) => {
        var target = document.getElementById("setup-area");
        target.classList.toggle("_mini");
    }

    // Preset innate rhythm selection options
    const presets_sel = document.getElementById("innate-sel");
    var PRESETS: IPresetFunctions = {
        "2ndavb1": () => {
            SETTINGS_INPUTS["pr_v"].value = '2';
            SETTINGS_INPUTS["pr_cb"].checked = true;
            SETTINGS_INPUTS["qrs_n"].value = '3';
        },
        "2ndavb2": () => {
            SETTINGS_INPUTS["qrs_n"].value = '3';
            SETTINGS_INPUTS["qrs_r"].checked = true;
        },
        "3rdavb": () => {
            SETTINGS_INPUTS["snr_v"].value = '100';
            SETTINGS_INPUTS["avr_v"].value = '30';
            SETTINGS_INPUTS["qrs_w"].value = '5';
        },
        "junctionalbd": () => {
            SETTINGS_INPUTS["snr_v"].value = '50';
            SETTINGS_INPUTS["avr_v"].value = '50';
            SETTINGS_INPUTS["p_h"].value = '-1';
            SETTINGS_INPUTS["qrs_w"].value = '0.8';
        },
        "ventescape": () => {
            SETTINGS_INPUTS["snr_v"].value = '10';
            SETTINGS_INPUTS["avr_v"].value = '40';
            SETTINGS_INPUTS["qrs_n"].value = '4';
            SETTINGS_INPUTS["qrs_w"].value = '5';
        }

    }
    presets_sel.onchange = (event: Event) => {
        let key = (event.target as HTMLInputElement).value;
        Array.from(document.getElementsByTagName('input')).forEach(input => {
            input.value = input.defaultValue;
            input.dispatchEvent(new Event('change'));

            if (input.type == "checkbox") {
                input.checked = input.defaultChecked;
            }
        });
        if (key in PRESETS) {
            PRESETS[key]();
        }
    };

    const snr_btn = SETTINGS_INPUTS["snr_v"];
    snr_btn.onchange = (event: Event) => {
        SETTINGS_INPUTS["avr_v"].value = snr_btn.value;
    };

    const sys_btn = SETTINGS_INPUTS["sys_v"];
    sys_btn.onchange = (event: Event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        DISPLAY_ELEMS["sys_display_v"].textContent = newV.toString();
    };
    sys_btn.defaultValue = sys_btn.value;
    sys_btn.dispatchEvent(new Event('change'));

    const dia_btn = SETTINGS_INPUTS["dia_v"];
    dia_btn.onchange = (event: Event) => {
        let newV = Number((event.target as HTMLInputElement).value);
        DISPLAY_ELEMS["dia_display_v"].textContent = newV.toString();
    };
    dia_btn.defaultValue = dia_btn.value;
    dia_btn.dispatchEvent(new Event('change'));
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

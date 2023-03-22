# ECG Pacemaker Web App

Single page webapp to simulate ECG and pacemaker functions, used as a teaching and learning tool.

Author: Vienna Ly  
Company: BCIT  
SMEs:

- Michelle Dunphy
- Sarah Neville

## 1. How instructors set up variables for the case
![image](https://user-images.githubusercontent.com/5272116/227010139-44b6a5be-5b99-4c89-8361-91cd7f9ab46c.png)

### Load from file

- Prompts user to select a file from local directory
- Loads the preset values and adds to `Preset` selection as first (default) option

### Save to Local

- Prompts user to enter a name (string) to be used as file name and title attribute
- Save to the `Downloads` folder (based on user's web settings) as a text file

### Reset

Will reset all inputs in the webapp to session defaults.

- Pacer settings will be reset to defaults
- Innate rhythm settings will be reset to first item in the **Preset** options (if no custom loaded settings, Normal Sinus Rhythm at 80 is the default)

### Get URL Link

Will create a user link with the current Settings.  User links will not show the Settings panel.

#### Loading with optional URL parameters

Pass optional parameters with the URL to set UI and rhythm settings. Unset parameters use default values for *Normal Sinus Rhythm at 80 bpm*.

Format: {url}?`{options}`

#### Options

##### Hide UI areas

   > bpgraph=0  
   > pacer=0  
   > settings=0  

##### Pre-Set Innate Rhythm Settings in URL

Refer to `Param name(s)` associated with each variable in the docs.  

 NB

- suffix `_h` (height) and `_w` (width) should be passed a number
- suffix `_cb` (checkbox) should be passed `true` or `false`

##### Example 

> {URL}`?sn_r=60&p_h=0&bpgraph=0&pr_cb=true`
>
> - Sets **SN Rate** to 60 (and AV rate follows) and **P height** to 0  
> - Hides BP graph

## **Innate Rhythm settings**

### **SN rate**

Param name: `sn_r`

P pulse rate.  If changed will also change **AV rate** likewise.  

- **Irregular option** `snr_cb`:  if checked (true), the associated rate will vary +/- 25% from the set rate.

### **AV rate**

Param name: `av_r`  

Default: if unchanged, it will follow SN rate.  

- **Irregular option** `avr_cb`:  if checked (true), the associated rate will vary +/- 25% from the set rate.

### **Heights** (normalized)

Param names: `p_h`, `qrs_h`, `s_h`, `t_h`

Multiplier for default amplitude values.  

> e.g. if set to 2, then peak height of the complex will be 2x the default

### **PR segment** (normalized)  

Param name: `pr_w`

Multiplier for PR segment duration (width)

- **Increasing?** `pr_cb`: if checked, PR multiplier will increase each cycle and reset based on QRS drop (e.g. try Pre-set 2nd AV Block I)

### **QRS duration**

Param name: `qrs_w`

Multiplier for QRS complex duration (width)

### **QRS Drop** number (n)

Param name: `qrs_n`

Cycles up to the set number (n), which will be dropped.  

e.g.  
> n = 1, every QRS will be dropped  
> n = 2, every second QRS will be dropped…etc.  

- **Random?**:  If checked, then every (n) will be randomly dropped or not

### **ST Segment**

Param name: `st_w`

Multiplier for ST segment duration (width)

### **T duration**

Param name: `t_w`

Multiplier for T wave duration (width)

### **Pre-sets**

Select from the list of pre-set rhythms.  They should set the values for the Innate Rhythm Settings parameters above.
If saved settings are loaded, the load option will be added to selection list for the session (does not persist if page reloaded).

### **Simulation Threshold**

Represents the innate mA required to stimulate a response.  
i.e. The corresponding pacer Output mA must be >= than the threshold in order for a pulse to stimulate a triggered response. 

---

## 2. Pacer Settings

Where user (student) adjust pacemaker settings to view changes

~ Work in progress~  
Need to define the base rhythm and key points that will interact with pacemaker (i.e atrial pulse looks at P signal, …etc.)

1. Rate – sets the rate to emit pacer pulse
2. P – will flash when a pulse is emitted
3. S - will flash when innate signal is sensed
4. MODE - preset modes based on 3-Pacemaker Codes nomencalture
    i. Chamber paced: A, V, D, O
    ii. Chamber sensed: A, V, D, O
    iii. Response to sensed: T, I D

---

## 3. Monitor Settings

Output graph and vital signs

1. **Play/Pause**  
Toggle to pause or resume graphing

2. **Scale X (seconds)**  
Change the scale of the x axis.  Each tick is 1 second.  Set the number of seconds for the width of monitor.
    >e.g. default x = 5 = graph width represents five seconds

---

## Pre-development Resources

### Online Dev Sandboxes

Used for rapid prototyping:  

1. **Code**: <https://jsfiddle.net/vie/yt7pxnm6>  
2. **Calculations**: <https://www.desmos.com/calculator/avtqfzgx7c>

### References

#### Docs & resources from SMEs

1. [Pacemaker Simulation doc](https://docs.google.com/document/d/1-7uLznpzISD7Ad-HLrtvr8eFzy3rfjLs/edit?usp=sharing&ouid=112502391111689148097&rtpof=true&sd=true)
2. [Sample Rhythms for reference](https://drive.google.com/drive/folders/1WuSsgM4wSVVp7ZhGuaSCDNwyNxTkWXfb?usp=share_link)

#### Other references

1. ECG interval nomenclature based on: <https://litfl.com/pr-interval-ecg-library/>
2. “normal” values: <https://www.nottingham.ac.uk/nursing/practice/resources/cardiology/function/normal_duration.php>
3. Pacemaker  
   i. Interpretation of Pacemaker ECG: <https://ecgwaves.com/topic/ecg-pacemaker-rhythm-malfunction-failure-tachyarrhythmia/>  
   ii. Assessment of Pacemaker Malfunction: <https://ecgwaves.com/topic/assessment-of-pacemaker-malfunction-using-ecg/>
4. Blood pressure
   i. Normal arterial line waveforms: <https://derangedphysiology.com/main/cicm-primary-exam/required-reading/cardiovascular-system/Chapter%20760/normal-arterial-line-waveforms>
   ii. Arterial pressure monitoring: <https://www.statpearls.com/ArticleLibrary/viewarticle/17843>

## Development

js-based HTML web app built using Typescript and SCSS for development.

### Set up

Run `npm install`

### Local Dev

Run `npm run start` to start webpack in dev mode  
> Starts local server using port 8080, `localhost:8080`
> Watches for changes  

#### CLI helpers

Command line helpers for processing data should be in the `cli` folder. Not required for app functionality; just dev helpers.

1. Run `node cli/MakeURL.js`

- Outputs a URL with the settings options provided at prompt (copy/paste saved text string or manually enter)

### Production

Run `npm run build` for production
> Using Webpack to package and minify to `./dist` folder.

#### Deploy

Run `npm run deploy`
> Will be deployed to GitHub pages: <https://vie74050.github.io/ecgpacerapp/>

# ECG Pacemaker Web App

Single page webapp to simulate ECG and pacemaker functions, used as a teaching and learning tool.

Author: Vienna Ly  
Company: BCIT  
SMEs:

- Michelle Dunphy
- Sarah Neville

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

## Development

js-based HTML web app built using Typescript and SCSS for development.

### Set up

Run `npm install`

### Local Dev

Run `npm run start` to start webpack in dev mode  
> Starts local server using port 8080, `localhost:8080`
> Watches for changes  

### Production

Run `npm run build` for production
> Using Webpack to package and minify to `./dist` folder.

#### Deploy

Run `npm run deploy`
> Will be deployed to GitHub pages: <https://vie74050.github.io/ecgpacerapp/>

## User Manual / App Features

### 1. Case Settings

Where instructor set up variables for the case

1. **Pre-sets**
    Select from the list of pre-set rhythms.  They should set the values for the Innate Rhythm Settings parameters above.

2. **Innate Rhythm settings** inputs  
    a. **SN RATE** – P pulse rate.  If changed will also change AV rate likewise  
    b. **AV rate**  -- default if unchanged, it will follow SN rate  

    i. **Irregular option**:  if checked, the associated rate will vary +/- 25% from the set rate.  

3. **P height, QRS height** (normalized)  
Multiplier for default amplitude values.  i.e. set to 2, then peak height of the complex will be 2x the default

4. **PR segment** (normalized)  
Multiplier for PR segment duration  
    a. **Increasing?**: if checked, PR multiplier will increase each cycle and reset based on QRS drop (e.g. try Pre-set 2nd AV Block I)

5. **QRS duration**
Multiplier for QRS complex duration (width)

6. **QRS Drop**  
Cycle up to the set number (n), which will be dropped.  
    >e.g.  
    >n = 1, every QRS will be dropped  
    >n = 2, every second QRS will be dropped…etc.  

    a. **Random?**:  if checked, then every n will be randomly dropped or not

7. **ST Segment**: multiplier for ST segment duration

8. **T duration**: multiplier for T wave duration (width)

### 2. Pacer Settings

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

### 3. Monitor Settings

Output graph and vital signs

1. **Play/Pause**  
Toggle to pause or resume graphing

2. **Scale X (seconds)**  
Change the scale of the x axis.  Each tick is 1 second.  Set the number of seconds for the width of monitor.
    >e.g. default x = 5 = graph width represents five seconds

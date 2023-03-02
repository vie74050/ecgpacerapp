# ECG pacemaker SPA

Single page app, using Typescript, SCSS, Webpack, to simulate ECG and pacemaker functions. To be used as a teaching and learning tool.

## Development Notes

**Code sandbox**: <https://jsfiddle.net/vie/yt7pxnm6>

### build

Run `npm install` and `npm build` to set up.
> Using Webpack to package ts files to `.src/built/`, then esbuild to minify to `./dist` folder
> scss compiled to `./dist/css`, minified.  Run `npm run scss` to just compile the scss file.

#### Development mode

`npm run start` to start local server.  
`npm run dev` for webpack watch mode.

### People

Author: Vienna Ly  
Company: BCIT  
SMEs:

- Michelle Dunphy
- Sarah Neville

### References

Notes & resources from SMEs are in [Google Drive](https://drive.google.com/drive/folders/1AKn0I89XzcTrrK5CD73ZebVDXY4MrUrt?usp=sharing) (Permissions required)

Other resources:

1. ECG interval nomenclature based on: <https://litfl.com/pr-interval-ecg-library/>
2. “normal” values: <https://www.nottingham.ac.uk/nursing/practice/resources/cardiology/function/normal_duration.php>

## User Manual

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

### 3. Monitor Settings

Output graph and vital signs

1. **Play/Pause**  
Toggle to pause or resume graphing

2. **Scale X (seconds)**  
Change the scale of the x axis.  Each tick is 1 second.  Set the number of seconds for the width of monitor.
    >e.g. default x = 5 = graph width represents five seconds

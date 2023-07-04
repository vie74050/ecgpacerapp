/* @TODO standardize defaults and units used */
// Normal sinus rhythm defaul w, h for hr=60bpm
// w ~ 0.1 * sec, h ~ px
import { IPulse } from "../Interfaces";

var p: IPulse = {w: 0.03, h: 8, i: 0.05},
    pq: IPulse = {w: 0.1, h: 0},
    q: IPulse = {w: 0.005, h: -10},
    r: IPulse = {w: 0.011, h: 50, i: 0.02},
    s: IPulse = {w: 0.005, h: -20, i: 0.02},
    st: IPulse = {w: 0.20, h: 0},
    t: IPulse = {w: 0.050, h: 10};
export {p, pq, q, r, s, t, st}
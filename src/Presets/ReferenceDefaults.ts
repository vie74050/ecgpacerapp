/* @TODO standardize defaults and units used */
// Normal sinus rhythm defaul w, h
// w ~ 0.1 * sec, h ~ px
import { IPulse } from "../Interfaces";

var p: IPulse = {w: 0.012, h: 10, i: 0.2},
    pq: IPulse = {w: 0.04, h: 0},
    q: IPulse = {w: 0.005, h: -10},
    r: IPulse = {w: 0.009, h: 60},
    s: IPulse = {w: 0.010, h: -20},
    st: IPulse = {w: 0.20, h: 0},
    t: IPulse = {w: 0.040, h: 10};
export {p, pq, q, r, s, t, st}
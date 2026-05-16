/* @ts-self-types="./chessellation.d.ts" */

import * as wasm from "./chessellation_bg.wasm";
import { __wbg_set_wasm } from "./chessellation_bg.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    Chessellator, init
} from "./chessellation_bg.js";

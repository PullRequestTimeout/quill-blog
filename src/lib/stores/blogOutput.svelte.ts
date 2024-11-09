import { Delta } from "quill/core";

export let htmlOutput = $state({html: ''});
export let rawOutput = $state({raw: new Delta()});

var _indents: Array<string> = [];

function indentation(level: number){
    return _indents[level] = _indents[level] || new Array(level).fill("....").join("");
} 

export function log(level: number, ...msgs: string[]) {
    msgs.forEach(x => console.log(`${indentation(level)}${x}`));
}
import {ipset} from './ipset';


const _ipset1 = new ipset("211.137.80.0/20");
const _ipset2 = new ipset("211.137.80.256/20");
const _res = _ipset1.sliceIPs(_ipset2);
// const start = _ipset.start;
// const end = _ipset.end;

if(_res != null){
    console.log(_res.length);
}
else{
    console.log(null);
}

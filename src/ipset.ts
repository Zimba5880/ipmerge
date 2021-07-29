export class ipset{

    iparr:Array<number>;
    prefix:number;
    start:Array<number>;
    end:Array<number>;

    constructor(ip:string){
        const _iparr = ip.split("/");
        if(_iparr.length==2){
            this.iparr = validIP(_iparr[0]);
            this.prefix = parseInt(_iparr[1]);
            if(isNaN(this.prefix)||this.prefix<0||this.prefix>32){
                throw "前缀不合法";
            }
            const ranges = getRange(this.iparr,this.prefix);
            this.start = ranges.start;
            this.end = ranges.end;
        }
        else{
            throw "ip地址不合法";
        }
    }

    contains(ips:ipset):boolean{
        let _res = true;

        let flexiableindex = Math.floor(this.prefix/8);
        flexiableindex = flexiableindex==4?3:flexiableindex;

        let target_flex = Math.floor(ips.prefix/8);
        target_flex = target_flex==4?3:target_flex;
        if(this.prefix>ips.prefix){
            _res=false;
        }
        if(flexiableindex<=target_flex){
            for(let i=0;i<flexiableindex;i++){
                if(this.start[i]<ips.start[i]){
                    _res=false;
                    break;
                }
            }
        }
        else{
            _res=false;
        }

        return _res;
    }

    sliceIPs(ips:ipset):Array<ipset> {
        const _res:Array<ipset> = [];
        if(this.contains(ips)){
            const sliced = halfSliceIPs(this);
            if(sliced[0]!=null&&sliced[0].contains(ips)){
                _res.push(sliced[1]);
                // const removed = this.sliceIPs(sliced[0]);
                const removed = sliced[0].sliceIPs(ips);
                for(let j=0;j<removed.length;j++){
                    _res.push(removed[j]);
                }
            }
            else if(sliced[1]!=null&&sliced[1].contains(ips)){
                _res.push(sliced[0]);
                // const removed = this.sliceIPs(sliced[1]);
                const removed = sliced[1].sliceIPs(ips);
                for(let j=0;j<removed.length;j++){
                    _res.push(removed[j]);
                }
            }
        }
        return _res;
    }
}


function  getRange(ip:Array<number>,prefix:number):{
    start:Array<number>,
    end:Array<number> }{
    let flexiableindex = Math.floor(prefix/8);
    flexiableindex = flexiableindex==4?3:flexiableindex;
    const flexiableTimes = 8-(prefix%8);
    const flexiableIPCounts = Math.pow(2,flexiableTimes);
    const startnum = Math.floor(ip[flexiableindex]/flexiableIPCounts)*flexiableIPCounts;
    const endnum = startnum+flexiableIPCounts-1;
    const _start = ip.concat([]);
    const _end = ip.concat([]);
    _start[flexiableindex] = startnum;
    for(let i=3;i>flexiableindex;i--){
        _start[i]=0;
    }
    _end[flexiableindex] = endnum;
    for(let i=3;i>flexiableindex;i--){
        _end[i]=255;
    }
    return {
        start:_start,
        end:_end
    }
}

function validIP(ip_str:string):Array<number>{
    const _iparr = ip_str.split(".");
    if(_iparr.length==4){
        let _res = new Array<number>(4);
        let qualifyindex = -1;
        for(let i=0;i<4;i++){
            let single = parseInt(_iparr[i]);
            if(isNaN(single)){
                throw "ip地址不合法";
            }
            else if(single<0){
                throw "ip地址不合法";
            }
            else if(single>255){
                qualifyindex = i>qualifyindex?i:qualifyindex;
                _res[i]=single;
            }
            else {
                _res[i]=single;
            }
        }
        if(qualifyindex>=0){
            _res = qualifyIp(_res,qualifyindex);
            if(_res[0]>255){
                throw "ip地址不合法";
            }
            else{
                return _res;
            }
        }
        else{
            return _res;
        }
        
    }
    else{
        throw "ip地址不合法";
    }
}

function qualifyIp(iparr:Array<number>,index:number):Array<number>{
    if(index==0){
        return iparr;
    }
    else{
        const carrycount = Math.floor(iparr[index]/256) ;
        if(carrycount==0){
            return iparr;
        }
        else{
            iparr[index] = iparr[index]%256;
            const _nextindex = index-1;
            iparr[_nextindex] = iparr[_nextindex]+carrycount;
            return qualifyIp(iparr,_nextindex);
        }
    }
}

function halfSliceIPs(ips:ipset):Array<ipset>{
    const newprefix = ips.prefix+1;
    if(newprefix==32){
        return [ips,null];
    }
    else{
        let flexibaleindex = Math.floor(newprefix/8);
        flexibaleindex = flexibaleindex==4?3:flexibaleindex;
        let ipcounts = 8-(newprefix%8)
        ipcounts = Math.pow(2,ipcounts);
        const starthalfstr = `${ips.start.join(".")}/${newprefix}`;
        let lasthalfarr = ips.start.concat([]);
        lasthalfarr[flexibaleindex] = lasthalfarr[flexibaleindex]+ipcounts;
        const lasthalf_str =`${lasthalfarr.join(".")}/${newprefix}`;
        const starthalf = new ipset(starthalfstr);
        const lasthalf = new ipset(lasthalf_str);
        return [starthalf,lasthalf];
    }

}
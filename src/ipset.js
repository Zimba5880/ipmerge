"use strict";
exports.__esModule = true;
exports.ipset = void 0;
var ipset = /** @class */ (function () {
    function ipset(ip) {
        var _iparr = ip.split("/");
        if (_iparr.length == 2) {
            this.iparr = validIP(_iparr[0]);
            this.prefix = parseInt(_iparr[1]);
            if (isNaN(this.prefix) || this.prefix < 0 || this.prefix > 32) {
                throw "前缀不合法";
            }
            var ranges = getRange(this.iparr, this.prefix);
            this.start = ranges.start;
            this.end = ranges.end;
        }
        else {
            throw "ip地址不合法";
        }
    }
    ipset.prototype.contains = function (ips) {
        var _res = true;
        var flexiableindex = Math.floor(this.prefix / 8);
        flexiableindex = flexiableindex == 4 ? 3 : flexiableindex;
        var target_flex = Math.floor(ips.prefix / 8);
        target_flex = target_flex == 4 ? 3 : target_flex;
        if (flexiableindex <= target_flex) {
            for (var i = 0; i < flexiableindex; i++) {
                if (this.start[i] < ips.start[i]) {
                    _res = false;
                    break;
                }
            }
        }
        else {
            _res = false;
        }
        return _res;
    };
    ipset.prototype.sliceIPs = function (ips) {
        var _res = [];
        if (this.contains(ips)) {
            var sliced = halfSliceIPs(ips);
            for (var i = 0; i < sliced.length; i++) {
                if (sliced[i] != null && sliced[i].contains(ips)) {
                    var removed = this.sliceIPs(sliced[i]);
                    for (var j = 0; j < removed.length; j++) {
                        _res.push(removed[j]);
                    }
                }
                else {
                    if (sliced[i] != null) {
                        _res.push(sliced[i]);
                    }
                }
            }
        }
        return _res;
    };
    return ipset;
}());
exports.ipset = ipset;
function getRange(ip, prefix) {
    var flexiableindex = Math.floor(prefix / 8);
    flexiableindex = flexiableindex == 4 ? 3 : flexiableindex;
    var flexiableTimes = 8 - (prefix % 8);
    var flexiableIPCounts = Math.pow(2, flexiableTimes);
    var startnum = Math.floor(ip[flexiableindex] / flexiableIPCounts) * flexiableIPCounts;
    var endnum = startnum + flexiableIPCounts - 1;
    var _start = ip.concat([]);
    var _end = ip.concat([]);
    _start[flexiableindex] = startnum;
    for (var i = 3; i > flexiableindex; i--) {
        _start[i] = 0;
    }
    _end[flexiableindex] = endnum;
    for (var i = 3; i > flexiableindex; i--) {
        _end[i] = 255;
    }
    return {
        start: _start,
        end: _end
    };
}
function validIP(ip_str) {
    var _iparr = ip_str.split(".");
    if (_iparr.length == 4) {
        var _res = new Array(4);
        var qualifyindex = -1;
        for (var i = 0; i < 4; i++) {
            var single = parseInt(_iparr[i]);
            if (isNaN(single)) {
                throw "ip地址不合法";
            }
            else if (single < 0) {
                throw "ip地址不合法";
            }
            else if (single > 255) {
                qualifyindex = i > qualifyindex ? i : qualifyindex;
                _res[i] = single;
            }
            else {
                _res[i] = single;
            }
        }
        if (qualifyindex >= 0) {
            _res = qualifyIp(_res, qualifyindex);
            if (_res[0] > 255) {
                throw "ip地址不合法";
            }
            else {
                return _res;
            }
        }
        else {
            return _res;
        }
    }
    else {
        throw "ip地址不合法";
    }
}
function qualifyIp(iparr, index) {
    if (index == 0) {
        return iparr;
    }
    else {
        var carrycount = Math.floor(iparr[index] / 256);
        if (carrycount == 0) {
            return iparr;
        }
        else {
            iparr[index] = iparr[index] % 256;
            var _nextindex = index - 1;
            iparr[_nextindex] = iparr[_nextindex] + carrycount;
            return qualifyIp(iparr, _nextindex);
        }
    }
}
function halfSliceIPs(ips) {
    var newprefix = ips.prefix + 1;
    if (newprefix == 32) {
        return [ips, null];
    }
    else {
        var flexibaleindex = Math.floor(newprefix / 8);
        flexibaleindex = flexibaleindex == 4 ? 3 : flexibaleindex;
        var ipcounts = 8 - (newprefix % 8);
        ipcounts = Math.pow(2, ipcounts);
        var starthalfstr = ips.start.join(".") + "/" + newprefix;
        var lasthalfarr = ips.start.concat([]);
        lasthalfarr[flexibaleindex] = lasthalfarr[flexibaleindex] + ipcounts;
        var lasthalf_str = lasthalfarr.join(".") + "/" + newprefix;
        var starthalf = new ipset(starthalfstr);
        var lasthalf = new ipset(lasthalf_str);
        return [starthalf, lasthalf];
    }
}

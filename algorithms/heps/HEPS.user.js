// ==UserScript==
// @name        HEPS
// @namespace   http://www.dl.kuis.kyoto-u.ac.jp/~manabe/
// @description a HEading-based Page Segmentation algorithm
// @include     *
// @version     1.0.4
// @grant       none
// ==/UserScript==

// Force ECMA-262 v.5 implementations of "every" and "map"
// Polyfills from https://developer.mozilla.org/
Array.prototype.every = function(callbackfn, thisArg) {
    'use strict';
    var T, k;

    if (this == null) {
        throw new TypeError('this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the this 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method
    //    of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
    if (typeof callbackfn !== 'function' && Object.prototype.toString.call(callbackfn) !== '[object Function]') {
        throw new TypeError();
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
        T = thisArg;
    }

    // 6. Let k be 0.
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

        var kValue;

        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal
        //    method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if (k in O) {
            var testResult;
            // i. Let kValue be the result of calling the Get internal method
            //    of O with argument Pk.
            kValue = O[k];

            // ii. Let testResult be the result of calling the Call internal method
            // of callbackfn with T as the this value if T is not undefined
            // else is the result of calling callbackfn
            // and argument list containing kValue, k, and O.
            if(T) testResult = callbackfn.call(T, kValue, k, O);
            else testResult = callbackfn(kValue,k,O)

            // iii. If ToBoolean(testResult) is false, return false.
            if (!testResult) {
                return false;
            }
        }
        k++;
    }
    return true;
};

Array.prototype.map = function(callback/*, thisArg*/) {

    var T, A, k;

    if (this == null) {
        throw new TypeError('this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
        T = arguments[1];
    }

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

        var kValue, mappedValue;

        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal
        //    method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if (k in O) {

            // i. Let kValue be the result of calling the Get internal
            //    method of O with argument Pk.
            kValue = O[k];

            // ii. Let mappedValue be the result of calling the Call internal
            //     method of callback with T as the this value and argument
            //     list containing kValue, k, and O.
            mappedValue = callback.call(T, kValue, k, O);

            // iii. Call the DefineOwnProperty internal method of A with arguments
            // Pk, Property Descriptor
            // { Value: mappedValue,
            //   Writable: true,
            //   Enumerable: true,
            //   Configurable: true },
            // and false.

            // In browsers that support Object.defineProperty, use the following:
            // Object.defineProperty(A, k, {
            //   value: mappedValue,
            //   writable: true,
            //   enumerable: true,
            //   configurable: true
            // });

            // For best browser support, use the following:
            A[k] = mappedValue;
        }
        // d. Increase k by 1.
        k++;
    }

    // 9. return A
    return A;
};

window.HEPS = top.HEPS || new function () {

    var undefined = void 0,
        ROOT = window.document.body, // Root node of analysis
        EXTRACT_URL = true,
        EXTRACT_PAGE_HEADING = true,
        EXTRACT_TEXT_OF_IMG  = true;

    function MyArray(array) {

        this.push.apply(this, array || []);

        return this;

    }

    MyArray.getGetter = function(key) {

        return function(object) {

            return object[key];

        };

    };

    MyArray.prototype = (function() {

        this.constructor = MyArray;

        this.calcRatio = function(func) {

            var cnt = 0;

            this.forEach(function(replica, i, replicaArray) {

                if(func(replica, i, replicaArray) ) cnt += 1;

            });

            return (cnt / this.length);

        };

        this.concat = function(that) {

            return new MyArray(this.toArray().concat(that.toArray() ) );

        };

        this.getLast = function(i) {

            return this[this.length - 1 + (i || 0)];

        };

        this.map = function() {

            return new MyArray(Array.prototype.map.apply(this, arguments) );

        };

        this.setEvery = function(key, value) {

            this.forEach(function(object) {

                object[key] = value;

            });

        };

        this.toRange = function() {

            return({

                "from": this[0].from,
                "to": this.getLast().to,
                "mandatory": true,

            });

        };

        this.toArray = function() {

            return this.slice(0);

        };

        this.toString = function() {

            return this.toArray().toString();

        }

        this.getFrontNodes = function() { // Section 4.3.1

            var targetArray = this,
                resultArray,
                getParent = MyArray.getGetter("parent");

            function isNotNext(replica, i, replicaArray) {

                return replica !== replicaArray[i + 1];

            }

            if(this.frontNodes) return this.frontNodes; // Get cache

            switch(this.length) {

                case 0:

                    resultArray = new MyArray([]);
                    break;

                case 1:

                    resultArray = new MyArray([this[0].root]);
                    break;

                default:

                    while(targetArray.every(isNotNext) ) {

                        resultArray = targetArray;
                        targetArray = targetArray.map(getParent);

                    }

            }

            this.forEach(function(replica, i) {

                replica.frontNode = resultArray[i];

            });

            this.frontNodes = resultArray; // Set cache

            return resultArray;

        };

        this.calcNodeArrays = function() { // Section 4.4.1

            return this.getFrontNodes().map(function(frontNode, i, frontNodes) {

                var targetNode    = frontNode.next,
                    nextFrontNode = frontNodes[i + 1],
                    currentBlock  = frontNode.getContextBlock(),
                    nodeArray     = new MyArray([frontNode]);

                while(!(!targetNode ||              // No following sibling
                    targetNode === nextFrontNode || // Another front node
                    targetNode.hasHeading ||        // Node including headings
                    !currentBlock.includes(targetNode) ) ) {
                    // Node not included in current upper block

                    nodeArray.push(targetNode);
                    targetNode = targetNode.next;

                }

                frontNode.nodeArray = nodeArray;

                return nodeArray;

            });

        };

        return this;

    }).apply(Object.create(Array.prototype) );

    this.MyArray = MyArray;

    function Replica(node, parentReplica) {
        this.node = node;

        function chain(elder, younger) {

            elder.next = younger;
            younger.prev = elder;

        }

        function extractPageHeading(node) {

            var document  = node.ownerDocument,
                titleNode = document.getElementsByTagName("title")[0],
                baseNode  = document.getElementsByTagName("base")[0],
                title,
                url,
                locationHref = document.location.href;

            if(titleNode) {

                return normalizeSpace(titleNode.textContent);

            } else {

                if(baseNode && baseNode.href) {

                    url = baseNode.href;

                    if(/\/$/.test(url) )
                        url += new MyArray(locationHref.split("/") ).getLast();

                } else {

                    url = locationHref;

                }

                url = tokenizeURL(url);

                return normalizeSpace(url);

            }

        }

        this.node = node;
        this.nodeFrom = this.node.getBoundingClientRect ? this.node.getBoundingClientRect().top : this.node.parentElement.getBoundingClientRect().top;
        this.nodeTo = this.node.getBoundingClientRect ? this.node.getBoundingClientRect().bottom : this.node.parentElement.getBoundingClientRect().bottom;

        function getStyle(node, name, context) {

            var getCS  = node.ownerDocument.defaultView.getComputedStyle,
                target = (name === "#text") ? node.parentNode : node,
                styObj = getCS(target, null);

            function parseWeight(value) {

                switch (value) {

                    case "normal": return 400;

                    case "bold":   return 700;

                    default:       return parseInt(value);

                }

            }

            return {

                color:          styObj.color,
                fontSize:       parseFloat(styObj.fontSize),
                fontStyle:      styObj.fontStyle,
                fontWeight:     parseWeight(styObj.fontWeight),
                offsetHeight:   (name === "img") ? node.offsetHeight : "null",
                tagPath:        context + "/" + name,
                textDecoration: styObj.textDecoration,

            };

        }

        function normalizeSpace(string) {

            return string.replace(/\s+/g, " ").replace(/^ | $/g, "");

        }

        function tokenizeURL(url) {

            url = new MyArray(url.split("://") ).getLast();

            return url.split(/\W+/).join(Replica.RAWSTRING_SEP);

        }

        this.name = node.nodeName.toLowerCase();

        if(parentReplica) {

            this.parent = parentReplica;
            this.ancestors = new MyArray([this]).concat(this.parent.ancestors);
            this.style = getStyle(node, this.name, this.parent.style.tagPath);

        } else { // this is root

            if(EXTRACT_PAGE_HEADING) {

                this.pageHeadingRange = {"from": 0, "mandatory": true};
                this.rawString = extractPageHeading(node);
                this.pageHeadingRange.to = this.rawString.length;

            } else {

                this.rawString = "";

            }

            this.id2replica = [];
            this.ancestors = new MyArray([this]);
            this.style = getStyle(node, this.name, "");

        }

        this.root = this.ancestors.getLast();
        this.depth = this.ancestors.length;
        this.id = this.root.id2replica.length; // ID number (== document order)
        this.root.id2replica.push(this);

        if (this.name === "#text") {

            this.isText = true;
            this.content = normalizeSpace(node.textContent);

        } else if (this.name === "img") {

            if(EXTRACT_TEXT_OF_IMG) {

                this.content = normalizeSpace(
                    (node["src"] ? tokenizeURL(node.getAttribute("src")) : "") +
                    Replica.RAWSTRING_SEP + node["alt"] || "");

            } else {

                this.content = "<IMG:" +
                    encodeURIComponent(node.getAttribute("src") || Replica.NOSRC) +
                    ">";

            }

        }

        this.from = this.root.rawString.length + Replica.RAWSTRING_SEP.length;
        // Content offset in rawString
        this.hasIDfrom = this.id;

        if(this.content)
            this.root.rawString += (Replica.RAWSTRING_SEP + this.content);

        if(!Replica.IGNORE_CHILDREN_OF[this.name]) {

            [].forEach.call(node.childNodes, function(childNode) {

                if(-1 < Replica.SCAN_CHILDREN_OF.indexOf(childNode.nodeType) ) {

                    this.push(new Replica(childNode, this) );

                    if(1 < this.length) chain(this.getLast(-1), this.getLast() );

                }

            }, this);

        }

        this.to = this.root.rawString.length; // Content limit in rawString
        this.hasIDto = this.getLast() ? this.getLast().hasIDto : this.id;

        return this;

    }

    Replica.IGNORE_CHILDREN_OF = { // Descendants of these nodes will be ignored

        iframe:   true,
        noscript: true,
        script:   true,
        style:    true,

    };

    Replica.RAWSTRING_SEP = " ";

    Replica.NOSRC = "no-src";

    Replica.SCAN_CHILDREN_OF = [Node.ELEMENT_NODE, Node.TEXT_NODE];
    // Scan these types of nodes

    Replica.prototype = (function() {

        this.constructor = Replica;

        this.breaksSentence = function() {

            return (this.next && this.next.isText &&
                this.prev && this.prev.isText);

        };

        this.getContextBlock = function() {

            var i = 0,
                ancestors = this.ancestors,
                ancestorReplica;

            for(; i < ancestors.length; i++) {

                ancestorReplica = ancestors[i];

                if(ancestorReplica.isPartOf) return ancestorReplica.isPartOf;

            }

            return undefined;

        };

        this.includes = function(that) {

            return (this.hasIDfrom <= that.id) && (that.id <= this.hasIDto);

        };

        this.isBlank = function() {

            return (this.isText && !this.content);

        };

        this.merge = function(that, rawString) { // Merge two text replicas

            this.from      = this.from || that.from;
            this.to        = that.to || this.to;
            this.content   = rawString.substring(this.from, this.to);
            this.hasIDfrom = this.hasIDfrom || that.hasIDfrom;
            this.hasIDto   = that.hasIDto || this.hasIDto;
            that.parent.removeChild(that);

            return(this);

        };

        this.removeChild = function(childReplica) {

            this.splice(this.indexOf(childReplica), 1);
            childReplica.parent    = undefined;
            childReplica.ancestors = new MyArray([childReplica]);

            if(childReplica.prev) childReplica.prev.next = childReplica.next;

            if(childReplica.next) childReplica.next.prev = childReplica.prev;

            return childReplica;

        };

        this.stringifyStyle = function() {

            return Object.keys(this.style).sort().map(function(key) {

                return this.style[key];

            }, this).join(";");

        };

        this.toText = function(rawString) {

            var i = this.length - 1;

            this.name    = "#text";
            this.isText  = true;
            this.content = rawString.substring(this.from, this.to);

            for (; 0 <= i; i--) this.removeChild(this[i]);

            return this;

        };

        this.traverse = function(func) {

            var iterate_children = func(this),
                i;

            if(iterate_children) {

                for(i = this.length - 1; 0 <= i; i--) this[i].traverse(func);

            }

        };

        return this;

    }).apply(Object.create(MyArray.prototype) );

    this.Replica = Replica;

    function Block(nodeArray, heading) {

        var content = nodeArray.toRange(),
            contextBlock = nodeArray[0].getContextBlock();

        this.nodes = new Array();
        nodeArray.forEach(function(val) {this.nodes.push(val.node)}, this);
        this.x1 = Number.MAX_VALUE;
        this.y1 = Number.MAX_VALUE;
        this.x2 = 0;
        this.y2 = 0;

        this.nodes.forEach(function(node) {
            var rect = node.getBoundingClientRect ? node.getBoundingClientRect() : node.parentElement.getBoundingClientRect();
            var nodeTopLeft = cumulativeOffset(node);
            if (nodeTopLeft.left < this.x1) {
                this.x1 = nodeTopLeft.left;
            }
            if (nodeTopLeft.top < this.y1) {
                this.y1 = nodeTopLeft.top;
            }
            if (nodeTopLeft.left + rect.width > this.x2) {
                this.x2 = nodeTopLeft.left + rect.width;
            }
            if (nodeTopLeft.top + rect.height > this.y1) {
                this.y2 = nodeTopLeft.top + rect.height;
            }
        }, this);

        this.nodeArray = nodeArray;
        nodeArray.setEvery("isPartOf", this);
        this.contents = [content];
        this.children = [];

        if(heading) {

            this.nodes.push(heading.node);
            this.style    = heading.stringifyStyle();
            this.heading  = new MyArray([heading]).toRange();
            this.headings = [ [this.heading] ];
            heading.ancestors.setEvery("hasHeading", true);

        }

        if(contextBlock) contextBlock.children.push(this);

        return this;

    }

    Block.prototype = (function() {

        this.constructor = Block;

        this.includes = function(replica) {

            return this.nodeArray.some(function(part) {

                return part.includes(replica);

            });

        };

        return this;

    }).apply(Object.create(Object.prototype) );

    function preprocess(rootReplica, rawString) { // Section 4.1

        var breakingStyle = {};

        rootReplica.traverse(function(replica) {

            if(replica.isBlank() ) {

                replica.parent.removeChild(replica);

                return false;

            } else return true;

        });

        rootReplica.traverse(function(replica) {

            if(replica.breaksSentence() ) {

                breakingStyle[replica.stringifyStyle()] = replica.next.style;

            }

            return true;

        });

        rootReplica.traverse(function(replica) {

            var newStyle = breakingStyle[replica.stringifyStyle()],
                current;

            if(newStyle) {

                current = replica;
                current.toText(rawString);

                if(current.prev && current.prev.isText)
                    current = current.prev.merge(current, rawString);

                if(current.next && current.next.isText)
                    current.merge(current.next, rawString);

                current.style = newStyle;

                return false;

            } else return true;

        });

    }

    function classify(rootReplica) { // Section 4.2

        var styleHash = {};

        rootReplica.traverse(function(replica) {

            var style;

            if(replica.content) {

                style = replica.stringifyStyle();
                styleHash[style] = styleHash[style] || new MyArray();
                styleHash[style].unshift(replica);

            }

            return true;

        });

        return Object.keys(styleHash).map(function(key) {

            return styleHash[key];

        });

    }

    function sort(nodeLists) { // Section 4.3

        return nodeLists.sort(function(set0, set1) {

            var replica0   = set0[0],
                frontNode0 = set0.getFrontNodes()[0],
                replica1   = set1[0],
                frontNode1 = set1.getFrontNodes()[0];

            return (frontNode0.depth - frontNode1.depth) || // Block depth
                (replica1.style.fontSize - replica0.style.fontSize) ||
                (replica1.style.fontWeight - replica0.style.fontWeight) ||
                (replica0.id - replica1.id); // Document order

        });

    }

    function construct(rootReplica, sortedNodeLists) { // Section 4.4

        var rootBlock = new Block(new MyArray([rootReplica]) );

        function isEmpty(replica) {

            var content = replica.frontNode.nodeArray.toRange();

            return (replica.from <= content.from) &&
                (content.to <= replica.to);

        }

        function hasNoSiblingCandidate(replica0, dummy, nodeList) {

            var context = replica0.getContextBlock();

            return nodeList.every(function(replica1) {

                return !( (replica0 !== replica1) &&
                    (context === replica1.getContextBlock() ) );

            });

        }

        function isNonUnique(replica0, dummy, nodeList) {

            var content = replica0.content,
                context = replica0.getContextBlock();

            return nodeList.some(function(replica1) {

                return ( (replica0 !== replica1) &&
                    (content === replica1.content) &&
                    (context === replica1.getContextBlock() ) );

            });

        }

        function isTooMuch(t) {

            return(function(replica) {

                var content = replica.frontNode.nodeArray.toRange();

                return (content.to - content.from) <
                    t * (replica.to - replica.from);

            });

        }

        sortedNodeLists.forEach(function(nodeList) {

            var frontNodes = nodeList.getFrontNodes();

            frontNodes.calcNodeArrays();

            // Set-level filtering
            nodeList.isFilteredBy = "";

            if(0.1 <= frontNodes.calcRatio(MyArray.getGetter("hasHeading") ) )
                nodeList.isFilteredBy += "Including upper-level headings;";

            if(0.5 <= nodeList.calcRatio(isEmpty) )
                nodeList.isFilteredBy += "Producing empty block;";

            if(0.9 <= nodeList.calcRatio(hasNoSiblingCandidate) )
                nodeList.isFilteredBy += "No sibling candidates;";

            if(0.4 <= nodeList.calcRatio(isNonUnique) )
                nodeList.isFilteredBy += "Non-unique contents;";

            if(0.3 <= nodeList.calcRatio(isTooMuch(1.5) ) )
                nodeList.isFilteredBy += "Too much content as a heading;";

            if(nodeList.isFilteredBy) return;

            nodeList.filter(function(replica) { // Node-level filtering

                return(!(replica.frontNode.hasHeading || isEmpty(replica) ) );

            }).forEach(function(replica) {

                new Block(replica.frontNode.nodeArray, replica);

            });

        });

        return rootBlock;

    }

    this.rootReplica = new Replica(ROOT); // Construct Virtual DOM
    preprocess(this.rootReplica, this.rootReplica.rawString);
    this.nodeLists   = classify(this.rootReplica);
    this.nodeLists   = sort(this.nodeLists);
    this.rootBlock   = construct(this.rootReplica, this.nodeLists);

    if(this.rootReplica.pageHeadingRange)
        this.rootBlock.headings = [ [this.rootReplica.pageHeadingRange] ];

    this.rootBlock.rawString = this.rootReplica.rawString;

    /*let paths = [];
    this.rootReplica.traverse(function(that) {paths.push(getPathTo(that.node)); return true;});
    paths.forEach(function(val) {console.log(document.evaluate(val, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue === undefined);});*/

    if(EXTRACT_URL) {

        this.rootBlock.URL = ROOT.ownerDocument.location.href;
        this.rootBlock.baseURL = ROOT.baseURI;

    }

    function assembleSegments(block, segmentations) {
        if (block.x1 < window.innerWidth && block.y1 < window.innerHeight
            && block.x2 > block.x1 && block.y2 > block.y1) {
            var multiPolygonSet = new Array();
            var multiPolygon = new Array();
            var polygon = new Array();
            var start = new Array(Math.round(block.x1), Math.round(block.y1));
            polygon.push(start);
            polygon.push(new Array(Math.round(block.x1), Math.round((block.y2 < window.innerHeight ? block.y2 : window.innerHeight))));
            polygon.push(new Array(Math.round((block.x2 < window.innerWidth ? block.x2 : window.innerWidth)), Math.round((block.y2 < window.innerHeight ? block.y2 : window.innerHeight))));
            polygon.push(new Array(Math.round((block.x2 < window.innerWidth ? block.x2 : window.innerWidth)), block.y1));
            polygon.push(start);
            multiPolygon.push(polygon);
            multiPolygonSet.push(multiPolygon);
            segmentations.push(multiPolygonSet);
        }

        for (var _i = 0, _a = block.children; _i < _a.length; _i++) {
            var child = _a[_i];
            assembleSegments(child, segmentations);
        }
    };

    var segmentations = new Array();
    assembleSegments(this.rootBlock, segmentations);

    /*this.json = JSON.stringify(this.rootBlock, ["from", "to", "mandatory", "style",
        "headings", "contents", "children", "rawString", "URL", "baseURL"], "  ");*/

    if (!JSON.stringify) {
        /*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
        (function(){function N(p,r){function q(a){if(q[a]!==w)return q[a];var c;if("bug-string-char-index"==a)c="a"!="a"[0];else if("json"==a)c=q("json-stringify")&&q("json-parse");else{var e;if("json-stringify"==a){c=r.stringify;var b="function"==typeof c&&s;if(b){(e=function(){return 1}).toJSON=e;try{b="0"===c(0)&&"0"===c(new t)&&'""'==c(new A)&&c(u)===w&&c(w)===w&&c()===w&&"1"===c(e)&&"[1]"==c([e])&&"[null]"==c([w])&&"null"==c(null)&&"[null,null,null]"==c([w,u,null])&&'{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'==
            c({a:[e,!0,!1,null,"\x00\b\n\f\r\t"]})&&"1"===c(null,e)&&"[\n 1,\n 2\n]"==c([1,2],null,1)&&'"-271821-04-20T00:00:00.000Z"'==c(new C(-864E13))&&'"+275760-09-13T00:00:00.000Z"'==c(new C(864E13))&&'"-000001-01-01T00:00:00.000Z"'==c(new C(-621987552E5))&&'"1969-12-31T23:59:59.999Z"'==c(new C(-1))}catch(f){b=!1}}c=b}if("json-parse"==a){c=r.parse;if("function"==typeof c)try{if(0===c("0")&&!c(!1)){e=c('{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}');var n=5==e.a.length&&1===e.a[0];if(n){try{n=!c('"\t"')}catch(d){}if(n)try{n=
            1!==c("01")}catch(g){}if(n)try{n=1!==c("1.")}catch(m){}}}}catch(X){n=!1}c=n}}return q[a]=!!c}p||(p=k.Object());r||(r=k.Object());var t=p.Number||k.Number,A=p.String||k.String,H=p.Object||k.Object,C=p.Date||k.Date,G=p.SyntaxError||k.SyntaxError,K=p.TypeError||k.TypeError,L=p.Math||k.Math,I=p.JSON||k.JSON;"object"==typeof I&&I&&(r.stringify=I.stringify,r.parse=I.parse);var H=H.prototype,u=H.toString,v,B,w,s=new C(-0xc782b5b800cec);try{s=-109252==s.getUTCFullYear()&&0===s.getUTCMonth()&&1===s.getUTCDate()&&
            10==s.getUTCHours()&&37==s.getUTCMinutes()&&6==s.getUTCSeconds()&&708==s.getUTCMilliseconds()}catch(Q){}if(!q("json")){var D=q("bug-string-char-index");if(!s)var x=L.floor,M=[0,31,59,90,120,151,181,212,243,273,304,334],E=function(a,c){return M[c]+365*(a-1970)+x((a-1969+(c=+(1<c)))/4)-x((a-1901+c)/100)+x((a-1601+c)/400)};(v=H.hasOwnProperty)||(v=function(a){var c={},e;(c.__proto__=null,c.__proto__={toString:1},c).toString!=u?v=function(a){var c=this.__proto__;a=a in(this.__proto__=null,this);this.__proto__=
            c;return a}:(e=c.constructor,v=function(a){var c=(this.constructor||e).prototype;return a in this&&!(a in c&&this[a]===c[a])});c=null;return v.call(this,a)});B=function(a,c){var e=0,b,f,n;(b=function(){this.valueOf=0}).prototype.valueOf=0;f=new b;for(n in f)v.call(f,n)&&e++;b=f=null;e?B=2==e?function(a,c){var e={},b="[object Function]"==u.call(a),f;for(f in a)b&&"prototype"==f||v.call(e,f)||!(e[f]=1)||!v.call(a,f)||c(f)}:function(a,c){var e="[object Function]"==u.call(a),b,f;for(b in a)e&&"prototype"==
        b||!v.call(a,b)||(f="constructor"===b)||c(b);(f||v.call(a,b="constructor"))&&c(b)}:(f="valueOf toString toLocaleString propertyIsEnumerable isPrototypeOf hasOwnProperty constructor".split(" "),B=function(a,c){var e="[object Function]"==u.call(a),b,h=!e&&"function"!=typeof a.constructor&&F[typeof a.hasOwnProperty]&&a.hasOwnProperty||v;for(b in a)e&&"prototype"==b||!h.call(a,b)||c(b);for(e=f.length;b=f[--e];h.call(a,b)&&c(b));});return B(a,c)};if(!q("json-stringify")){var U={92:"\\\\",34:'\\"',8:"\\b",
            12:"\\f",10:"\\n",13:"\\r",9:"\\t"},y=function(a,c){return("000000"+(c||0)).slice(-a)},R=function(a){for(var c='"',b=0,h=a.length,f=!D||10<h,n=f&&(D?a.split(""):a);b<h;b++){var d=a.charCodeAt(b);switch(d){case 8:case 9:case 10:case 12:case 13:case 34:case 92:c+=U[d];break;default:if(32>d){c+="\\u00"+y(2,d.toString(16));break}c+=f?n[b]:a.charAt(b)}}return c+'"'},O=function(a,c,b,h,f,n,d){var g,m,k,l,p,r,s,t,q;try{g=c[a]}catch(z){}if("object"==typeof g&&g)if(m=u.call(g),"[object Date]"!=m||v.call(g,
            "toJSON"))"function"==typeof g.toJSON&&("[object Number]"!=m&&"[object String]"!=m&&"[object Array]"!=m||v.call(g,"toJSON"))&&(g=g.toJSON(a));else if(g>-1/0&&g<1/0){if(E){l=x(g/864E5);for(m=x(l/365.2425)+1970-1;E(m+1,0)<=l;m++);for(k=x((l-E(m,0))/30.42);E(m,k+1)<=l;k++);l=1+l-E(m,k);p=(g%864E5+864E5)%864E5;r=x(p/36E5)%24;s=x(p/6E4)%60;t=x(p/1E3)%60;p%=1E3}else m=g.getUTCFullYear(),k=g.getUTCMonth(),l=g.getUTCDate(),r=g.getUTCHours(),s=g.getUTCMinutes(),t=g.getUTCSeconds(),p=g.getUTCMilliseconds();
            g=(0>=m||1E4<=m?(0>m?"-":"+")+y(6,0>m?-m:m):y(4,m))+"-"+y(2,k+1)+"-"+y(2,l)+"T"+y(2,r)+":"+y(2,s)+":"+y(2,t)+"."+y(3,p)+"Z"}else g=null;b&&(g=b.call(c,a,g));if(null===g)return"null";m=u.call(g);if("[object Boolean]"==m)return""+g;if("[object Number]"==m)return g>-1/0&&g<1/0?""+g:"null";if("[object String]"==m)return R(""+g);if("object"==typeof g){for(a=d.length;a--;)if(d[a]===g)throw K();d.push(g);q=[];c=n;n+=f;if("[object Array]"==m){k=0;for(a=g.length;k<a;k++)m=O(k,g,b,h,f,n,d),q.push(m===w?"null":
            m);a=q.length?f?"[\n"+n+q.join(",\n"+n)+"\n"+c+"]":"["+q.join(",")+"]":"[]"}else B(h||g,function(a){var c=O(a,g,b,h,f,n,d);c!==w&&q.push(R(a)+":"+(f?" ":"")+c)}),a=q.length?f?"{\n"+n+q.join(",\n"+n)+"\n"+c+"}":"{"+q.join(",")+"}":"{}";d.pop();return a}};r.stringify=function(a,c,b){var h,f,n,d;if(F[typeof c]&&c)if("[object Function]"==(d=u.call(c)))f=c;else if("[object Array]"==d){n={};for(var g=0,k=c.length,l;g<k;l=c[g++],(d=u.call(l),"[object String]"==d||"[object Number]"==d)&&(n[l]=1));}if(b)if("[object Number]"==
            (d=u.call(b))){if(0<(b-=b%1))for(h="",10<b&&(b=10);h.length<b;h+=" ");}else"[object String]"==d&&(h=10>=b.length?b:b.slice(0,10));return O("",(l={},l[""]=a,l),f,n,h,"",[])}}if(!q("json-parse")){var V=A.fromCharCode,W={92:"\\",34:'"',47:"/",98:"\b",116:"\t",110:"\n",102:"\f",114:"\r"},b,J,l=function(){b=J=null;throw G();},z=function(){for(var a=J,c=a.length,e,h,f,k,d;b<c;)switch(d=a.charCodeAt(b),d){case 9:case 10:case 13:case 32:b++;break;case 123:case 125:case 91:case 93:case 58:case 44:return e=
            D?a.charAt(b):a[b],b++,e;case 34:e="@";for(b++;b<c;)if(d=a.charCodeAt(b),32>d)l();else if(92==d)switch(d=a.charCodeAt(++b),d){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114:e+=W[d];b++;break;case 117:h=++b;for(f=b+4;b<f;b++)d=a.charCodeAt(b),48<=d&&57>=d||97<=d&&102>=d||65<=d&&70>=d||l();e+=V("0x"+a.slice(h,b));break;default:l()}else{if(34==d)break;d=a.charCodeAt(b);for(h=b;32<=d&&92!=d&&34!=d;)d=a.charCodeAt(++b);e+=a.slice(h,b)}if(34==a.charCodeAt(b))return b++,e;l();default:h=
            b;45==d&&(k=!0,d=a.charCodeAt(++b));if(48<=d&&57>=d){for(48==d&&(d=a.charCodeAt(b+1),48<=d&&57>=d)&&l();b<c&&(d=a.charCodeAt(b),48<=d&&57>=d);b++);if(46==a.charCodeAt(b)){for(f=++b;f<c&&(d=a.charCodeAt(f),48<=d&&57>=d);f++);f==b&&l();b=f}d=a.charCodeAt(b);if(101==d||69==d){d=a.charCodeAt(++b);43!=d&&45!=d||b++;for(f=b;f<c&&(d=a.charCodeAt(f),48<=d&&57>=d);f++);f==b&&l();b=f}return+a.slice(h,b)}k&&l();if("true"==a.slice(b,b+4))return b+=4,!0;if("false"==a.slice(b,b+5))return b+=5,!1;if("null"==a.slice(b,
            b+4))return b+=4,null;l()}return"$"},P=function(a){var c,b;"$"==a&&l();if("string"==typeof a){if("@"==(D?a.charAt(0):a[0]))return a.slice(1);if("["==a){for(c=[];;b||(b=!0)){a=z();if("]"==a)break;b&&(","==a?(a=z(),"]"==a&&l()):l());","==a&&l();c.push(P(a))}return c}if("{"==a){for(c={};;b||(b=!0)){a=z();if("}"==a)break;b&&(","==a?(a=z(),"}"==a&&l()):l());","!=a&&"string"==typeof a&&"@"==(D?a.charAt(0):a[0])&&":"==z()||l();c[a.slice(1)]=P(z())}return c}l()}return a},T=function(a,b,e){e=S(a,b,e);e===
        w?delete a[b]:a[b]=e},S=function(a,b,e){var h=a[b],f;if("object"==typeof h&&h)if("[object Array]"==u.call(h))for(f=h.length;f--;)T(h,f,e);else B(h,function(a){T(h,a,e)});return e.call(a,b,h)};r.parse=function(a,c){var e,h;b=0;J=""+a;e=P(z());"$"!=z()&&l();b=J=null;return c&&"[object Function]"==u.call(c)?S((h={},h[""]=e,h),"",c):e}}}r.runInContext=N;return r}var K=typeof define==="function"&&define.amd,F={"function":!0,object:!0},G=F[typeof exports]&&exports&&!exports.nodeType&&exports,k=F[typeof window]&&
            window||this,t=G&&F[typeof module]&&module&&!module.nodeType&&"object"==typeof global&&global;!t||t.global!==t&&t.window!==t&&t.self!==t||(k=t);if(G&&!K)N(k,G);else{var L=k.JSON,Q=k.JSON3,M=!1,A=N(k,k.JSON3={noConflict:function(){M||(M=!0,k.JSON=L,k.JSON3=Q,L=Q=null);return A}});k.JSON={parse:A.parse,stringify:A.stringify}}K&&define(function(){return A})}).call(this);
    }

    this.json = JSON.stringify({"id": "TBFWID", "height": window.innerHeight, "width": window.innerWidth, "segmentations": {"heps": segmentations}});

    if(typeof window.testHEPS == "function") {
        this.test_status = window.testHEPS(this);
    } else {
        if (console.log) {
            console.log("HEPS: Complete.");
        }
    }

};

function getPathTo(element) {
    if (element.tagName == 'HTML')
        return '/HTML[1]';
    if (element===document.body)
        return '/HTML[1]/BODY[1]';
    if (element.tagName == undefined) {
        return getPathTo(element.parentNode);
    } else {
        var ix= 0;
        var siblings= element.parentNode.childNodes;
        for (var i= 0; i<siblings.length; i++) {
            var sibling= siblings[i];
            if (sibling===element)
                return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
            if (sibling.nodeType===1 && sibling.tagName===element.tagName)
                ix++;
        }
    }
};

function cumulativeOffset(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

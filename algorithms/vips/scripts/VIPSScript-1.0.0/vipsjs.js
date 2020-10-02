/**
 * Based on CSSBox' "Box" class with minimal set of features to support VIPS.
 */
var Box = /** @class */ (function () {
    function Box(node) {
        this.node = node;
        this.rootelem = false;
        if (this.node.nodeType === Node.ELEMENT_NODE) {
            this.isblock = window.getComputedStyle(this.node).getPropertyValue("display") === "block";
        }
        else {
            this.isblock = false;
        }
        this.displayed = true;
        this.visible = true;
        this.splitted = false;
    }
    Box.prototype.getNode = function () {
        return this.node;
    };
    Box.prototype.isRootElement = function () {
        return this.rootelem;
    };
    Box.prototype.isBlock = function () {
        return this.isblock;
    };
    Box.prototype.isDisplayed = function () {
        return this.displayed;
    };
    Box.prototype.isVisible = function () {
        return this.visible;
    };
    Box.prototype.makeRoot = function () {
        this.rootelem = true;
    };
    return Box;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
///<reference path="Box.ts"/>
/**
 * Based on CSSBox' "ElementBox" class with minimal set of features to support VIPS.
 */
var ElementBox = /** @class */ (function (_super) {
    __extends(ElementBox, _super);
    function ElementBox(n) {
        var _this = _super.call(this, n) || this;
        if (n != null) {
            _this.el = n;
            _this.nested = _this.getVisibleElementBoxNested(n);
            // the body contains all text nodes as children, but we want to keep the hierarchy, so only parse text boxes for non-body elements
            if (n.nodeName.toLowerCase() != "body") {
                _this.getTextBoxNested(n);
            }
            var elem = _this.el;
            // https://stackoverflow.com/a/33456469
            _this.visible = !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
            _this.startChild = 0;
            _this.endChild = _this.nested.length;
        }
        return _this;
    }
    ElementBox.prototype.getVisibleElementBoxNested = function (n) {
        var ret = new Array();
        var rec;
        for (var i = 0; i < n.childNodes.length; i++) {
            var child = n.childNodes.item(i);
            if (child.nodeType === Node.ELEMENT_NODE) {
                var el = child;
                // https://stackoverflow.com/a/33456469
                if (!!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)) {
                    ret.push(new ElementBox(child));
                }
            }
        }
        if (ret.length === 0) { // only go deeper if we didn't find a visible box yet
            for (var j = 0; j < n.childNodes.length; j++) {
                var child = n.childNodes.item(j);
                rec = this.getVisibleElementBoxNested(child);
                while (rec.length > 0) {
                    ret.push(rec.pop());
                }
            }
        }
        return ret;
    };
    ElementBox.prototype.getTextBoxNested = function (n) {
        for (var i = 0; i < n.childNodes.length; i++) {
            var element = n.childNodes.item(i);
            if (element.nodeType === Node.TEXT_NODE) {
                this.nested.push(new TextBox(element));
            }
        }
    };
    ElementBox.prototype.getText = function () {
        var ret = "";
        for (var i = this.startChild; i < this.endChild; ++i) {
            ret = ret.concat(this.getSubBox(i).getText());
        }
        return ret;
    };
    ElementBox.prototype.getElement = function () {
        return this.el;
    };
    ElementBox.prototype.getSubBox = function (index) {
        return this.nested[index];
    };
    ElementBox.prototype.getSubBoxList = function () {
        return this.nested;
    };
    return ElementBox;
}(Box));
/**
 * Simple Point class.
 */
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    return Point;
}());
///<reference path="Point.ts"/>
/**
 * Class that represents visual separator.
 *
 * @author Tomas Popela
 * @author Lars Meyer
 */
var Separator = /** @class */ (function () {
    function Separator(start, end, weight, leftUpX, leftUpY, rightDownX, rightDownY) {
        this.startPoint = 0;
        this.endPoint = 0;
        this.weight = 3;
        this.normalizedWeight = 0;
        if (typeof start === 'undefined' || typeof end === 'undefined') {
            if (!(typeof leftUpX === 'undefined' || typeof leftUpY === 'undefined' || typeof rightDownX === 'undefined' || typeof rightDownY === 'undefined')) {
                this.leftUp = new Point(leftUpX, leftUpY);
                this.rightDown = new Point(rightDownX, rightDownY);
                this.startPoint = leftUpX;
                this.endPoint = rightDownY;
            }
        }
        else {
            this.startPoint = start;
            this.endPoint = end;
        }
        if (!(typeof weight === 'undefined')) {
            this.weight = weight;
        }
    }
    Separator.prototype.setLeftUp = function (leftUpX, leftUpY) {
        this.leftUp = new Point(leftUpX, leftUpY);
    };
    Separator.prototype.setRightDown = function (rightDownX, rightDownY) {
        this.rightDown = new Point(rightDownX, rightDownY);
    };
    Separator.prototype.compareTo = function (otherSeparator) {
        return this.weight - otherSeparator.weight;
    };
    return Separator;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
///<reference path="Box.ts"/>
/**
 * Based on CSSBox' "TextBox" class with minimal set of features to support VIPS.
 */
var TextBox = /** @class */ (function (_super) {
    __extends(TextBox, _super);
    function TextBox(n) {
        var _this = _super.call(this, n) || this;
        _this.textNode = n;
        _this.transform = "none";
        _this.setWhiteSpace("normal");
        _this.collapsews = true;
        return _this;
    }
    TextBox.prototype.getText = function () {
        return this.text != null ? this.text.substring(this.textStart, this.textEnd) : "";
    };
    TextBox.prototype.setWhiteSpace = function (value) {
        this.splitws = value === "normal" || value === "pre-wrap" || value === "pre-line";
        this.collapsews = value === "normal" || value === "nowrap" || value === "pre-line";
        this.linews = value === "normal" || value === "nowrap";
        if (!this.splitted) {
            this.applyWhiteSpace();
        }
        // TODO: implement computeLineLengths() and computeMinimalWidth() as well as computeMaximalWidth()
    };
    TextBox.prototype.applyWhiteSpace = function () {
        this.text = this.applyTransformations(this.collapseWhitespaces(this.node.nodeValue));
        this.textStart = 0;
        this.textEnd = this.text.length;
        this.isempty = this.textEnd === 0;
    };
    TextBox.prototype.collapseWhitespaces = function (src) {
        var ret = "";
        var inws = false;
        for (var i = 0; i < src.length; ++i) {
            var ch = src.charAt(i);
            if (this.collapsews && /\s/.test(ch)) {
                if (!inws) {
                    ret = ret.concat(' ');
                    inws = true;
                }
            }
            else if (this.isLineBreak(ch)) {
                ret = ret.concat('\r');
                if (ch === '\r' && i + 1 < src.length && src.charAt(i + 1) === '\n') {
                    ++i;
                }
            }
            else {
                inws = false;
                ret = ret.concat(ch);
            }
        }
        return ret;
    };
    TextBox.prototype.applyTransformations = function (src) {
        switch (this.transform) {
            case "lowercase":
                return src.toLowerCase();
            case "uppercase":
                return src.toUpperCase();
            case "capitalize":
                var ret = "";
                var ws = true;
                for (var i = 0; i < src.length; ++i) {
                    var ch = src.charAt(i);
                    if (/\s/.test(ch)) {
                        ws = true;
                    }
                    else {
                        if (ws) {
                            ch = ch.toUpperCase();
                        }
                        ws = false;
                    }
                    ret.concat(ch);
                }
                return ret;
            default:
                return src;
        }
    };
    TextBox.prototype.isWhitespace = function (ch) {
        if (this.linews) {
            return /\s/.test(ch) && (!(ch === '\r' || ch === '\n'));
        }
        else {
            return /\s/.test(ch);
        }
    };
    TextBox.prototype.isLineBreak = function (ch) {
        if (this.linews) {
            return false;
        }
        else {
            return ch === '\r' || ch === '\n';
        }
    };
    return TextBox;
}(Box));
///<reference path="VipsParser.ts"/>
///<reference path="VisualStructureConstructor.ts"/>
///<reference path="VipsOutput.ts"/>
/**
 * Vision-based Page Segmentation algorithm
 *
 * @author Tomas Popela
 * @author Lars Meyer
 */
var Vips = /** @class */ (function () {
    function Vips(filename) {
        this._pDoC = 11;
        this._filename = "";
        this.sizeThresholdWidth = 350;
        this.sizeThresholdHeight = 400;
        this._filename = filename;
    }
    /**
     * Sets permitted degree of coherence (pDoC) value.
     * @param value pDoC value.
     */
    Vips.prototype.setPredefinedDoC = function (value) {
        if (value <= 0 || value > 11) {
            console.error("pDoC value must be between 1 and 11! Not " + value + "!");
            return;
        }
        else {
            this._pDoC = value;
        }
    };
    Vips.prototype.setOutputFileName = function (filename) {
        if (!(filename === "")) {
            this._filename = filename;
        }
        else {
            console.log("Invalid filename!");
        }
    };
    /**
     * Performs page segmentation.
     */
    Vips.prototype.performSegmentation = function () {
        try {
            var numberOfIterations = 10;
            var pageWidth = window.innerWidth;
            var pageHeight = window.innerHeight;
            var vipsParser = new VipsParser();
            var constructor = new VisualStructureConstructor(undefined, this._pDoC);
            for (var iterationNumber = 1; iterationNumber < numberOfIterations + 1; iterationNumber++) {
                //visual blocks detection
                vipsParser.setSizeThresholdHeight(this.sizeThresholdHeight);
                vipsParser.setSizeThresholdWidth(this.sizeThresholdWidth);
                vipsParser.parse();
                var vipsBlocks = vipsParser.getVipsBlocks();
                if (iterationNumber === 1) {
                    // visual structure construction
                    constructor.setVipsBlocks(vipsBlocks);
                    constructor.setPageSize(pageWidth, pageHeight);
                }
                else {
                    vipsBlocks = vipsParser.getVipsBlocks();
                    constructor.updateVipsBlocks(vipsBlocks);
                }
                // visual structure construction
                constructor.constructVisualStructure();
                // prepare thresholds for next iteration
                if (iterationNumber <= 5) {
                    this.sizeThresholdHeight -= 50;
                    this.sizeThresholdWidth -= 50;
                }
                if (iterationNumber == 6) {
                    this.sizeThresholdHeight = 100;
                    this.sizeThresholdWidth = 100;
                }
                if (iterationNumber == 7) {
                    this.sizeThresholdHeight = 80;
                    this.sizeThresholdWidth = 80;
                }
                if (iterationNumber == 8) {
                    this.sizeThresholdHeight = 40;
                    this.sizeThresholdWidth = 10;
                }
                if (iterationNumber == 9) {
                    this.sizeThresholdHeight = 1;
                    this.sizeThresholdWidth = 1;
                }
            }
            constructor.normalizeSeparatorsMinMax();
            var vipsOutput = new VipsOutput(this._filename, this._pDoC);
            return vipsOutput.writeJSON(constructor.getVisualStructure());
        }
        catch (Error) {
            console.error("Something's wrong!");
            console.error(Error.message);
            console.error(Error.stack);
        }
    };
    return Vips;
}());
///<reference path="Box.ts"/>
///<reference path="ElementBox.ts"/>
///<reference path="TextBox.ts"/>
/**
 * Class that represents block on page.
 *
 * @author Tomas Popela
 * @author Lars Meyer
 */
var VipsBlock = /** @class */ (function () {
    function VipsBlock(id, node) {
        // rendered Box that corresponds to DOM element
        this._box = null;
        // children of this node
        this._children = null;
        // node id
        this._id = 0;
        // node's Degree of Coherence
        this._DoC = 0;
        // number of images in node
        this._containImg = 0;
        // if node is image
        this._isImg = false;
        // if node is visual block
        this._isVisualBlock = false;
        // if node contains table
        this._containTable = false;
        // number of paragraphs in node
        this._containP = 0;
        // if node was already divided
        this._alreadyDivided = false;
        // if node can be divided
        this._isDividable = true;
        this._bgColor = null;
        this._sourceIndex = 0;
        this._tmpSrcIndex = 0;
        // length of text in node
        this._textLen = 0;
        // length of text in links in node
        this._linkTextLen = 0;
        this._children = new Array();
        if (!(typeof id === 'undefined')) {
            this.setId(id);
        }
        if (!(typeof node === 'undefined')) {
            this.addChild(node);
        }
    }
    /**
     * Sets block as visual block
     * @param isVisualBlock Value
     */
    VipsBlock.prototype.setIsVisualBlock = function (isVisualBlock) {
        this._isVisualBlock = isVisualBlock;
        this.checkProperties();
    };
    /**
     * Checks if block is visual block
     * @return True if block is visual block, otherwise false
     */
    VipsBlock.prototype.isVisualBlock = function () {
        return this._isVisualBlock;
    };
    /**
     * Checks the properties of visual block
     */
    VipsBlock.prototype.checkProperties = function () {
        this.checkIsImg();
        this.checkContainImg(this);
        this.checkContainTable(this);
        this.checkContainP(this);
        this._linkTextLen = 0;
        this._textLen = 0;
        this.countTextLength(this);
        this.countLinkTextLength(this);
        this.setSourceIndex(this.getBox().getNode().ownerDocument);
    };
    /**
     * Checks if visual block is an image.
     */
    VipsBlock.prototype.checkIsImg = function () {
        this._isImg = (this._box.getNode().nodeName.toLowerCase() === "img");
    };
    /**
     * Checks if visual block contains image.
     * @param vipsBlock Visual block
     */
    VipsBlock.prototype.checkContainImg = function (vipsBlock) {
        if (vipsBlock.getBox().getNode().nodeName.toLowerCase() === "img") {
            vipsBlock._isImg = true;
            this._containImg++;
        }
        for (var _i = 0, _a = vipsBlock.getChildren(); _i < _a.length; _i++) {
            var childVipsBlock = _a[_i];
            this.checkContainImg(childVipsBlock);
        }
    };
    /**
     * Checks if visual block contains table.
     * @param vipsBlock Visual block
     */
    VipsBlock.prototype.checkContainTable = function (vipsBlock) {
        if (vipsBlock.getBox().getNode().nodeName.toLowerCase() === "table") {
            this._containTable = true;
        }
        for (var _i = 0, _a = vipsBlock.getChildren(); _i < _a.length; _i++) {
            var childVipsBlock = _a[_i];
            this.checkContainTable(childVipsBlock);
        }
    };
    /**
     * Checks number of paragraphs in visual block.
     * @param vipsBlock Visual block
     */
    VipsBlock.prototype.checkContainP = function (vipsBlock) {
        if (vipsBlock.getBox().getNode().nodeName.toLowerCase() === "p") {
            this._containP++;
        }
        for (var _i = 0, _a = vipsBlock.getChildren(); _i < _a.length; _i++) {
            var childVipsBlock = _a[_i];
            this.checkContainP(childVipsBlock);
        }
    };
    /**
     * Counts length of text in links in visual block
     * @param vipsBlock Visual block
     */
    VipsBlock.prototype.countLinkTextLength = function (vipsBlock) {
        if (vipsBlock.getBox().getNode().nodeName.toLowerCase() === "a") {
            this._linkTextLen += vipsBlock.getBox().getText().length;
        }
        for (var _i = 0, _a = vipsBlock.getChildren(); _i < _a.length; _i++) {
            var childVipsBlock = _a[_i];
            this.countLinkTextLength(childVipsBlock);
        }
    };
    /**
     * Counts length of text in visual block
     * @param vipsBlock Visual block
     */
    VipsBlock.prototype.countTextLength = function (vipsBlock) {
        this._textLen = vipsBlock.getBox().getText().replace("\n", "").length;
    };
    /**
     * Adds new child to blocks' children
     * @param child New child
     */
    VipsBlock.prototype.addChild = function (child) {
        this._children.push(child);
    };
    /**
     * Gets all blocks' children
     * @return List of children
     */
    VipsBlock.prototype.getChildren = function () {
        return this._children;
    };
    /**
     * Sets block's corresponding Box
     * @param box Box
     */
    VipsBlock.prototype.setBox = function (box) {
        this._box = box;
    };
    /**
     * Gets Box corresponding to the block
     * @return Box
     */
    VipsBlock.prototype.getBox = function () {
        return this._box;
    };
    /**
     * Gets ElementBox corresponding to the block
     * @return ElementBox
     */
    VipsBlock.prototype.getElementBox = function () {
        if (this._box instanceof ElementBox) {
            return this._box;
        }
        else {
            return null;
        }
    };
    /**
     * Sets block's id
     * @param id Id
     */
    VipsBlock.prototype.setId = function (id) {
        this._id = id;
    };
    /**
     * Returns block's degree of coherence DoC
     * @return Degree of coherence
     */
    VipsBlock.prototype.getDoC = function () {
        return this._DoC;
    };
    /**
     * Sets block's degree of coherence
     * @param doC Degree of coherence
     */
    VipsBlock.prototype.setDoC = function (doC) {
        this._DoC = doC;
    };
    /**
     * Checks if block is dividable
     * @return True if dividable, otherwise false
     */
    VipsBlock.prototype.isDividable = function () {
        return this._isDividable;
    };
    /**
     * Sets dividability of block
     * @param isDividable True if dividable, otherwise false
     */
    VipsBlock.prototype.setIsDividable = function (isDividable) {
        this._isDividable = isDividable;
    };
    /**
     * Checks if node was already divided
     * @return True if block was divided, otherwise false
     */
    VipsBlock.prototype.isAlreadyDivided = function () {
        return this._alreadyDivided;
    };
    /**
     * Sets if block was divided
     * @param alreadyDivided True if block was divided, otherwise false
     */
    VipsBlock.prototype.setAlreadyDivided = function (alreadyDivided) {
        this._alreadyDivided = alreadyDivided;
    };
    /**
     * Finds background color of element
     * @param element Element
     */
    VipsBlock.prototype.findBgColor = function (element) {
        var backgroundColor = element.getAttribute("background-color");
        if (backgroundColor.length === 0) {
            if (element.parentNode != null && !(element.tagName === "body")) {
                this.findBgColor(element.parentNode);
            }
            else {
                this._bgColor = "#ffffff";
                return;
            }
        }
        else {
            this._bgColor = backgroundColor;
            return;
        }
    };
    /**
     * Gets background color of element
     * @return Background color
     */
    VipsBlock.prototype.getBgColor = function () {
        if (this._bgColor != null) {
            return this._bgColor;
        }
        if (this.getBox() instanceof TextBox) {
            this._bgColor = "#ffffff";
        }
        else {
            this._bgColor = window.getComputedStyle(this.getElementBox().getElement()).getPropertyValue("background-color");
        }
        if (this._bgColor.length === 0) {
            this.findBgColor(this.getElementBox().getElement());
        }
        return this._bgColor;
    };
    /**
     * Sets source index of block
     * @param node Node
     */
    VipsBlock.prototype.setSourceIndex = function (node) {
        if (!(this.getBox().getNode() == node)) {
            this._tmpSrcIndex++;
        }
        else {
            this._sourceIndex = this._tmpSrcIndex;
        }
        for (var i = 0; i < node.childNodes.length; i++) {
            this.setSourceIndex(node.childNodes[i]);
        }
    };
    return VipsBlock;
}());
///<reference path="VisualStructure.ts"/>
/**
 * Class that handles JSON output of VIPS algorithm
 *
 * @author Lars Meyer
 * @author Tomas Popela
 */
var VipsOutput = /** @class */ (function () {
    function VipsOutput(id, pDoC) {
        this._pDoC = 0;
        this._id = id;
        this.setPDoC(pDoC);
    }
    VipsOutput.prototype.writeVisualJSONBlocks = function (segmentations, visualStructure) {
        var multiPolygonSet = new Array();
        var multiPolygon = new Array();
        var polygon = new Array();
        var start = new Array(Math.round(visualStructure.getX()), Math.round(visualStructure.getY()));
        polygon.push(start);
        polygon.push(new Array(Math.round(visualStructure.getX()), Math.round(visualStructure.getY() + visualStructure.getHeight())));
        polygon.push(new Array(Math.round(visualStructure.getX() + visualStructure.getWidth()), Math.round(visualStructure.getY() + visualStructure.getHeight())));
        polygon.push(new Array(Math.round(visualStructure.getX() + visualStructure.getWidth()), Math.round(visualStructure.getY())));
        polygon.push(start);
        multiPolygon.push(polygon);
        multiPolygonSet.push(multiPolygon);
        segmentations.push(multiPolygonSet);
        if (this._pDoC >= visualStructure.getDoC()) {
            // continue segmenting
            for (var _i = 0, _a = visualStructure.getChildrenVisualStructures(); _i < _a.length; _i++) {
                var child = _a[_i];
                this.writeVisualJSONBlocks(segmentations, child);
            }
        } // else "stop" segmentation
    };
    VipsOutput.prototype.writeJSON = function (visualStructure) {
        var boxes = new Array();
        for (var _i = 0, _a = visualStructure.getChildrenVisualStructures(); _i < _a.length; _i++) {
            var child = _a[_i];
            this.writeVisualJSONBlocks(boxes, child);
        }
        return JSON.stringify({ "id": this._id, "height": window.innerHeight, "width": window.innerWidth, "segmentations": { "vips": boxes } });
    };
    /**
     * Sets permitted degree of coherence pDoC
     * @param pDoC pDoC value
     */
    VipsOutput.prototype.setPDoC = function (pDoC) {
        if (pDoC <= 0 || pDoC > 11) {
            console.error("pDoC value must be between 1 and 11! Not " + pDoC + "!");
            return;
        }
        else {
            this._pDoC = pDoC;
        }
    };
    return VipsOutput;
}());
///<reference path="VipsBlock.ts"/>
/**
 * Class that parses blocks on page and finds visual blocks.
 * @author Tomas Popela
 * @author Lars Meyer
 */
var VipsParser = /** @class */ (function () {
    /**
     * Default constructor
     */
    function VipsParser() {
        this._vipsBlocks = null;
        this._currentVipsBlock = null;
        this._tempVipsBlock = null;
        this._sizeThresholdWidth = 0;
        this._sizeThresholdHeight = 0;
        this._visualBlocksCount = 0;
        this._pageWidth = 0;
        this._pageHeight = 0;
        this._cnt = 0;
        this._vipsBlocks = new VipsBlock();
        this._sizeThresholdHeight = 80;
        this._sizeThresholdWidth = 80;
        this._pageWidth = window.innerWidth;
        this._pageHeight = window.innerHeight;
    }
    /**
     * Starts visual page segmentation on given page
     */
    VipsParser.prototype.parse = function () {
        this._vipsBlocks = new VipsBlock();
        this._visualBlocksCount = 0;
        this.constructVipsBlockTree(new ElementBox(document.getElementsByTagName("body").item(0)), this._vipsBlocks);
        this.divideVipsBlockTree(this._vipsBlocks);
        this.getVisualBlocksCount(this._vipsBlocks);
    };
    /**
     * Counts number of visual blocks in visual structure
     * @param vipsBlock Visual structure
     */
    VipsParser.prototype.getVisualBlocksCount = function (vipsBlock) {
        if (vipsBlock.isVisualBlock()) {
            this._visualBlocksCount++;
        }
        for (var _i = 0, _a = vipsBlock.getChildren(); _i < _a.length; _i++) {
            var vipsBlockChild = _a[_i];
            if (!(vipsBlockChild.getBox() instanceof TextBox)) {
                this.getVisualBlocksCount(vipsBlockChild);
            }
        }
    };
    /**
     * Construct VIPS block tree from viewport.
     *
     * Starts from <body> element.
     * @param element Box that represents element
     * @param node Visual structure tree node
     */
    VipsParser.prototype.constructVipsBlockTree = function (element, node) {
        node.setBox(element);
        if (!(element instanceof TextBox)) {
            for (var _i = 0, _a = element.getSubBoxList(); _i < _a.length; _i++) {
                var box = _a[_i];
                node.addChild(new VipsBlock());
                this.constructVipsBlockTree(box, node.getChildren()[node.getChildren().length - 1]);
            }
        }
    };
    /**
     * Tries to divide DOM elements and finds visual blocks.
     * @param vipsBlock Visual structure
     */
    VipsParser.prototype.divideVipsBlockTree = function (vipsBlock) {
        this._currentVipsBlock = vipsBlock;
        var elementBox = vipsBlock.getBox();
        // With VIPS rules it tries to determine if element is dividable
        if (this.applyVipsRules(elementBox) && vipsBlock.isDividable() && !vipsBlock.isVisualBlock()) {
            // if element is dividable, let's divide it
            this._currentVipsBlock.setAlreadyDivided(true);
            for (var _i = 0, _a = vipsBlock.getChildren(); _i < _a.length; _i++) {
                var vipsBlockChild = _a[_i];
                if (!(vipsBlockChild.getBox() instanceof TextBox)) {
                    this.divideVipsBlockTree(vipsBlockChild);
                }
            }
        }
        else {
            if (vipsBlock.isDividable()) {
                vipsBlock.setIsVisualBlock(true);
                vipsBlock.setDoC(11);
            }
            if (!this.verifyValidity(elementBox)) {
                this._currentVipsBlock.setIsVisualBlock(false);
            }
        }
    };
    VipsParser.prototype.getAllTextLength = function (node) {
        var childrenTextNodes = new Array();
        this.findTextChildrenNodes(node, childrenTextNodes);
        var textLength = 0;
        for (var _i = 0, childrenTextNodes_1 = childrenTextNodes; _i < childrenTextNodes_1.length; _i++) {
            var child = childrenTextNodes_1[_i];
            var childText = child.getText();
            if (!(childText === "") && !(childText === " ") && !(childText === "\n")) {
                textLength += childText.length;
            }
        }
        return textLength;
    };
    VipsParser.prototype.getAllChildren = function (node, children) {
        children.push(node);
        if (node instanceof TextBox) {
            return;
        }
        for (var _i = 0, _a = node.getSubBoxList(); _i < _a.length; _i++) {
            var child = _a[_i];
            this.getAllChildren(child, children);
        }
    };
    VipsParser.prototype.verifyValidity = function (node) {
        if (node.getElement().getBoundingClientRect().left < 0 || node.getElement().getBoundingClientRect().top < 0) {
            return false;
        }
        if (node.getElement().getBoundingClientRect().left + node.getElement().getBoundingClientRect().width > this._pageWidth) {
            return false;
        }
        if (node.getElement().getBoundingClientRect().top + node.getElement().getBoundingClientRect().height > this._pageHeight) {
            return false;
        }
        if (node.getElement().getBoundingClientRect().width <= 0 || node.getElement().getBoundingClientRect().height <= 0) {
            return false;
        }
        if (!node.isDisplayed()) {
            return false;
        }
        if (!node.isVisible()) {
            return false;
        }
        if (this.getAllTextLength(node) === 0) {
            var children = new Array();
            this.getAllChildren(node, children);
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var child = children_1[_i];
                var childNodeName = child.getNode().nodeName;
                if (!child.isVisible()) {
                    continue;
                }
                if (childNodeName.toLowerCase() === "img") {
                    return true;
                }
                if (childNodeName.toLowerCase() === "input") {
                    return true;
                }
            }
            return false;
        }
        return true;
    };
    /**
     * Checks if node is a valid node.
     *
     * Node is valid if it's visible in the browser. This means that the node's
     * width and height are not zero.
     *
     * @param node
     *            Input node
     *
     * @return True if node is valid, otherwise false.
     */
    VipsParser.prototype.isValidNode = function (node) {
        if (node.getElement().clientHeight > 0 && node.getElement().clientWidth > 0) {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Checks if node is a text node.
     *
     * @param box
     *            Input node
     *
     * @return True if node is a text node, otherwise false.
     */
    VipsParser.prototype.isTextNode = function (box) {
        return box.getNode().nodeName.toLowerCase() === "text";
    };
    /**
     * Checks if node is a virtual text node.
     *
     * Inline nodes with only text node children are virtual text nodes.
     *
     * @param node
     *            Input node
     *
     * @return True if node is virtual text node, otherwise false.
     */
    VipsParser.prototype.isVirtualTextNode1 = function (node) {
        if (node.isBlock()) {
            return false;
        }
        for (var _i = 0, _a = node.getSubBoxList(); _i < _a.length; _i++) {
            var childNode = _a[_i];
            if (!(childNode instanceof TextBox)) {
                if (!this.isTextNode(childNode)) {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * Checks if node is a virtual text node.
     *
     * Inline nodes with only text node and virtual text node children are
     * virtual text nodes.
     *
     * @param node
     *            Input node
     *
     * @return True if node is virtual text node, otherwise false.
     */
    VipsParser.prototype.isVirtualTextNode2 = function (node) {
        if (node.isBlock()) {
            return false;
        }
        for (var _i = 0, _a = node.getSubBoxList(); _i < _a.length; _i++) {
            var childNode = _a[_i];
            if (!this.isTextNode(childNode) ||
                this.isVirtualTextNode1(childNode)) {
                return false;
            }
        }
        return true;
    };
    /**
     * Checks if node is virtual text node.
     *
     * @param node
     *            Input node
     *
     * @return True if node is virtual text node, otherwise false.
     */
    VipsParser.prototype.isVirtualTextNode = function (node) {
        if (this.isVirtualTextNode1(node)) {
            return true;
        }
        if (this.isVirtualTextNode2(node)) {
            return true;
        }
        return false;
    };
    VipsParser.prototype.checkValidChildrenNodes = function (node) {
        if (node instanceof TextBox) {
            if (!(node.getText() === " ")) {
                this._cnt++;
            }
            return;
        }
        else {
            if (this.isValidNode(node)) {
                this._cnt++;
            }
        }
        for (var _i = 0, _a = node.getSubBoxList(); _i < _a.length; _i++) {
            var childNode = _a[_i];
            this.checkValidChildrenNodes(childNode);
        }
    };
    /*
     * Checks if node has valid children nodes
     */
    VipsParser.prototype.hasValidChildrenNodes = function (node) {
        if (node.getNode().nodeName.toLowerCase() === "img" || node.getNode().nodeName.toLowerCase() === "input") {
            if (node.getElement().clientWidth > 0 && node.getElement().clientHeight > 0) {
                this._currentVipsBlock.setIsVisualBlock(true);
                this._currentVipsBlock.setDoC(8);
                return true;
            }
            else {
                return false;
            }
        }
        if (node.getSubBoxList().length === 0) {
            return false;
        }
        this._cnt = 0;
        for (var _i = 0, _a = node.getSubBoxList(); _i < _a.length; _i++) {
            var child = _a[_i];
            this.checkValidChildrenNodes(child);
        }
        return (this._cnt > 0) ? true : false;
    };
    /*
     * Returns the number of node's valid children
     */
    VipsParser.prototype.numberOfValidChildNodes = function (node) {
        this._cnt = 0;
        if (node.getSubBoxList().length === 0) {
            return this._cnt;
        }
        for (var _i = 0, _a = node.getSubBoxList(); _i < _a.length; _i++) {
            var child = _a[_i];
            this.checkValidChildrenNodes(child);
        }
        return this._cnt;
    };
    /**
     * On different DOM nodes it applies different sets of VIPS rules.
     * @param node DOM node
     * @return Returns true if element is dividable, otherwise false.
     */
    VipsParser.prototype.applyVipsRules = function (node) {
        var retVal = false;
        if (!node.isBlock()) {
            retVal = this.applyInlineTextNodeVipsRules(node);
        }
        else if (node.getNode().nodeName.toLowerCase() === "table") {
            retVal = this.applyTableNodeVipsRules(node);
        }
        else if (node.getNode().nodeName.toLowerCase() === "tr") {
            retVal = this.applyTrNodeVipsRules(node);
        }
        else if (node.getNode().nodeName.toLowerCase() === "td") {
            retVal = this.applyTdNodeVipsRules(node);
        }
        else if (node.getNode().nodeName.toLowerCase() === "p") {
            retVal = this.applyPNodeVipsRules(node);
        }
        else {
            retVal = this.applyOtherNodeVipsRules(node);
        }
        return retVal;
    };
    /**
     * Applies VIPS rules on block nodes other than <P>, <TD>, <TR>, <TABLE>.
     *
     * @param node Node
     * @return Returns true if one of the rules succeeds and node is dividable.
     */
    VipsParser.prototype.applyOtherNodeVipsRules = function (node) {
        // 1 2 3 4 6 8 9 11
        if (this.ruleOne(node))
            return true;
        if (this.ruleTwo(node))
            return true;
        if (this.ruleThree(node))
            return true;
        if (this.ruleFour(node))
            return true;
        if (this.ruleSix(node))
            return true;
        if (this.ruleEight(node))
            return true;
        if (this.ruleNine(node))
            return true;
        if (this.ruleEleven(node))
            return true;
        return false;
    };
    /**
     * Applies VIPS rules on <P> nodes.
     * @param node Node
     * @return Returns true if one of the rules succeeds and node is dividable.
     */
    VipsParser.prototype.applyPNodeVipsRules = function (node) {
        // 1 2 3 4 5 6 8 9 11
        if (this.ruleOne(node))
            return true;
        if (this.ruleTwo(node))
            return true;
        if (this.ruleThree(node))
            return true;
        if (this.ruleFour(node))
            return true;
        if (this.ruleFive(node))
            return true;
        if (this.ruleSix(node))
            return true;
        if (this.ruleSeven(node))
            return true;
        if (this.ruleEight(node))
            return true;
        if (this.ruleNine(node))
            return true;
        if (this.ruleTen(node))
            return true;
        if (this.ruleEleven(node))
            return true;
        if (this.ruleTwelve(node))
            return true;
        return false;
    };
    /**
     * Applies VIPS rules on <TD> nodes.
     * @param node Node
     * @return Returns true if one of the rules succeeds and node is dividable.
     */
    VipsParser.prototype.applyTdNodeVipsRules = function (node) {
        // 1 2 3 4 8 9 10 12
        if (this.ruleOne(node))
            return true;
        if (this.ruleTwo(node))
            return true;
        if (this.ruleThree(node))
            return true;
        if (this.ruleFour(node))
            return true;
        if (this.ruleEight(node))
            return true;
        if (this.ruleNine(node))
            return true;
        if (this.ruleTen(node))
            return true;
        if (this.ruleTwelve(node))
            return true;
        return false;
    };
    /**
     * Applies VIPS rules on <TR> nodes.
     * @param node Node
     * @return Returns true if one of the rules succeeds and node is dividable.
     */
    VipsParser.prototype.applyTrNodeVipsRules = function (node) {
        // 1 2 3 7 9 12
        if (this.ruleOne(node))
            return true;
        if (this.ruleTwo(node))
            return true;
        if (this.ruleThree(node))
            return true;
        if (this.ruleSeven(node))
            return true;
        if (this.ruleNine(node))
            return true;
        if (this.ruleTwelve(node))
            return true;
        return false;
    };
    /**
     * Applies VIPS rules on <TABLE> nodes.
     * @param node Node
     * @return Returns true if one of the rules succeeds and node is dividable.
     */
    VipsParser.prototype.applyTableNodeVipsRules = function (node) {
        // 1 2 3 7 9 12
        if (this.ruleOne(node))
            return true;
        if (this.ruleTwo(node))
            return true;
        if (this.ruleThree(node))
            return true;
        if (this.ruleSeven(node))
            return true;
        if (this.ruleNine(node))
            return true;
        if (this.ruleTwelve(node))
            return true;
        return false;
    };
    /**
     * Applies VIPS rules on inline nodes.
     * @param node Node
     * @return Returns true if one of the rules succeeds and node is dividable.
     */
    VipsParser.prototype.applyInlineTextNodeVipsRules = function (node) {
        // 1 2 3 4 5 6 8 9 11
        if (this.ruleOne(node))
            return true;
        if (this.ruleTwo(node))
            return true;
        if (this.ruleThree(node))
            return true;
        if (this.ruleFour(node))
            return true;
        if (this.ruleFive(node))
            return true;
        if (this.ruleSix(node))
            return true;
        if (this.ruleEight(node))
            return true;
        if (this.ruleNine(node))
            return true;
        if (this.ruleTwelve(node))
            return true;
        return false;
    };
    /**
     * VIPS Rule One
     *
     * If the DOM node is not a text node and it has no valid children, then
     * this node cannot be divided and will be cut.
     *
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleOne = function (node) {
        if (!this.isTextNode(node)) {
            if (!this.hasValidChildrenNodes(node)) {
                this._currentVipsBlock.setIsDividable(false);
                return true;
            }
        }
        else {
            return false;
        }
    };
    /**
     * VIPS Rule Two
     *
     * If the DOM node has only one valid child and the child is not a text
     * node, then divide this node
     *
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleTwo = function (node) {
        if (this.numberOfValidChildNodes(node) === 1) {
            if (node.getSubBox(0) instanceof TextBox) {
                return false;
            }
            if (!this.isTextNode(node.getSubBox(0))) {
                return true;
            }
        }
        return false;
    };
    /**
     * VIPS Rule Three
     *
     * If the DOM node is the root node of the sub-DOM tree (corresponding to
     * the block), and there is only one sub DOM tree corresponding to this
     * block, divide this node.
     *
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleThree = function (node) {
        if (!node.isRootElement()) {
            return false;
        }
        var result = true;
        var cnt = 0;
        for (var _i = 0, _a = this._vipsBlocks.getChildren(); _i < _a.length; _i++) {
            var vipsBlock = _a[_i];
            if (vipsBlock.getBox().getNode().nodeName === node.getNode().nodeName) {
                result = true;
                this.isOnlyOneDomSubTree(node.getNode(), vipsBlock.getBox().getNode(), result);
                if (result) {
                    cnt++;
                }
            }
        }
        return (cnt === 1) ? true : false;
    };
    /**
     * Checks if node's subtree is unique in DOM tree.
     * @param pattern Node for comparing
     * @param node Node from DOM tree
     * @param result True if element is unique, otherwise false
     */
    VipsParser.prototype.isOnlyOneDomSubTree = function (pattern, node, result) {
        if (!(pattern.nodeName === node.nodeName)) {
            result = false;
        }
        if (pattern.childNodes.length != node.childNodes.length) {
            result = false;
        }
        if (!result) {
            return;
        }
        for (var i = 0; i < pattern.childNodes.length; i++) {
            this.isOnlyOneDomSubTree(pattern.childNodes[i], node.childNodes[i], result);
        }
    };
    /**
     * VIPS Rule Four
     *
     * If all of the child nodes of the DOM node are text nodes or virtual text
     * nodes, do not divide the node.
     * If the font size and font weight of all these child nodes are the same, set
     * the DoC of the extracted block to 10.
     * Otherwise, set the DoC of this extracted block to 9.
     *
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleFour = function (node) {
        if (node.getSubBoxList().length === 0) {
            return false;
        }
        for (var _i = 0, _a = node.getSubBoxList(); _i < _a.length; _i++) {
            var box = _a[_i];
            if (box instanceof TextBox) {
                continue;
            }
            if (!this.isTextNode(box) ||
                !this.isVirtualTextNode(box)) {
                return false;
            }
        }
        this._currentVipsBlock.setIsVisualBlock(true);
        this._currentVipsBlock.setIsDividable(false);
        if (node.getSubBoxList().length === 1) {
            if (node.getSubBox(0).getNode().nodeName.toLowerCase() === "em") {
                this._currentVipsBlock.setDoC(11);
            }
            else {
                this._currentVipsBlock.setDoC(10);
            }
            return true;
        }
        var fontWeight = "";
        var fontSize = 0;
        for (var _b = 0, _c = node.getSubBoxList(); _b < _c.length; _b++) {
            var childNode = _c[_b];
            var childFontSize = void 0;
            if (childNode.getNode().nodeType === Node.TEXT_NODE) {
                childFontSize = Number(window.getComputedStyle(childNode.getNode().parentElement, null).getPropertyValue('font-size'));
            }
            else if (childNode.getNode().nodeType === Node.ELEMENT_NODE) {
                childFontSize = Number(window.getComputedStyle(childNode.getNode(), null).getPropertyValue('font-size'));
            }
            if (childNode instanceof TextBox) {
                if (fontSize > 0) {
                    if (fontSize != childFontSize) {
                        this._currentVipsBlock.setDoC(9);
                        break;
                    }
                    else {
                        this._currentVipsBlock.setDoC(10);
                    }
                }
                else {
                    fontSize = childFontSize;
                }
                continue;
            }
            var child = childNode;
            if (window.getComputedStyle(child.getElement()).getPropertyValue("font-weight") === null) {
                return false;
            }
            if (fontSize > 0) {
                if (window.getComputedStyle(child.getElement()).getPropertyValue("font-weight").toString() === fontWeight
                    && childFontSize === fontSize) {
                    this._currentVipsBlock.setDoC(10);
                }
                else {
                    this._currentVipsBlock.setDoC(9);
                    break;
                }
            }
            else {
                fontWeight = window.getComputedStyle(child.getElement()).getPropertyValue("font-weight").toString();
                fontSize = childFontSize;
            }
        }
        return true;
    };
    /**
     * VIPS Rule Five
     *
     * If one of the child nodes of the DOM node is a line-break node, then
     * divide this DOM node.
     *
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleFive = function (node) {
        if (node.getSubBoxList().length === 0) {
            return false;
        }
        for (var _i = 0, _a = node.getSubBoxList(); _i < _a.length; _i++) {
            var childNode = _a[_i];
            if (childNode.isBlock()) {
                return true;
            }
        }
        return false;
    };
    /**
     * VIPS Rule Six
     *
     * If one of the child nodes of the DOM node has HTML tag <hr>, then
     * divide this DOM node
     *
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleSix = function (node) {
        if (node.getSubBoxList().length === 0) {
            return false;
        }
        var children = new Array();
        this.getAllChildren(node, children);
        for (var _i = 0, children_2 = children; _i < children_2.length; _i++) {
            var child = children_2[_i];
            if (child.getNode().nodeName.toLowerCase() === "hr") {
                return true;
            }
        }
        return false;
    };
    /**
     * VIPS Rule Seven
     *
     * If the background color of this node is different from one of its
     * children’s, divide this node and at the same time, the child nodes with
     * different background color will not be divided in this round.
     * Set the DoC value (6-8) for the child nodes based on the html
     * tag of the child node and the size of the child node.
     *
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleSeven = function (node) {
        if (node.getSubBoxList().length === 0) {
            return false;
        }
        if (this.isTextNode(node)) {
            return false;
        }
        var nodeBgColor = this._currentVipsBlock.getBgColor();
        for (var _i = 0, _a = this._currentVipsBlock.getChildren(); _i < _a.length; _i++) {
            var vipsStructureChild = _a[_i];
            if (!(vipsStructureChild.getBgColor() === nodeBgColor)) {
                vipsStructureChild.setIsDividable(false);
                vipsStructureChild.setIsVisualBlock(true);
                vipsStructureChild.setDoC(7);
                return true;
            }
        }
        return false;
    };
    VipsParser.prototype.findTextChildrenNodes = function (node, results) {
        if (node instanceof TextBox) {
            results.push(node);
            return;
        }
        for (var _i = 0, _a = node.getSubBoxList(); _i < _a.length; _i++) {
            var childNode = _a[_i];
            this.findTextChildrenNodes(childNode, results);
        }
    };
    /**
     * VIPS Rule Eight
     *
     * If the node has at least one text node child or at least one virtual
     * text node child, and the node's relative size is smaller than
     * a threshold, then the node cannot be divided.
     * Set the DoC value (from 5-8) based on the html tag of the node.
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleEight = function (node) {
        if (node.getSubBoxList().length === 0) {
            return false;
        }
        var children = new Array();
        this.findTextChildrenNodes(node, children);
        var cnt = children.length;
        if (cnt === 0) {
            return false;
        }
        if (node.getElement().clientWidth === 0 || node.getElement().clientHeight === 0) {
            while (children.length > 0) {
                children.pop();
            }
            this.getAllChildren(node, children);
            for (var _i = 0, children_3 = children; _i < children_3.length; _i++) {
                var child = children_3[_i];
                if (child.getNode().nodeType === Node.ELEMENT_NODE) {
                    var childNode = child.getNode();
                    if (childNode.clientWidth != 0 && childNode.clientHeight != 0) {
                        return true;
                    }
                }
            }
        }
        if (node.getElement().clientWidth * node.getElement().clientHeight > this._sizeThresholdHeight * this._sizeThresholdWidth) {
            return false;
        }
        if (node.getNode().nodeName.toLowerCase() === "ul") {
            return true;
        }
        this._currentVipsBlock.setIsVisualBlock(true);
        this._currentVipsBlock.setIsDividable(false);
        if (node.getNode().nodeName.toLowerCase() === "Xdiv") {
            this._currentVipsBlock.setDoC(7);
        }
        else if (node.getNode().nodeName.toLowerCase() === "code") {
            this._currentVipsBlock.setDoC(7);
        }
        else if (node.getNode().nodeName.toLowerCase() === "div") {
            this._currentVipsBlock.setDoC(5);
        }
        else {
            this._currentVipsBlock.setDoC(8);
        }
        return true;
    };
    /**
     * VIPS Rule Nine
     *
     * If the children of the node with maximum size are smaller than
     * a threshold (relative size), do not divide this node.
     * Set the DoC based on the html tag and size of this node.
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleNine = function (node) {
        if (node.getSubBoxList().length === 0) {
            return false;
        }
        var maxSize = 0;
        for (var _i = 0, _a = node.getSubBoxList(); _i < _a.length; _i++) {
            var childNode = _a[_i];
            if (childNode.getNode().nodeType === Node.ELEMENT_NODE) {
                var childElement = childNode.getNode();
                var childSize = childElement.clientWidth * childElement.clientHeight;
                if (maxSize < childSize) {
                    maxSize = childSize;
                }
            }
        }
        if (maxSize > this._sizeThresholdWidth * this._sizeThresholdHeight) {
            return true;
        }
        this._currentVipsBlock.setIsVisualBlock(true);
        this._currentVipsBlock.setIsDividable(false);
        if (node.getNode().nodeName.toLowerCase() === "Xdiv") {
            this._currentVipsBlock.setDoC(7);
        }
        if (node.getNode().nodeName.toLowerCase() === "a") {
            this._currentVipsBlock.setDoC(11);
        }
        else {
            this._currentVipsBlock.setDoC(8);
        }
        return true;
    };
    /**
     * VIPS Rule Ten
     *
     * If previous sibling node has not been divided, do not divide this node
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleTen = function (node) {
        this._tempVipsBlock = null;
        this.findPreviousSiblingNodeVipsBlock(node.getNode().previousSibling, this._vipsBlocks);
        if (this._tempVipsBlock === null) {
            return false;
        }
        if (this._tempVipsBlock.isAlreadyDivided()) {
            return true;
        }
        return false;
    };
    /**
     * VIPS Rule Eleven
     *
     * Divide this node if it is not a text node.
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleEleven = function (node) {
        return (this.isTextNode(node)) ? false : true;
    };
    /**
     * VIPS Rule Twelve
     *
     * Do not divide this node.
     * Set the DoC value based on the html tag and size of this node.
     * @param node
     *            Input node
     *
     * @return True if rule is applied, otherwise false.
     */
    VipsParser.prototype.ruleTwelve = function (node) {
        this._currentVipsBlock.setIsDividable(false);
        this._currentVipsBlock.setIsVisualBlock(true);
        if (node.getNode().nodeName.toLowerCase() === "Xdiv") {
            this._currentVipsBlock.setDoC(7);
        }
        else if (node.getNode().nodeName.toLowerCase() === "li") {
            this._currentVipsBlock.setDoC(8);
        }
        else if (node.getNode().nodeName.toLowerCase() === "span") {
            this._currentVipsBlock.setDoC(8);
        }
        else if (node.getNode().nodeName.toLowerCase() === "sup") {
            this._currentVipsBlock.setDoC(8);
        }
        else if (node.getNode().nodeName.toLowerCase() === "img") {
            this._currentVipsBlock.setDoC(8);
        }
        else {
            this._currentVipsBlock.setDoC(333);
        }
        return true;
    };
    /**
     * @param sizeTresholdWidth the _sizeTresholdWidth to set
     */
    VipsParser.prototype.setSizeThresholdWidth = function (sizeThresholdWidth) {
        this._sizeThresholdWidth = sizeThresholdWidth;
    };
    /**
     * @param sizeTresholdHeight the _sizeTresholdHeight to set
     */
    VipsParser.prototype.setSizeThresholdHeight = function (sizeThresholdHeight) {
        this._sizeThresholdHeight = sizeThresholdHeight;
    };
    VipsParser.prototype.getVipsBlocks = function () {
        return this._vipsBlocks;
    };
    /**
     * Finds previous sibling node's VIPS block.
     * @param node Node
     * @param vipsBlock Actual VIPS block
     */
    VipsParser.prototype.findPreviousSiblingNodeVipsBlock = function (node, vipsBlock) {
        if (vipsBlock.getBox().getNode().isEqualNode(node)) {
            this._tempVipsBlock = vipsBlock;
            return;
        }
        else {
            for (var _i = 0, _a = vipsBlock.getChildren(); _i < _a.length; _i++) {
                var vipsBlockChild = _a[_i];
                this.findPreviousSiblingNodeVipsBlock(node, vipsBlockChild);
            }
        }
    };
    return VipsParser;
}());
/**
 * Separators detector (no graphics output).
 * @author Tomas Popela
 * @author Lars Meyer
 */
var VipsSeparatorNonGraphicsDetector = /** @class */ (function () {
    /**
     * Defaults constructor.
     * @param width Pools width
     * @param height Pools height
     */
    function VipsSeparatorNonGraphicsDetector(width, height) {
        this._vipsBlocks = null;
        this._visualBlocks = null;
        this._horizontalSeparators = null;
        this._verticalSeparators = null;
        this._width = 0;
        this._height = 0;
        this._cleanSeparatorsThreshold = 0;
        this._width = width;
        this._height = height;
        this._horizontalSeparators = new Array();
        this._verticalSeparators = new Array();
        this._visualBlocks = new Array();
    }
    VipsSeparatorNonGraphicsDetector.prototype.fillPoolWithBlocks = function (vipsBlock) {
        if (vipsBlock.isVisualBlock()) {
            this._visualBlocks.push(vipsBlock);
        }
        for (var _i = 0, _a = vipsBlock.getChildren(); _i < _a.length; _i++) {
            var vipsBlockChild = _a[_i];
            this.fillPoolWithBlocks(vipsBlockChild);
        }
    };
    /**
     * Fills pool with all visual blocks from VIPS blocks.
     *
     */
    VipsSeparatorNonGraphicsDetector.prototype.fillPool = function () {
        if (this._vipsBlocks != null) {
            this.fillPoolWithBlocks(this._vipsBlocks);
        }
    };
    /**
     * Sets VIPS block that will be used for separator computation.
     * @param vipsBlock Visual structure
     */
    VipsSeparatorNonGraphicsDetector.prototype.setVipsBlock = function (vipsBlock) {
        this._vipsBlocks = vipsBlock;
        while (this._visualBlocks.length > 0) {
            this._visualBlocks.pop();
        }
        this.fillPoolWithBlocks(vipsBlock);
    };
    /**
     * Gets VIPS block that is used for separator computation.
     */
    VipsSeparatorNonGraphicsDetector.prototype.getVipsBlock = function () {
        return this._vipsBlocks;
    };
    /**
     * Sets VIPS blocks that will be used for separator computation.
     * @param visualBlocks List of visual blocks
     */
    VipsSeparatorNonGraphicsDetector.prototype.setVisualBlocks = function (visualBlocks) {
        while (this._visualBlocks.length > 0) {
            this._visualBlocks.pop();
        }
        for (var _i = 0, visualBlocks_1 = visualBlocks; _i < visualBlocks_1.length; _i++) {
            var visualBlock = visualBlocks_1[_i];
            this._visualBlocks.push(visualBlock);
        }
    };
    /**
     * Gets VIPS blocks that are used for separator computation.
     * @return Visual structure
     */
    VipsSeparatorNonGraphicsDetector.prototype.getVisualBlocks = function () {
        return this._visualBlocks;
    };
    /**
     * Computes vertical visual separators
     */
    VipsSeparatorNonGraphicsDetector.prototype.findVerticalSeparators = function () {
        for (var _i = 0, _a = this._visualBlocks; _i < _a.length; _i++) {
            var vipsBlock = _a[_i];
            if (vipsBlock.getElementBox() != null) {
                var blockStart = vipsBlock.getElementBox().getElement().getBoundingClientRect().left;
                var blockEnd = blockStart + vipsBlock.getElementBox().getElement().getBoundingClientRect().width;
                for (var _b = 0, _c = this._verticalSeparators; _b < _c.length; _b++) {
                    var separator = _c[_b];
                    if (blockStart < separator.endPoint) {
                        if (blockStart < separator.startPoint && blockEnd >= separator.endPoint) {
                            var tempSeparators = new Array();
                            for (var _d = 0, _e = this._verticalSeparators; _d < _e.length; _d++) {
                                var sep = _e[_d];
                                tempSeparators.push(sep);
                            }
                            for (var _f = 0, tempSeparators_1 = tempSeparators; _f < tempSeparators_1.length; _f++) {
                                var other = tempSeparators_1[_f];
                                if (blockStart < other.startPoint && blockEnd > other.endPoint) {
                                    this._verticalSeparators.splice(this._verticalSeparators.indexOf(other), 1);
                                }
                            }
                            for (var _g = 0, _h = this._verticalSeparators; _g < _h.length; _g++) {
                                var other = _h[_g];
                                if (blockEnd > other.startPoint && blockEnd < other.endPoint) {
                                    other.startPoint = blockEnd + 1;
                                    break;
                                }
                            }
                            break;
                        }
                        if (blockEnd < separator.startPoint) {
                            break;
                        }
                        if (blockStart < separator.startPoint && blockEnd >= separator.startPoint) {
                            separator.startPoint = blockEnd + 1;
                            break;
                        }
                        if (blockStart >= separator.startPoint && blockEnd <= separator.endPoint) {
                            if (blockStart === separator.startPoint) {
                                separator.startPoint = blockEnd + 1;
                                break;
                            }
                            if (blockEnd === separator.endPoint) {
                                separator.endPoint = blockStart - 1;
                                break;
                            }
                            this._verticalSeparators.splice(this._verticalSeparators.indexOf(separator) + 1, 0, new Separator(blockEnd + 1, separator.endPoint));
                            separator.endPoint = blockStart - 1;
                            break;
                        }
                        if (blockStart > separator.startPoint && blockStart < separator.endPoint) {
                            var nextSeparatorIndex = this._verticalSeparators.indexOf(separator);
                            if (nextSeparatorIndex + 1 < this._verticalSeparators.length) {
                                var nextSeparator = this._verticalSeparators[this._verticalSeparators.indexOf(separator) + 1];
                                if (blockEnd > nextSeparator.startPoint && blockEnd < nextSeparator.endPoint) {
                                    separator.endPoint = blockStart - 1;
                                    nextSeparator.startPoint = blockEnd + 1;
                                    break;
                                }
                                else {
                                    var tempSeparators = new Array();
                                    for (var _j = 0, _k = this._verticalSeparators; _j < _k.length; _j++) {
                                        var sep = _k[_j];
                                        tempSeparators.push(sep);
                                    }
                                    for (var _l = 0, tempSeparators_2 = tempSeparators; _l < tempSeparators_2.length; _l++) {
                                        var other = tempSeparators_2[_l];
                                        if (blockStart < other.startPoint && other.endPoint < blockEnd) {
                                            this._verticalSeparators.splice(this._verticalSeparators.indexOf(other), 1);
                                            continue;
                                        }
                                        if (blockEnd > other.startPoint && blockEnd < other.endPoint) {
                                            other.startPoint = blockEnd + 1;
                                            break;
                                        }
                                        if (blockStart > other.startPoint && blockStart < other.endPoint) {
                                            other.endPoint = blockStart - 1;
                                            continue;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        separator.endPoint = blockStart - 1;
                        break;
                    }
                }
            }
        }
    };
    /**
     * Computes horizontal visual separators
     */
    VipsSeparatorNonGraphicsDetector.prototype.findHorizontalSeparators = function () {
        for (var _i = 0, _a = this._visualBlocks; _i < _a.length; _i++) {
            var vipsBlock = _a[_i];
            if (vipsBlock.getElementBox() != null) {
                // block vertical coordinates
                var blockStart = vipsBlock.getElementBox().getElement().getBoundingClientRect().top;
                var blockEnd = blockStart + vipsBlock.getElementBox().getElement().getBoundingClientRect().height;
                // for each separator that we have in pool
                for (var _b = 0, _c = this._horizontalSeparators; _b < _c.length; _b++) {
                    var separator = _c[_b];
                    // find separator, that intersects with our visual block
                    if (blockStart < separator.endPoint) {
                        // next there are six relations that the separator and visual block can have
                        // if separator is inside visual block
                        if (blockStart < separator.startPoint && blockEnd >= separator.endPoint) {
                            var tempSeparators = new Array();
                            for (var _d = 0, _e = this._horizontalSeparators; _d < _e.length; _d++) {
                                var sep = _e[_d];
                                tempSeparators.push(sep);
                            }
                            //remove all separators, that are included in block
                            for (var _f = 0, tempSeparators_3 = tempSeparators; _f < tempSeparators_3.length; _f++) {
                                var other = tempSeparators_3[_f];
                                if (blockStart < other.startPoint && blockEnd > other.endPoint)
                                    this._horizontalSeparators.splice(this._horizontalSeparators.indexOf(other), 1);
                            }
                            //find separator, that is on end of this block (if exists)
                            for (var _g = 0, _h = this._horizontalSeparators; _g < _h.length; _g++) {
                                var other = _h[_g];
                                // and if it's necessary change it's start point
                                if (blockEnd > other.startPoint && blockEnd < other.endPoint) {
                                    other.startPoint = blockEnd + 1;
                                    break;
                                }
                            }
                            break;
                        }
                        // if block is inside another block -> skip it
                        if (blockEnd < separator.startPoint)
                            break;
                        // if separator starts in the middle of block
                        if (blockStart <= separator.startPoint && blockEnd >= separator.startPoint) {
                            // change separator start's point coordinate
                            separator.startPoint = blockEnd + 1;
                            break;
                        }
                        // if block is inside the separator
                        if (blockStart >= separator.startPoint && blockEnd < separator.endPoint) {
                            if (blockStart == separator.startPoint) {
                                separator.startPoint = blockEnd + 1;
                                break;
                            }
                            if (blockEnd == separator.endPoint) {
                                separator.endPoint = blockStart - 1;
                                break;
                            }
                            // add new separator that starts behind the block
                            this._horizontalSeparators.splice(this._horizontalSeparators.indexOf(separator) + 1, 0, new Separator(blockEnd + 1, separator.endPoint));
                            // change end point coordinates of separator, that's before block
                            separator.endPoint = blockStart - 1;
                            break;
                        }
                        // if in one block is one separator ending and another one starting
                        if (blockStart > separator.startPoint && blockStart < separator.endPoint) {
                            // find the next one
                            var nextSeparatorIndex = this._horizontalSeparators.indexOf(separator);
                            // if it's not the last separator
                            if (nextSeparatorIndex + 1 < this._horizontalSeparators.length) {
                                var nextSeparator = this._horizontalSeparators[this._horizontalSeparators.indexOf(separator) + 1];
                                // next separator is really starting before the block ends
                                if (blockEnd > nextSeparator.startPoint && blockEnd < nextSeparator.endPoint) {
                                    // change separator start point coordinate
                                    separator.endPoint = blockStart - 1;
                                    nextSeparator.startPoint = blockEnd + 1;
                                    break;
                                }
                                else {
                                    var tempSeparators = new Array();
                                    for (var _j = 0, _k = this._horizontalSeparators; _j < _k.length; _j++) {
                                        var sep = _k[_j];
                                        tempSeparators.push(sep);
                                    }
                                    //remove all separators, that are included in block
                                    for (var _l = 0, tempSeparators_4 = tempSeparators; _l < tempSeparators_4.length; _l++) {
                                        var other = tempSeparators_4[_l];
                                        if (blockStart < other.startPoint && other.endPoint < blockEnd) {
                                            this._horizontalSeparators.splice(this._horizontalSeparators.indexOf(other), 1);
                                            continue;
                                        }
                                        if (blockEnd > other.startPoint && blockEnd < other.endPoint) {
                                            // change separator start's point coordinate
                                            other.startPoint = blockEnd + 1;
                                            break;
                                        }
                                        if (blockStart > other.startPoint && blockStart < other.endPoint) {
                                            other.endPoint = blockStart - 1;
                                            continue;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        // if separator ends in the middle of block
                        // change it's end point coordinate
                        separator.endPoint = blockStart - 1;
                        break;
                    }
                }
            }
        }
    };
    /**
     * Detects horizontal visual separators from Vips blocks.
     */
    VipsSeparatorNonGraphicsDetector.prototype.detectHorizontalSeparators = function () {
        if (this._visualBlocks.length === 0) {
            console.error("I don't have any visual blocks!");
            return;
        }
        while (this._horizontalSeparators.length > 0) {
            this._horizontalSeparators.pop();
        }
        this._horizontalSeparators.push(new Separator(0, this._height));
        this.findHorizontalSeparators();
        // remove pool borders
        var tempSeparators = new Array();
        for (var _i = 0, _a = this._horizontalSeparators; _i < _a.length; _i++) {
            var sep = _a[_i];
            tempSeparators.push(sep);
        }
        for (var _b = 0, tempSeparators_5 = tempSeparators; _b < tempSeparators_5.length; _b++) {
            var separator = tempSeparators_5[_b];
            if (separator.startPoint === 0) {
                this._horizontalSeparators.splice(this._horizontalSeparators.indexOf(separator), 1);
            }
            if (separator.endPoint === this._height) {
                this._horizontalSeparators.splice(this._horizontalSeparators.indexOf(separator), 1);
            }
        }
        if (this._cleanSeparatorsThreshold != 0) {
            this.cleanUpSeparators(this._horizontalSeparators);
        }
        this.computeHorizontalWeights();
        this.sortSeparatorsByWeight(this._horizontalSeparators);
    };
    /**
     * Detects vertical visual separators from Vips blocks.
     */
    VipsSeparatorNonGraphicsDetector.prototype.detectVerticalSeparators = function () {
        if (this._visualBlocks.length === 0) {
            console.error("I don't have any visual blocks!");
            return;
        }
        while (this._verticalSeparators.length > 0) {
            this._verticalSeparators.pop();
        }
        this._verticalSeparators.push(new Separator(0, this._width));
        this.findVerticalSeparators();
        // remove pool borders
        var tempSeparators = new Array();
        for (var _i = 0, _a = this._verticalSeparators; _i < _a.length; _i++) {
            var sep = _a[_i];
            tempSeparators.push(sep);
        }
        for (var _b = 0, tempSeparators_6 = tempSeparators; _b < tempSeparators_6.length; _b++) {
            var separator = tempSeparators_6[_b];
            if (separator.startPoint === 0) {
                this._verticalSeparators.splice(this._verticalSeparators.indexOf(separator), 1);
            }
            if (separator.endPoint === this._width) {
                this._verticalSeparators.splice(this._verticalSeparators.indexOf(separator), 1);
            }
        }
        if (this._cleanSeparatorsThreshold != 0) {
            this.cleanUpSeparators(this._verticalSeparators);
        }
        this.computeVerticalWeights();
        this.sortSeparatorsByWeight(this._verticalSeparators);
    };
    VipsSeparatorNonGraphicsDetector.prototype.cleanUpSeparators = function (separators) {
        var tempList = new Array();
        for (var _i = 0, separators_1 = separators; _i < separators_1.length; _i++) {
            var sep = separators_1[_i];
            tempList.push(sep);
        }
        for (var _a = 0, tempList_1 = tempList; _a < tempList_1.length; _a++) {
            var separator = tempList_1[_a];
            var width = separator.endPoint - separator.startPoint + 1;
            if (width < this._cleanSeparatorsThreshold) {
                separators.splice(separators.indexOf(separator), 1);
            }
        }
    };
    /**
     * Sorts given separators by their weight.
     * @param separators Separators
     */
    VipsSeparatorNonGraphicsDetector.prototype.sortSeparatorsByWeight = function (separators) {
        separators.sort(function (a, b) { return a.weight - b.weight; });
    };
    /**
     * Computes weights for vertical separators.
     */
    VipsSeparatorNonGraphicsDetector.prototype.computeVerticalWeights = function () {
        for (var _i = 0, _a = this._verticalSeparators; _i < _a.length; _i++) {
            var separator = _a[_i];
            this.ruleOne(separator);
            this.ruleTwo(separator, false);
            this.ruleThree(separator, false);
        }
    };
    /**
     * Computes weights for horizontal separators.
     */
    VipsSeparatorNonGraphicsDetector.prototype.computeHorizontalWeights = function () {
        for (var _i = 0, _a = this._horizontalSeparators; _i < _a.length; _i++) {
            var separator = _a[_i];
            this.ruleOne(separator);
            this.ruleTwo(separator, true);
            this.ruleThree(separator, true);
            this.ruleFour(separator);
            this.ruleFive(separator);
        }
    };
    /**
     * The greater the distance between blocks on different
     * sides of the separator, the higher the weight.
     * For every 10 points of width we increase weight by 1 point.
     * @param separator Separator
     */
    VipsSeparatorNonGraphicsDetector.prototype.ruleOne = function (separator) {
        var width = separator.endPoint - separator.startPoint + 1;
        if (width > 55) {
            separator.weight += 12;
        }
        if (width > 45 && width <= 55) {
            separator.weight += 10;
        }
        if (width > 35 && width <= 45) {
            separator.weight += 8;
        }
        if (width > 25 && width <= 35) {
            separator.weight += 6;
        }
        else if (width > 15 && width <= 25) {
            separator.weight += 4;
        }
        else if (width > 8 && width <= 15) {
            separator.weight += 2;
        }
        else {
            separator.weight += 1;
        }
    };
    /**
     * If a visual separator is overlapped with some certain HTML
     * tags (e.g., the <HR> HTML tag), its weight is set to be higher.
     * @param separator Separator
     */
    VipsSeparatorNonGraphicsDetector.prototype.ruleTwo = function (separator, horizontal) {
        var overlappedElements = new Array();
        if (horizontal) {
            this.findHorizontalOverlappedElements(separator, overlappedElements);
        }
        else {
            this.findVerticalOverlappedElements(separator, overlappedElements);
        }
        if (overlappedElements.length === 0) {
            return;
        }
        for (var _i = 0, overlappedElements_1 = overlappedElements; _i < overlappedElements_1.length; _i++) {
            var vipsBlock = overlappedElements_1[_i];
            if (vipsBlock.getBox().getNode().nodeName.toLowerCase() === "hr") {
                separator.weight += 2;
                break;
            }
        }
    };
    /**
     * Finds elements that are overlapped with a horizontal separator.
     * @param separator Separator that we look at
     * @param vipsBlock Visual block corresponding to element
     * @param result Elements that we found
     */
    VipsSeparatorNonGraphicsDetector.prototype.findHorizontalOverlappedElements = function (separator, result) {
        for (var _i = 0, _a = this._visualBlocks; _i < _a.length; _i++) {
            var vipsBlock = _a[_i];
            if (vipsBlock.getElementBox() != null) {
                var topEdge = vipsBlock.getElementBox().getElement().getBoundingClientRect().top;
                var bottomEdge = vipsBlock.getElementBox().getElement().getBoundingClientRect().bottom;
                // two upper edges of element are overlapped with separator
                if (topEdge > separator.startPoint && topEdge < separator.endPoint && bottomEdge > separator.endPoint) {
                    result.push(vipsBlock);
                }
                // two bottom edges of element are overlapped with separator
                if (topEdge < separator.startPoint && bottomEdge > separator.startPoint && bottomEdge < separator.endPoint) {
                    result.push(vipsBlock);
                }
                // all edges of element are overlapped with separator
                if (topEdge >= separator.startPoint && bottomEdge <= separator.endPoint) {
                    result.push(vipsBlock);
                }
            }
        }
    };
    /**
     * Finds elements that are overlapped with a vertical separator.
     * @param separator Separator that we look at
     * @param vipsBlock Visual block corresponding to element
     * @param result Elements that we found
     */
    VipsSeparatorNonGraphicsDetector.prototype.findVerticalOverlappedElements = function (separator, result) {
        for (var _i = 0, _a = this._visualBlocks; _i < _a.length; _i++) {
            var vipsBlock = _a[_i];
            if (vipsBlock.getElementBox() != null) {
                var leftEdge = vipsBlock.getElementBox().getElement().getBoundingClientRect().left;
                var rightEdge = vipsBlock.getElementBox().getElement().getBoundingClientRect().right;
                // two left edges of element are overlapped with separator
                if (leftEdge > separator.startPoint && leftEdge < separator.endPoint && rightEdge > separator.endPoint) {
                    result.push(vipsBlock);
                }
                // two right edges of element are overlapped with separator
                if (leftEdge < separator.startPoint && rightEdge > separator.startPoint && rightEdge < separator.endPoint) {
                    result.push(vipsBlock);
                }
                // all edges of element are overlapped with separator
                if (leftEdge >= separator.startPoint && rightEdge <= separator.endPoint) {
                    result.push(vipsBlock);
                }
            }
        }
    };
    /**
     * If background colors of the blocks on two sides of the separator
     * are different, the weight will be increased.
     * @param separator Separator
     */
    VipsSeparatorNonGraphicsDetector.prototype.ruleThree = function (separator, horizontal) {
        var topAdjacentElements = new Array();
        var bottomAdjacentElements = new Array();
        if (horizontal) {
            this.findHorizontalAdjacentBlocks(separator, topAdjacentElements, bottomAdjacentElements);
        }
        else {
            this.findVerticalAdjacentBlocks(separator, topAdjacentElements, bottomAdjacentElements);
        }
        if (topAdjacentElements.length < 1 || bottomAdjacentElements.length < 1) {
            return;
        }
        var weightIncreased = false;
        for (var _i = 0, topAdjacentElements_1 = topAdjacentElements; _i < topAdjacentElements_1.length; _i++) {
            var top_1 = topAdjacentElements_1[_i];
            for (var _a = 0, bottomAdjacentElements_1 = bottomAdjacentElements; _a < bottomAdjacentElements_1.length; _a++) {
                var bottom = bottomAdjacentElements_1[_a];
                if (!(top_1.getBgColor() === bottom.getBgColor())) {
                    separator.weight += 2;
                    weightIncreased = true;
                    break;
                }
            }
            if (weightIncreased) {
                break;
            }
        }
    };
    /**
     * Finds elements that are adjacent to a horizontal separator.
     * @param separator Separator that we look at
     * @param vipsBlock Visual block corresponding to element
     * @param resultTop Elements that we found on top side of separator
     * @param resultBottom Elements that we found on bottom side side of separator
     */
    VipsSeparatorNonGraphicsDetector.prototype.findHorizontalAdjacentBlocks = function (separator, resultTop, resultBottom) {
        for (var _i = 0, _a = this._visualBlocks; _i < _a.length; _i++) {
            var vipsBlock = _a[_i];
            if (vipsBlock.getElementBox() != null) {
                var topEdge = vipsBlock.getElementBox().getElement().getBoundingClientRect().top;
                var bottomEdge = vipsBlock.getElementBox().getElement().getBoundingClientRect().bottom;
                // if box is adjacent to separator from bottom
                if (topEdge == separator.endPoint + 1 && bottomEdge > separator.endPoint + 1) {
                    resultBottom.push(vipsBlock);
                }
                // if box is adjacent to separator from top
                if (bottomEdge == separator.startPoint - 1 && topEdge < separator.startPoint - 1) {
                    resultTop.splice(0, 0, vipsBlock);
                }
            }
        }
    };
    /**
     * Finds elements that are adjacent to a vertical separator.
     * @param separator Separator that we look at
     * @param vipsBlock Visual block corresponding to element
     * @param resultLeft Elements that we found on left side of separator
     * @param resultRight Elements that we found on right side side of separator
     */
    VipsSeparatorNonGraphicsDetector.prototype.findVerticalAdjacentBlocks = function (separator, resultLeft, resultRight) {
        for (var _i = 0, _a = this._visualBlocks; _i < _a.length; _i++) {
            var vipsBlock = _a[_i];
            if (vipsBlock.getElementBox() != null) {
                var leftEdge = vipsBlock.getElementBox().getElement().getBoundingClientRect().left;
                var rightEdge = vipsBlock.getElementBox().getElement().getBoundingClientRect().right;
                // if box is adjacent to separator from right
                if (leftEdge == separator.endPoint + 1 && rightEdge > separator.endPoint + 1) {
                    resultRight.push(vipsBlock);
                }
                // if box is adjacent to separator from left
                if (rightEdge == separator.startPoint - 1 && leftEdge < separator.startPoint - 1) {
                    resultLeft.splice(0, 0, vipsBlock);
                }
            }
        }
    };
    /**
     * For horizontal separators, if the differences of font properties
     * such as font size and font weight are bigger on two
     * sides of the separator, the weight will be increased.
     * Moreover, the weight will be increased if the font size of the block
     * above the separator is smaller than the font size of the block
     * below the separator.
     * @param separator Separator
     */
    VipsSeparatorNonGraphicsDetector.prototype.ruleFour = function (separator) {
        var topAdjacentElements = new Array();
        var bottomAdjacentElements = new Array();
        this.findHorizontalAdjacentBlocks(separator, topAdjacentElements, bottomAdjacentElements);
        if (topAdjacentElements.length < 1 || bottomAdjacentElements.length < 1) {
            return;
        }
        var weightIncreased = false;
        for (var _i = 0, topAdjacentElements_2 = topAdjacentElements; _i < topAdjacentElements_2.length; _i++) {
            var top_2 = topAdjacentElements_2[_i];
            for (var _a = 0, bottomAdjacentElements_2 = bottomAdjacentElements; _a < bottomAdjacentElements_2.length; _a++) {
                var bottom = bottomAdjacentElements_2[_a];
                if (top_2.getElementBox() != null && bottom.getElementBox() != null) {
                    var topFontSizeString = window.getComputedStyle(top_2.getElementBox().getElement()).getPropertyValue('font-size');
                    var bottomFontSizeString = window.getComputedStyle(bottom.getElementBox().getElement()).getPropertyValue('font-size');
                    var topFontSize = +topFontSizeString.substring(0, topFontSizeString.length - 2);
                    var bottomFontSize = +bottomFontSizeString.substring(0, topFontSizeString.length - 2);
                    var diff = Math.abs(topFontSize - bottomFontSize);
                    if (diff != 0) {
                        separator.weight += 2;
                        weightIncreased = true;
                        break;
                    }
                    else {
                        var topFontWeight = window.getComputedStyle(top_2.getElementBox().getElement()).getPropertyValue('font-weight');
                        var bottomFontWeight = window.getComputedStyle(bottom.getElementBox().getElement()).getPropertyValue('font-weight');
                        if (!(topFontWeight === bottomFontWeight)) {
                            separator.weight += 2;
                        }
                    }
                }
            }
            if (weightIncreased) {
                break;
            }
        }
        weightIncreased = false;
        for (var _b = 0, topAdjacentElements_3 = topAdjacentElements; _b < topAdjacentElements_3.length; _b++) {
            var top_3 = topAdjacentElements_3[_b];
            for (var _c = 0, bottomAdjacentElements_3 = bottomAdjacentElements; _c < bottomAdjacentElements_3.length; _c++) {
                var bottom = bottomAdjacentElements_3[_c];
                if (top_3.getElementBox() != null && bottom.getElementBox() != null) {
                    var topFontSizeString = window.getComputedStyle(top_3.getElementBox().getElement()).getPropertyValue('font-size');
                    var bottomFontSizeString = window.getComputedStyle(bottom.getElementBox().getElement()).getPropertyValue('font-size');
                    var topFontSize = +topFontSizeString.substring(0, topFontSizeString.length - 2);
                    var bottomFontSize = +bottomFontSizeString.substring(0, topFontSizeString.length - 2);
                    if (topFontSize < bottomFontSize) {
                        separator.weight += 2;
                        weightIncreased = true;
                        break;
                    }
                }
            }
            if (weightIncreased) {
                break;
            }
        }
    };
    /**
     * For horizontal separators, when the structures of the blocks on the two
     * sides of the separator are very similar (e.g. both are text),
     * the weight of the separator will be decreased.
     * @param separator Separator
     */
    VipsSeparatorNonGraphicsDetector.prototype.ruleFive = function (separator) {
        var topAdjacentElements = new Array();
        var bottomAdjacentElements = new Array();
        this.findHorizontalAdjacentBlocks(separator, topAdjacentElements, bottomAdjacentElements);
        if (topAdjacentElements.length < 1 || bottomAdjacentElements.length < 1) {
            return;
        }
        var weightDecreased = false;
        for (var _i = 0, topAdjacentElements_4 = topAdjacentElements; _i < topAdjacentElements_4.length; _i++) {
            var top_4 = topAdjacentElements_4[_i];
            for (var _a = 0, bottomAdjacentElements_4 = bottomAdjacentElements; _a < bottomAdjacentElements_4.length; _a++) {
                var bottom = bottomAdjacentElements_4[_a];
                if (top_4.getBox() instanceof TextBox &&
                    bottom.getBox() instanceof TextBox) {
                    separator.weight += 2;
                    weightDecreased = true;
                    break;
                }
            }
            if (weightDecreased) {
                break;
            }
        }
    };
    /**
     * @return the _horizontalSeparators
     */
    VipsSeparatorNonGraphicsDetector.prototype.getHorizontalSeparators = function () {
        return this._horizontalSeparators;
    };
    VipsSeparatorNonGraphicsDetector.prototype.setHorizontalSeparators = function (separators) {
        while (this._horizontalSeparators.length > 0) {
            this._horizontalSeparators.pop();
        }
        for (var _i = 0, separators_2 = separators; _i < separators_2.length; _i++) {
            var sep = separators_2[_i];
            this._horizontalSeparators.push(sep);
        }
    };
    VipsSeparatorNonGraphicsDetector.prototype.setVerticalSeparators = function (separators) {
        while (this._verticalSeparators.length > 0) {
            this._verticalSeparators.pop();
        }
        for (var _i = 0, separators_3 = separators; _i < separators_3.length; _i++) {
            var sep = separators_3[_i];
            this._verticalSeparators.push(sep);
        }
    };
    /**
     * @return the _verticalSeparators
     */
    VipsSeparatorNonGraphicsDetector.prototype.getVerticalSeparators = function () {
        return this._verticalSeparators;
    };
    VipsSeparatorNonGraphicsDetector.prototype.setCleanUpSeparators = function (threshold) {
        this._cleanSeparatorsThreshold = threshold;
    };
    return VipsSeparatorNonGraphicsDetector;
}());
///<reference path="Vips.ts"/>
/**
 * VIPS example application.
 * @author Lars Meyer
 * @author Tomas Popela
 */
var VipsTester = /** @class */ (function () {
    function VipsTester() {
    }
    VipsTester.prototype.main = function (filename, doc) {
        try {
            var vips = new Vips(filename);
            // set permitted degree of coherence
            vips.setPredefinedDoC(doc);
            // start segmentation on page
            return vips.performSegmentation();
        }
        catch (Error) {
            console.error(Error.message);
            console.error(Error.stack);
        }
    };
    return VipsTester;
}());
///<reference path="VipsBlock.ts"/>
///<reference path="Separator.ts"/>
/**
 * Class that represents a visual structure.
 * @author Tomas Popela
 * @author Lars Meyer
 */
var VisualStructure = /** @class */ (function () {
    function VisualStructure() {
        this._nestedBlocks = null;
        this._childrenVisualStructures = null;
        this._horizontalSeparators = null;
        this._verticalSeparators = null;
        this._width = 0;
        this._height = 0;
        this._x = 0;
        this._y = 0;
        this._doC = 12;
        this._containImg = -1;
        this._containP = -1;
        this._textLength = -1;
        this._linkTextLength = -1;
        this._containTable = false;
        this._id = null;
        this._tmpSrcIndex = 0;
        this._srcIndex = 0;
        this._minimalDoC = 0;
        this._nestedBlocks = new Array();
        this._childrenVisualStructures = new Array();
        this._horizontalSeparators = new Array();
        this._verticalSeparators = new Array();
    }
    /**
     * @return Nested blocks in structure
     */
    VisualStructure.prototype.getNestedBlocks = function () {
        return this._nestedBlocks;
    };
    /**
     * Adds block to nested blocks
     * @param nestedBlock New block
     */
    VisualStructure.prototype.addNestedBlock = function (nestedBlock) {
        this._nestedBlocks.push(nestedBlock);
    };
    /**
     * Sets blocks as nested blocks
     * @param vipsBlocks
     */
    VisualStructure.prototype.setNestedBlocks = function (vipsBlocks) {
        this._nestedBlocks = vipsBlocks;
    };
    /**
     * Clears nested blocks list
     */
    VisualStructure.prototype.clearNestedBlocks = function () {
        while (this._nestedBlocks.length > 0) {
            this._nestedBlocks.pop();
        }
    };
    /**
     * Adds new child to visual structure children
     * @param visualStructure New child
     */
    VisualStructure.prototype.addChild = function (visualStructure) {
        this._childrenVisualStructures.push(visualStructure);
    };
    /**
     * Adds new child to visual structure at given index
     * @param visualStructure New child
     * @param index Index
     */
    VisualStructure.prototype.addChildAt = function (visualStructure, index) {
        this._childrenVisualStructures.splice(index, 0, visualStructure);
    };
    /**
     * Returns all children structures
     * @return Children structures
     */
    VisualStructure.prototype.getChildrenVisualStructures = function () {
        return this._childrenVisualStructures;
    };
    /**
     * Returns all horizontal separators form structure
     * @return List of horizontal separators
     */
    VisualStructure.prototype.getHorizontalSeparators = function () {
        return this._horizontalSeparators;
    };
    /**
     * Adds separators to horizontal separators of structure
     * @param horizontalSeparators
     */
    VisualStructure.prototype.addHorizontalSeparators = function (horizontalSeparators) {
        for (var _i = 0, horizontalSeparators_1 = horizontalSeparators; _i < horizontalSeparators_1.length; _i++) {
            var sep = horizontalSeparators_1[_i];
            this._horizontalSeparators.push(sep);
        }
    };
    /**
     * Returns structure's X coordinate
     * @return X coordinate
     */
    VisualStructure.prototype.getX = function () {
        return this._x;
    };
    /**
     * Returns structure's Y coordinate
     * @return Y coordinate
     */
    VisualStructure.prototype.getY = function () {
        return this._y;
    };
    /**
     * Sets X coordinate
     * @param x X coordinate
     */
    VisualStructure.prototype.setX = function (x) {
        this._x = x;
    };
    /**
     * Sets Y coordinate
     * @param y Y coordinate
     */
    VisualStructure.prototype.setY = function (y) {
        this._y = y;
    };
    /**
     * Sets width of visual structure
     * @param width Width
     */
    VisualStructure.prototype.setWidth = function (width) {
        this._width = width;
    };
    /**
     * Sets height of visual structure
     * @param height Height
     */
    VisualStructure.prototype.setHeight = function (height) {
        this._height = height;
    };
    /**
     * Returns width of visual structure
     * @return Visual structure's width
     */
    VisualStructure.prototype.getWidth = function () {
        return this._width;
    };
    /**
     * Returns height of visual structure
     * @return Visual structure's height
     */
    VisualStructure.prototype.getHeight = function () {
        return this._height;
    };
    /**
     * Returns list of all vertical separators in visual structure
     * @return List of vertical separators
     */
    VisualStructure.prototype.getVerticalSeparators = function () {
        return this._verticalSeparators;
    };
    /**
     * Sets id of visual structure
     * @param id Id
     */
    VisualStructure.prototype.setId = function (id) {
        this._id = id;
    };
    /**
     * Returns id of visual structure
     * @return Visual structure's id
     */
    VisualStructure.prototype.getId = function () {
        return this._id;
    };
    /**
     * Sets visual structure's degree of coherence DoC
     * @param doC Degree of coherence - DoC
     */
    VisualStructure.prototype.setDoC = function (doC) {
        this._doC = doC;
    };
    /**
     * Returns structure's degree of coherence DoC
     * @return Degree of coherence - DoC
     */
    VisualStructure.prototype.getDoC = function () {
        return this._doC;
    };
    /**
     * Finds minimal DoC in all children visual structures
     * @param visualStructure Given visual structure
     */
    VisualStructure.prototype.findMinimalDoC = function (visualStructure) {
        if (!(visualStructure.getId() === "1")) {
            if (visualStructure.getDoC() < this._minimalDoC)
                this._minimalDoC = visualStructure.getDoC();
        }
        for (var _i = 0, _a = visualStructure.getChildrenVisualStructures(); _i < _a.length; _i++) {
            var child = _a[_i];
            this.findMinimalDoC(child);
        }
    };
    /**
     * Updates DoC to normalized DoC
     */
    VisualStructure.prototype.updateToNormalizedDoC = function () {
        this._doC = 12;
        for (var _i = 0, _a = this._horizontalSeparators; _i < _a.length; _i++) {
            var separator = _a[_i];
            if (separator.normalizedWeight < this._doC)
                this._doC = separator.normalizedWeight;
        }
        for (var _b = 0, _c = this._verticalSeparators; _b < _c.length; _b++) {
            var separator = _c[_b];
            if (separator.normalizedWeight < this._doC)
                this._doC = separator.normalizedWeight;
        }
        if (this._doC == 12) {
            for (var _d = 0, _e = this._nestedBlocks; _d < _e.length; _d++) {
                var nestedBlock = _e[_d];
                if (nestedBlock.getDoC() < this._doC)
                    this._doC = nestedBlock.getDoC();
            }
        }
        this._minimalDoC = 12;
        this.findMinimalDoC(this);
        if (this._minimalDoC < this._doC) {
            this._doC = this._minimalDoC;
        }
    };
    /**
     * Sets visual structure order
     * @param order Order
     */
    VisualStructure.prototype.setOrder = function (order) {
        this._order = order;
    };
    /**
     * Adds list of separators to visual structure vertical separators list.
     * @param verticalSeparators
     */
    VisualStructure.prototype.addVerticalSeparators = function (verticalSeparators) {
        for (var _i = 0, verticalSeparators_1 = verticalSeparators; _i < verticalSeparators_1.length; _i++) {
            var sep = verticalSeparators_1[_i];
            this._verticalSeparators.push(sep);
        }
    };
    return VisualStructure;
}());
///<reference path="VipsBlock.ts"/>
///<reference path="VisualStructure.ts"/>
///<reference path="ElementBox.ts"/>
///<reference path="VipsSeparatorDetector.ts"/>
///<reference path="VipsSeparatorNonGraphicsDetector.ts"/>
/**
 * Class that constructs final visual structure of page.
 * @author Tomas Popela
 * @author Lars Meyer
 */
var VisualStructureConstructor = /** @class */ (function () {
    function VisualStructureConstructor(vipsBlocks, pDoC) {
        this._vipsBlocks = null;
        this._visualBlocks = null;
        this._visualStructure = null;
        this._horizontalSeparators = null;
        this._verticalSeparators = null;
        this._pageWidth = 0;
        this._pageHeight = 0;
        this._srcOrder = 1;
        this._iteration = 0;
        this._pDoC = 5;
        this._maxDoC = 11;
        this._minDoC = 11;
        this._horizontalSeparators = new Array();
        this._verticalSeparators = new Array();
        if (!(typeof pDoC === 'undefined')) {
            this.setPDoC(pDoC);
        }
        if (!(typeof vipsBlocks === 'undefined')) {
            this._vipsBlocks = vipsBlocks;
        }
    }
    /**
     * Sets Permitted Degree of Coherence
     * @param pDoC Permitted Degree of Coherence
     */
    VisualStructureConstructor.prototype.setPDoC = function (pDoC) {
        if (pDoC <= 0 || pDoC > 11) {
            console.error("pDoC value must be between 1 and 11! Not " + pDoC + "!");
            return;
        }
        else {
            this._pDoC = pDoC;
        }
    };
    /**
     * Tries to construct visual structure
     */
    VisualStructureConstructor.prototype.constructVisualStructure = function () {
        this._iteration++;
        // in first iterations we try to find vertical separators before horizontal
        if (this._iteration < 4) {
            this.constructVerticalVisualStructure();
            this.constructHorizontalVisualStructure();
            this.constructVerticalVisualStructure();
            this.constructHorizontalVisualStructure();
        }
        else {
            // and now we are trying to find horizontal before vertical separators
            this.constructHorizontalVisualStructure();
            this.constructVerticalVisualStructure();
        }
        if (this._iteration != 1) {
            this.updateSeparators();
        }
        // sets order to visual structure
        this._srcOrder = 1;
        this.setOrder(this._visualStructure);
    };
    /**
     * Constructs visual structure with blocks and horizontal separators
     */
    VisualStructureConstructor.prototype.constructHorizontalVisualStructure = function () {
        // first run
        if (this._visualStructure == null) {
            var detector = new VipsSeparatorNonGraphicsDetector(this._pageWidth, this._pageHeight);
            detector.setCleanUpSeparators(3);
            detector.setVipsBlock(this._vipsBlocks);
            detector.setVisualBlocks(this._visualBlocks);
            detector.detectHorizontalSeparators();
            this._horizontalSeparators = detector.getHorizontalSeparators();
            this._visualStructure = new VisualStructure();
            this._visualStructure.setId("1");
            this._visualStructure.setNestedBlocks(this._visualBlocks);
            this._visualStructure.setWidth(this._pageWidth);
            this._visualStructure.setHeight(this._pageHeight);
            for (var _i = 0, _a = this._horizontalSeparators; _i < _a.length; _i++) {
                var separator = _a[_i];
                separator.setLeftUp(this._visualStructure.getX(), separator.startPoint);
                separator.setRightDown(this._visualStructure.getX() + this._visualStructure.getWidth(), separator.endPoint);
            }
            this.constructWithHorizontalSeparators(this._visualStructure);
        }
        else {
            var listStructures = new Array();
            this.findListVisualStructures(this._visualStructure, listStructures);
            for (var _b = 0, listStructures_1 = listStructures; _b < listStructures_1.length; _b++) {
                var childVisualStructure = listStructures_1[_b];
                var detector = new VipsSeparatorNonGraphicsDetector(this._pageWidth, this._pageHeight);
                detector.setCleanUpSeparators(4);
                detector.setVipsBlock(this._vipsBlocks);
                detector.setVisualBlocks(childVisualStructure.getNestedBlocks());
                detector.detectHorizontalSeparators();
                this._horizontalSeparators = detector.getHorizontalSeparators();
                for (var _c = 0, _d = this._horizontalSeparators; _c < _d.length; _c++) {
                    var separator = _d[_c];
                    separator.setLeftUp(childVisualStructure.getX(), separator.startPoint);
                    separator.setRightDown(childVisualStructure.getX() + childVisualStructure.getWidth(), separator.endPoint);
                }
                this.constructWithHorizontalSeparators(childVisualStructure);
            }
        }
    };
    /**
     * Constructs visual structure with blocks and vertical separators
     */
    VisualStructureConstructor.prototype.constructVerticalVisualStructure = function () {
        // first run
        if (this._visualStructure === null) {
            var detector = new VipsSeparatorNonGraphicsDetector(this._pageWidth, this._pageHeight);
            detector.setCleanUpSeparators(3);
            detector.setVipsBlock(this._vipsBlocks);
            detector.setVisualBlocks(this._visualBlocks);
            detector.detectVerticalSeparators();
            this._verticalSeparators = detector.getVerticalSeparators();
            // the Java implementation sorts again here; skipped here because sorting is performed in detectVerticalSeparators()
            this._visualStructure = new VisualStructure();
            this._visualStructure.setId("1");
            this._visualStructure.setNestedBlocks(this._visualBlocks);
            this._visualStructure.setWidth(this._pageWidth);
            this._visualStructure.setHeight(this._pageHeight);
            for (var _i = 0, _a = this._verticalSeparators; _i < _a.length; _i++) {
                var separator = _a[_i];
                separator.setLeftUp(separator.startPoint, this._visualStructure.getY());
                separator.setRightDown(separator.endPoint, this._visualStructure.getY() + this._visualStructure.getHeight());
            }
            this.constructWithVerticalSeparators(this._visualStructure);
        }
        else {
            var listStructures = new Array();
            this.findListVisualStructures(this._visualStructure, listStructures);
            for (var _b = 0, listStructures_2 = listStructures; _b < listStructures_2.length; _b++) {
                var childVisualStructure = listStructures_2[_b];
                var detector = new VipsSeparatorNonGraphicsDetector(this._pageWidth, this._pageHeight);
                detector.setCleanUpSeparators(4);
                detector.setVipsBlock(this._vipsBlocks);
                detector.setVisualBlocks(childVisualStructure.getNestedBlocks());
                detector.detectVerticalSeparators();
                this._verticalSeparators = detector.getVerticalSeparators();
                for (var _c = 0, _d = this._verticalSeparators; _c < _d.length; _c++) {
                    var separator = _d[_c];
                    separator.setLeftUp(separator.startPoint, childVisualStructure.getY());
                    separator.setRightDown(separator.endPoint, childVisualStructure.getY() + childVisualStructure.getHeight());
                }
                this.constructWithVerticalSeparators(childVisualStructure);
            }
        }
    };
    /**
     * Performs actual constructing of visual structure with horizontal separators
     * @param actualStructure Actual visual structure
     */
    VisualStructureConstructor.prototype.constructWithHorizontalSeparators = function (actualStructure) {
        if (actualStructure.getNestedBlocks().length === 0 || this._horizontalSeparators.length === 0) {
            return;
        }
        var topVisualStructure = null;
        var bottomVisualStructure = null;
        var nestedBlocks = null;
        //construct children visual structures
        for (var _i = 0, _a = this._horizontalSeparators; _i < _a.length; _i++) {
            var separator = _a[_i];
            if (actualStructure.getChildrenVisualStructures().length === 0) {
                topVisualStructure = new VisualStructure();
                topVisualStructure.setX(actualStructure.getX());
                topVisualStructure.setY(actualStructure.getY());
                topVisualStructure.setHeight((separator.startPoint - 1) - actualStructure.getY());
                topVisualStructure.setWidth(actualStructure.getWidth());
                actualStructure.addChild(topVisualStructure);
                bottomVisualStructure = new VisualStructure();
                bottomVisualStructure.setX(actualStructure.getX());
                bottomVisualStructure.setY(separator.endPoint + 1);
                bottomVisualStructure.setHeight((actualStructure.getHeight() + actualStructure.getY()) - separator.endPoint - 1);
                bottomVisualStructure.setWidth(actualStructure.getWidth());
                actualStructure.addChild(bottomVisualStructure);
                nestedBlocks = actualStructure.getNestedBlocks();
            }
            else {
                var oldStructure = null;
                for (var _b = 0, _c = actualStructure.getChildrenVisualStructures(); _b < _c.length; _b++) {
                    var childVisualStructure = _c[_b];
                    if (separator.startPoint >= childVisualStructure.getY() &&
                        separator.endPoint <= (childVisualStructure.getY() + childVisualStructure.getHeight())) {
                        topVisualStructure = new VisualStructure();
                        topVisualStructure.setX(childVisualStructure.getX());
                        topVisualStructure.setY(childVisualStructure.getY());
                        topVisualStructure.setHeight((separator.startPoint - 1) - childVisualStructure.getY());
                        topVisualStructure.setWidth(childVisualStructure.getWidth());
                        var index = actualStructure.getChildrenVisualStructures().indexOf(childVisualStructure);
                        actualStructure.addChildAt(topVisualStructure, index);
                        bottomVisualStructure = new VisualStructure();
                        bottomVisualStructure.setX(childVisualStructure.getX());
                        bottomVisualStructure.setY(separator.endPoint + 1);
                        var height = (childVisualStructure.getHeight() + childVisualStructure.getY()) - separator.endPoint - 1;
                        bottomVisualStructure.setHeight(height);
                        bottomVisualStructure.setWidth(childVisualStructure.getWidth());
                        actualStructure.addChildAt(bottomVisualStructure, index + 1);
                        oldStructure = childVisualStructure;
                        break;
                    }
                }
                if (oldStructure != null) {
                    nestedBlocks = oldStructure.getNestedBlocks();
                    actualStructure.getChildrenVisualStructures().splice(actualStructure.getChildrenVisualStructures().indexOf(oldStructure), 1);
                }
            }
            if (topVisualStructure == null || bottomVisualStructure == null) {
                return;
            }
            for (var _d = 0, nestedBlocks_1 = nestedBlocks; _d < nestedBlocks_1.length; _d++) {
                var vipsBlock = nestedBlocks_1[_d];
                if (vipsBlock.getElementBox() != null) {
                    if (vipsBlock.getElementBox().getElement().getBoundingClientRect().top <= separator.startPoint) {
                        topVisualStructure.addNestedBlock(vipsBlock);
                    }
                    else {
                        bottomVisualStructure.addNestedBlock(vipsBlock);
                    }
                }
            }
            topVisualStructure = null;
            bottomVisualStructure = null;
        }
        // set id for visual structures
        var iterator = 1;
        for (var _e = 0, _f = actualStructure.getChildrenVisualStructures(); _e < _f.length; _e++) {
            var visualStructure = _f[_e];
            visualStructure.setId(actualStructure.getId() + "-" + String(iterator));
            iterator++;
        }
        var allSeparatorsInBlock = new Array();
        for (var _g = 0, _h = this._horizontalSeparators; _g < _h.length; _g++) {
            var sep = _h[_g];
            allSeparatorsInBlock.push(sep);
        }
        //remove all children separators
        for (var _j = 0, _k = actualStructure.getChildrenVisualStructures(); _j < _k.length; _j++) {
            var vs = _k[_j];
            while (vs.getHorizontalSeparators().length > 0) {
                vs.getHorizontalSeparators().pop();
            }
        }
        //save all horizontal separators in my region
        actualStructure.addHorizontalSeparators(this._horizontalSeparators);
    };
    /**
     * Performs actual constructing of visual structure with vertical separators
     * @param actualStructure Actual visual structure
     */
    VisualStructureConstructor.prototype.constructWithVerticalSeparators = function (actualStructure) {
        if (actualStructure.getNestedBlocks().length === 0 || this._verticalSeparators.length === 0) {
            return;
        }
        var leftVisualStructure = null;
        var rightVisualStructure = null;
        var nestedBlocks = null;
        //construct children visual structures
        for (var _i = 0, _a = this._verticalSeparators; _i < _a.length; _i++) {
            var separator = _a[_i];
            if (actualStructure.getChildrenVisualStructures().length === 0) {
                leftVisualStructure = new VisualStructure();
                leftVisualStructure.setX(actualStructure.getX());
                leftVisualStructure.setY(actualStructure.getY());
                leftVisualStructure.setHeight(actualStructure.getHeight());
                leftVisualStructure.setWidth((separator.startPoint - 1) - actualStructure.getX());
                actualStructure.addChild(leftVisualStructure);
                rightVisualStructure = new VisualStructure();
                rightVisualStructure.setX(separator.endPoint + 1);
                rightVisualStructure.setY(actualStructure.getY());
                rightVisualStructure.setHeight(actualStructure.getHeight());
                rightVisualStructure.setWidth((actualStructure.getWidth() + actualStructure.getX()) - separator.endPoint - 1);
                actualStructure.addChild(rightVisualStructure);
                nestedBlocks = actualStructure.getNestedBlocks();
            }
            else {
                var oldStructure = null;
                for (var _b = 0, _c = actualStructure.getChildrenVisualStructures(); _b < _c.length; _b++) {
                    var childVisualStructure = _c[_b];
                    if (separator.startPoint >= childVisualStructure.getX() &&
                        separator.endPoint <= (childVisualStructure.getX() + childVisualStructure.getWidth())) {
                        leftVisualStructure = new VisualStructure();
                        leftVisualStructure.setX(childVisualStructure.getX());
                        leftVisualStructure.setY(childVisualStructure.getY());
                        leftVisualStructure.setHeight(childVisualStructure.getHeight());
                        leftVisualStructure.setWidth((separator.startPoint - 1) - childVisualStructure.getX());
                        var index = actualStructure.getChildrenVisualStructures().indexOf(childVisualStructure);
                        actualStructure.addChildAt(leftVisualStructure, index);
                        rightVisualStructure = new VisualStructure();
                        rightVisualStructure.setX(separator.endPoint + 1);
                        rightVisualStructure.setY(childVisualStructure.getY());
                        rightVisualStructure.setHeight(childVisualStructure.getHeight());
                        var width = (childVisualStructure.getWidth() + childVisualStructure.getX()) - separator.endPoint - 1;
                        rightVisualStructure.setWidth(width);
                        actualStructure.addChildAt(rightVisualStructure, index + 1);
                        oldStructure = childVisualStructure;
                        break;
                    }
                }
                if (oldStructure != null) {
                    nestedBlocks = oldStructure.getNestedBlocks();
                    actualStructure.getChildrenVisualStructures().splice(actualStructure.getChildrenVisualStructures().indexOf(oldStructure), 1);
                }
            }
            if (leftVisualStructure == null || rightVisualStructure == null) {
                return;
            }
            for (var _d = 0, nestedBlocks_2 = nestedBlocks; _d < nestedBlocks_2.length; _d++) {
                var vipsBlock = nestedBlocks_2[_d];
                if (vipsBlock.getElementBox() != null) {
                    if (vipsBlock.getElementBox().getElement().getBoundingClientRect().left <= separator.startPoint) {
                        leftVisualStructure.addNestedBlock(vipsBlock);
                    }
                    else {
                        rightVisualStructure.addNestedBlock(vipsBlock);
                    }
                }
            }
            leftVisualStructure = null;
            rightVisualStructure = null;
        }
        // set id for visual structures
        var iterator = 1;
        for (var _e = 0, _f = actualStructure.getChildrenVisualStructures(); _e < _f.length; _e++) {
            var visualStructure = _f[_e];
            visualStructure.setId(actualStructure.getId() + "-" + String(iterator));
            iterator++;
        }
        var allSeparatorsInBlock = new Array();
        for (var _g = 0, _h = this._verticalSeparators; _g < _h.length; _g++) {
            var sep = _h[_g];
            allSeparatorsInBlock.push(sep);
        }
        //remove all children separators
        for (var _j = 0, _k = actualStructure.getChildrenVisualStructures(); _j < _k.length; _j++) {
            var vs = _k[_j];
            while (vs.getVerticalSeparators().length > 0) {
                vs.getVerticalSeparators().pop();
            }
        }
        //save all vertical separators in my region
        actualStructure.addVerticalSeparators(this._verticalSeparators);
    };
    /**
     * Sets page's size
     * @param width Page's width
     * @param height Page's height
     */
    VisualStructureConstructor.prototype.setPageSize = function (width, height) {
        this._pageHeight = height;
        this._pageWidth = width;
    };
    /**
     * @return Returns final visual structure
     */
    VisualStructureConstructor.prototype.getVisualStructure = function () {
        return this._visualStructure;
    };
    /**
     * Finds all visual blocks in VipsBlock structure
     * @param vipsBlock Actual VipsBlock
     * @param results	Results
     */
    VisualStructureConstructor.prototype.findVisualBlocks = function (vipsBlock, results) {
        if (vipsBlock.isVisualBlock()) {
            results.push(vipsBlock);
        }
        for (var _i = 0, _a = vipsBlock.getChildren(); _i < _a.length; _i++) {
            var child = _a[_i];
            this.findVisualBlocks(child, results);
        }
    };
    /**
     * Sets VipsBlock structure and also finds and saves all visual blocks from it
     * @param vipsBlocks VipsBlock structure
     */
    VisualStructureConstructor.prototype.setVipsBlocks = function (vipsBlocks) {
        this._vipsBlocks = vipsBlocks;
        this._visualBlocks = new Array();
        this.findVisualBlocks(vipsBlocks, this._visualBlocks);
    };
    /**
     * Finds list visual structures in visual structure tree
     * @param visualStructure Actual structure
     * @param results Results
     */
    VisualStructureConstructor.prototype.findListVisualStructures = function (visualStructure, results) {
        if (visualStructure.getChildrenVisualStructures().length === 0) {
            results.push(visualStructure);
        }
        for (var _i = 0, _a = visualStructure.getChildrenVisualStructures(); _i < _a.length; _i++) {
            var child = _a[_i];
            this.findListVisualStructures(child, results);
        }
    };
    /**
     * Replaces given old blocks with given new ones
     * @param oldBlocks	List of old blocks
     * @param newBlocks List of new blocks
     * @param actualStructure Actual Structure
     * @param pathStructures Path from structure to root of the structure
     */
    VisualStructureConstructor.prototype.replaceBlocksInPredecessors = function (oldBlocks, newBlocks, actualStructure, pathStructures) {
        for (var _i = 0, _a = actualStructure.getChildrenVisualStructures(); _i < _a.length; _i++) {
            var child = _a[_i];
            this.replaceBlocksInPredecessors(oldBlocks, newBlocks, child, pathStructures);
        }
        for (var _b = 0, pathStructures_1 = pathStructures; _b < pathStructures_1.length; _b++) {
            var structureId = pathStructures_1[_b];
            if (actualStructure.getId() === structureId) {
                var tempBlocks = new Array();
                for (var _c = 0, _d = actualStructure.getNestedBlocks(); _c < _d.length; _c++) {
                    var nestedBlock = _d[_c];
                    tempBlocks.push(nestedBlock);
                }
                for (var _e = 0, tempBlocks_1 = tempBlocks; _e < tempBlocks_1.length; _e++) {
                    var block = tempBlocks_1[_e];
                    for (var _f = 0, oldBlocks_1 = oldBlocks; _f < oldBlocks_1.length; _f++) {
                        var oldBlock = oldBlocks_1[_f];
                        if (block === oldBlock) {
                            actualStructure.getNestedBlocks().splice(actualStructure.getNestedBlocks().indexOf(block), 1);
                        }
                    }
                }
                for (var _g = 0, newBlocks_1 = newBlocks; _g < newBlocks_1.length; _g++) {
                    var newBlock = newBlocks_1[_g];
                    actualStructure.addNestedBlock(newBlock);
                }
            }
        }
    };
    /**
     * Generates element's ids for elements that are on path
     * @param path (Start visual structure id)
     * @return List of ids
     */
    VisualStructureConstructor.prototype.generatePathStructures = function (path) {
        var pathStructures = new Array();
        var aaa = path.split("-");
        var tmp = "";
        for (var i = 0; i < aaa.length - 1; i++) {
            tmp.concat(aaa[i]);
            pathStructures.push(tmp);
            tmp += "-";
        }
        return pathStructures;
    };
    /**
     * Updates VipsBlock structure with the new one and also updates visual blocks on page
     * @param vipsBlocks New VipsBlock structure
     */
    VisualStructureConstructor.prototype.updateVipsBlocks = function (vipsBlocks) {
        this.setVipsBlocks(vipsBlocks);
        var listsVisualStructures = new Array();
        var oldNestedBlocks = new Array();
        this.findListVisualStructures(this._visualStructure, listsVisualStructures);
        for (var _i = 0, listsVisualStructures_1 = listsVisualStructures; _i < listsVisualStructures_1.length; _i++) {
            var visualStructure = listsVisualStructures_1[_i];
            for (var _a = 0, _b = visualStructure.getNestedBlocks(); _a < _b.length; _a++) {
                var oldNestedBlock = _b[_a];
                oldNestedBlocks.push(oldNestedBlock);
            }
            visualStructure.clearNestedBlocks();
            for (var _c = 0, _d = this._visualBlocks; _c < _d.length; _c++) {
                var visualBlock = _d[_c];
                var elementBox = visualBlock.getElementBox();
                if (elementBox != null) {
                    if (elementBox.getElement().getBoundingClientRect().left >= visualStructure.getX() &&
                        elementBox.getElement().getBoundingClientRect().left <= (visualStructure.getX() + visualStructure.getWidth())) {
                        if (elementBox.getElement().getBoundingClientRect().top >= visualStructure.getY() &&
                            elementBox.getElement().getBoundingClientRect().top <= (visualStructure.getY() + visualStructure.getHeight())) {
                            if (elementBox.getElement().getBoundingClientRect().height != 0 && elementBox.getElement().getBoundingClientRect().width != 0) {
                                visualStructure.addNestedBlock(visualBlock);
                            }
                        }
                    }
                }
            }
            if (visualStructure.getNestedBlocks().length === 0) {
                for (var _e = 0, oldNestedBlocks_1 = oldNestedBlocks; _e < oldNestedBlocks_1.length; _e++) {
                    var oldNestedBlock = oldNestedBlocks_1[_e];
                    visualStructure.addNestedBlock(oldNestedBlock);
                    this._visualBlocks.push(oldNestedBlock);
                }
            }
            var path = visualStructure.getId();
            var pathStructures = this.generatePathStructures(path);
            this.replaceBlocksInPredecessors(oldNestedBlocks, visualStructure.getNestedBlocks(), this._visualStructure, pathStructures);
            while (oldNestedBlocks.length > 0) {
                oldNestedBlocks.pop();
            }
        }
    };
    /**
     * Sets order to visual structure
     * @param visualStructure
     */
    VisualStructureConstructor.prototype.setOrder = function (visualStructure) {
        visualStructure.setOrder(this._srcOrder);
        this._srcOrder++;
        for (var _i = 0, _a = visualStructure.getChildrenVisualStructures(); _i < _a.length; _i++) {
            var child = _a[_i];
            this.setOrder(child);
        }
    };
    /**
     * Finds all horizontal and vertical separators in given structure
     * @param visualStructure Given structure
     * @param result Results
     */
    VisualStructureConstructor.prototype.getAllSeparators = function (visualStructure, result) {
        this.findAllHorizontalSeparators(visualStructure, result);
        this.findAllVerticalSeparators(visualStructure, result);
        this.removeDuplicates(result);
    };
    /**
     * Finds all horizontal separators in given structure
     * @param visualStructure Given structure
     * @param result Results
     */
    VisualStructureConstructor.prototype.findAllHorizontalSeparators = function (visualStructure, result) {
        for (var _i = 0, _a = visualStructure.getHorizontalSeparators(); _i < _a.length; _i++) {
            var sep = _a[_i];
            result.push(sep);
        }
        for (var _b = 0, _c = visualStructure.getChildrenVisualStructures(); _b < _c.length; _b++) {
            var child = _c[_b];
            this.findAllHorizontalSeparators(child, result);
        }
    };
    /**
     * Finds all vertical separators in given structure
     * @param visualStructure Given structure
     * @param result Results
     */
    VisualStructureConstructor.prototype.findAllVerticalSeparators = function (visualStructure, result) {
        for (var _i = 0, _a = visualStructure.getVerticalSeparators(); _i < _a.length; _i++) {
            var sep = _a[_i];
            result.push(sep);
        }
        for (var _b = 0, _c = visualStructure.getChildrenVisualStructures(); _b < _c.length; _b++) {
            var child = _c[_b];
            this.findAllVerticalSeparators(child, result);
        }
    };
    /**
     * Updates separators when replacing blocks
     * @param visualStructure Actual visual structure
     */
    VisualStructureConstructor.prototype.updateSeparatorsInStructure = function (visualStructure) {
        var adjacentBlocks = new Array();
        var allSeparators = new Array();
        for (var _i = 0, _a = visualStructure.getHorizontalSeparators(); _i < _a.length; _i++) {
            var sep = _a[_i];
            allSeparators.push(sep);
        }
        // separator between blocks
        for (var _b = 0, allSeparators_1 = allSeparators; _b < allSeparators_1.length; _b++) {
            var separator = allSeparators_1[_b];
            var aboveBottom = 0;
            var belowTop = this._pageHeight;
            var above = null;
            var below = null;
            while (adjacentBlocks.length > 0) {
                adjacentBlocks.pop();
            }
            for (var _c = 0, _d = visualStructure.getNestedBlocks(); _c < _d.length; _c++) {
                var block = _d[_c];
                if (block.getElementBox() != null) {
                    var top_1 = block.getElementBox().getElement().getBoundingClientRect().top;
                    var bottom = block.getElementBox().getElement().getBoundingClientRect().bottom;
                    if (bottom <= separator.startPoint && bottom > aboveBottom) {
                        aboveBottom = bottom;
                        above = block;
                    }
                    if (top_1 >= separator.endPoint && top_1 < belowTop) {
                        belowTop = top_1;
                        below = block;
                        adjacentBlocks.push(block);
                    }
                }
            }
            if (above == null || below == null) {
                continue;
            }
            adjacentBlocks.push(above);
            adjacentBlocks.push(below);
            if (aboveBottom == separator.startPoint - 1 && belowTop == separator.endPoint + 1) {
                continue;
            }
            if (adjacentBlocks.length < 2) {
                continue;
            }
            var detector = new VipsSeparatorNonGraphicsDetector(this._pageWidth, this._pageHeight);
            detector.setCleanUpSeparators(3);
            if (this._iteration > 3) {
                detector.setCleanUpSeparators(6);
            }
            //detector.setVipsBlock(_vipsBlocks);
            detector.setVisualBlocks(adjacentBlocks);
            detector.detectHorizontalSeparators();
            var tempSeparators = new Array();
            for (var _e = 0, _f = visualStructure.getHorizontalSeparators(); _e < _f.length; _e++) {
                var sep = _f[_e];
                tempSeparators.push(sep);
            }
            if (detector.getHorizontalSeparators().length === 0) {
                continue;
            }
            var newSeparator = detector.getHorizontalSeparators()[0];
            newSeparator.setLeftUp(visualStructure.getX(), newSeparator.startPoint);
            newSeparator.setRightDown(visualStructure.getX() + visualStructure.getWidth(), newSeparator.endPoint);
            //remove all separators that are included in block
            for (var _g = 0, tempSeparators_1 = tempSeparators; _g < tempSeparators_1.length; _g++) {
                var other = tempSeparators_1[_g];
                if (other === separator) {
                    visualStructure.getHorizontalSeparators().splice(visualStructure.getHorizontalSeparators().indexOf(other) + 1, 0, newSeparator);
                    visualStructure.getHorizontalSeparators().splice(visualStructure.getHorizontalSeparators().indexOf(other), 1);
                    break;
                }
            }
        }
        // new blocks in separator
        for (var _h = 0, allSeparators_2 = allSeparators; _h < allSeparators_2.length; _h++) {
            var separator = allSeparators_2[_h];
            var blockTop = this._pageHeight;
            var blockDown = 0;
            while (adjacentBlocks.length > 0) {
                adjacentBlocks.pop();
            }
            for (var _j = 0, _k = visualStructure.getNestedBlocks(); _j < _k.length; _j++) {
                var block = _k[_j];
                if (block.getElementBox() != null) {
                    var top_2 = block.getElementBox().getElement().getBoundingClientRect().top;
                    var bottom = block.getElementBox().getElement().getBoundingClientRect().bottom;
                    // block is inside the separator
                    if (top_2 > separator.startPoint && bottom < separator.endPoint) {
                        adjacentBlocks.push(block);
                        if (top_2 < blockTop)
                            blockTop = top_2;
                        if (bottom > blockDown)
                            blockDown = bottom;
                    }
                }
            }
            if (adjacentBlocks.length === 0) {
                continue;
            }
            var detector = new VipsSeparatorNonGraphicsDetector(this._pageWidth, this._pageHeight);
            detector.setCleanUpSeparators(3);
            if (this._iteration > 3) {
                detector.setCleanUpSeparators(6);
            }
            detector.setVisualBlocks(adjacentBlocks);
            detector.detectHorizontalSeparators();
            var tempSeparators = new Array();
            for (var _l = 0, _m = visualStructure.getHorizontalSeparators(); _l < _m.length; _l++) {
                var sep = _m[_l];
                tempSeparators.push(sep);
            }
            var newSeparators = new Array();
            var newSeparatorTop = new Separator(separator.startPoint, blockTop - 1, separator.weight);
            newSeparatorTop.setLeftUp(visualStructure.getX(), newSeparatorTop.startPoint);
            newSeparatorTop.setRightDown(visualStructure.getX() + visualStructure.getWidth(), newSeparatorTop.endPoint);
            newSeparators.push(newSeparatorTop);
            var newSeparatorBottom = new Separator(blockDown + 1, separator.endPoint, separator.weight);
            newSeparatorBottom.setLeftUp(visualStructure.getX(), newSeparatorBottom.startPoint);
            newSeparatorBottom.setRightDown(visualStructure.getX() + visualStructure.getWidth(), newSeparatorBottom.endPoint);
            if (detector.getHorizontalSeparators().length != 0) {
                for (var _o = 0, _p = detector.getHorizontalSeparators(); _o < _p.length; _o++) {
                    var sep = _p[_o];
                    newSeparators.push(sep);
                }
            }
            newSeparators.push(newSeparatorBottom);
            //remove all separators that are included in block
            for (var _q = 0, tempSeparators_2 = tempSeparators; _q < tempSeparators_2.length; _q++) {
                var other = tempSeparators_2[_q];
                if (other === separator) {
                    var index = visualStructure.getHorizontalSeparators().indexOf(other) + 1;
                    for (var _r = 0, newSeparators_1 = newSeparators; _r < newSeparators_1.length; _r++) {
                        var sep = newSeparators_1[_r];
                        visualStructure.getHorizontalSeparators().splice(index, 0, sep);
                        index++;
                    }
                    while (visualStructure.getHorizontalSeparators().length > 0) {
                        visualStructure.getHorizontalSeparators().pop();
                    }
                    break;
                }
            }
        }
        for (var _s = 0, _t = visualStructure.getChildrenVisualStructures(); _s < _t.length; _s++) {
            var child = _t[_s];
            this.updateSeparatorsInStructure(child);
        }
    };
    /**
     * Updates separators on whole page
     */
    VisualStructureConstructor.prototype.updateSeparators = function () {
        this.updateSeparatorsInStructure(this._visualStructure);
    };
    /**
     * Removes duplicates from list of separators
     * @param separators
     */
    VisualStructureConstructor.prototype.removeDuplicates = function (separators) {
        var set = new Array();
        for (var _i = 0, separators_1 = separators; _i < separators_1.length; _i++) {
            var sep = separators_1[_i];
            if (set.indexOf(sep) == -1) {
                set.push(sep);
            }
        }
        while (separators.length > 0) {
            separators.pop();
        }
        for (var _a = 0, set_1 = set; _a < set_1.length; _a++) {
            var sep = set_1[_a];
            separators.push(sep);
        }
    };
    /**
     * Converts normalized weight of separator to DoC
     * @param value Normalized weight of separator
     * @return DoC
     */
    VisualStructureConstructor.prototype.getDoCValue = function (value) {
        if (value === 0) {
            return this._maxDoC;
        }
        return ((this._maxDoC + 1) - value);
    };
    /**
     * Normalizes separators' weights with linear normalization
     */
    VisualStructureConstructor.prototype.normalizeSeparatorsMinMax = function () {
        var separators = new Array();
        this.getAllSeparators(this._visualStructure, separators);
        var maxSep = new Separator(0, this._pageHeight);
        separators.push(maxSep);
        maxSep.weight = 40;
        separators.sort(function (a, b) { return a.weight - b.weight; });
        var minWeight = separators[0].weight;
        var maxWeight = separators[separators.length - 1].weight;
        for (var _i = 0, separators_2 = separators; _i < separators_2.length; _i++) {
            var separator = separators_2[_i];
            var normalizedValue = (separator.weight - minWeight) / (maxWeight - minWeight) * (11 - 1) + 1;
            separator.normalizedWeight = this.getDoCValue(Math.ceil(normalizedValue));
        }
        this.updateDoC(this._visualStructure);
        this._visualStructure.setDoC(1);
    };
    /**
     * Updates DoC of all visual structures nodes
     * @param visualStructure Visual Structure
     */
    VisualStructureConstructor.prototype.updateDoC = function (visualStructure) {
        for (var _i = 0, _a = visualStructure.getChildrenVisualStructures(); _i < _a.length; _i++) {
            var child = _a[_i];
            this.updateDoC(child);
        }
        visualStructure.updateToNormalizedDoC();
    };
    return VisualStructureConstructor;
}());

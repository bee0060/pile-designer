
/**
 * 绘制设计图
 * 
 * Written by maowenchao @ 2017-12
 * maowc@chinasap.cn
 * http://www.chinasapi.com
 */

(function (win, doc) {

    /**
     * 筛选单个 DOM 对象
     * 
     * @param {string} selector     选择器
     * @param {Element} [context]   筛选上下文
     */
    function qs(selector, context) {
        try {
            return (context || doc).querySelector(selector);
        } catch (e) {
            return null;
        }
    }

    /**
     * 筛选多个 DOM 对象
     * 
     * @param {string} selector     选择器
     * @param {Element} [context]   筛选上下文
     */
    function qsa(selector, context) {
        return Array.prototype.slice.call((context || doc).querySelectorAll(selector) || []);
    }

    function extend(target, src) {
        var key;

        if (target instanceof Object && src instanceof Object) {
            for (key in src) {
                target[key] = src[key];
            }
        }

        return target;
    }

    function assign() {
        var args = [].slice.call(arguments);
        var target;

        if (typeof Object.assign === 'function') {
            return Object.assign.apply(null, args);
        }
        else {
            return args.reduceRight(function (prev, current) {
                return extend(current, prev);
            }, {});
        }
    }

    /**
     * 事件绑定
     * 
     * @param {Element|Document}  el     指定响应事件的元素
     * @param {string}   type            事件类型，无需前缀 on
     * @param {EventListener} handler    事件处理回调
     */
    function on(el, type, handler) {
        if (el) {
            el.addEventListener(type, handler, false);
        }
    }

    /**
     * 手工触发指定事件
     * 
     * @param {Node} el      触发事件的元素
     * @param {string}  type     指定事件类型，无需前缀 on
     */
    function trigger(el, type) {
        if (el) {
            var event = document.createEvent('Event');

            event.initEvent(type, true, true);
            el.dispatchEvent(event);
        }
    }

    /**
     * 从指定元素中移除一个类
     * 
     * @param {Element}  el          移除类的元素
     * @param {string}   name        待移除的类名，仅限一个，同时移除多个类需多次调用本函数
     * @param {function} [callback]  执行移除样式类后执行的回调
     */
    function removeClass(el, name, callback) {
        var classList = [];
        var newClassList = [];
        var baseVal;

        if (!(el instanceof Element)) {
            return;
        }

        baseVal = typeof el.className['baseVal'] === 'string';

        if (baseVal) {
            classList = el.className['baseVal'].split(' ');
        }
        else {
            classList = el.className.split(' ');
        }

        classList.forEach(function (c) {
            if (c !== name) {
                newClassList.push(c);
            }
        });

        if (typeof callback == 'function') {
            callback(newClassList);
        }

        if (newClassList.length === 0) {
            el.removeAttribute('class');
        }
        else {
            if (baseVal) {
                el.className['baseVal'] = newClassList.join(' ');
            }
            else {
                el.className = newClassList.join(' ');
            }
        }
    }

    /**
     * 向指定元素添加类
     * 
     * @param {Element} el  添加类的元素
     * @param {string}  name 指定添加的类名，仅限一个，同时添加多个类需多次调用本函数
     */
    function addClass(el, name) {
        if (el) {
            removeClass(el, name, function (classList) {
                classList.push(name);
            });
        }
    }

    function hasClass(el, selector) {
        if (el.matches) {
            return el.matches(selector);
        }
        else if (el.matchesSelector) {
            return el.matchesSelector(selector);
        }
        else if (el.webkitMatchesSelector) {
            return el.webkitMatchesSelector(selector);
        }
        else if (el.msMatchesSelector) {
            return el.msMatchesSelector(selector);
        }
        else if (el.mozMatchesSelector) {
            return el.mozMatchesSelector(selector);
        }
        else if (el.oMatchesSelector) {
            return el.oMatchesSelector(selector);
        }
    }

    /**
     * 解释URL（？号后的）搜索字符串为对象
     * 
     * @param {string} [url] 指定URL
     */
    function urlSearch(url) {
        var result = { length: 0 };
        var set = (typeof url == 'string' ? url : doc.location.search).match(/\w+\=[^&|$]*/g);

        if (set != null) {
            set.forEach(function (description) {
                var d = description.match(/(\w+)\=(.*)/);

                d[2] = decodeURI(d[2]);
                result[d[1]] = /^\-?(\d*\.)?\d+(\e\-?\d+)?$/.test(d[2]) ? float(d[2]) : d[2];
            });

            result.length = set.length;
        }

        return result;
    }

    /**
     * 发起 ajax 请求
     * 
     * @param {object} o 发起 ajax 请求的配置对象
     */
    function ajax(o) {
        var req = new XMLHttpRequest();
        var post = [];
        var contentType = {
            json: 'application/json',
            form: 'application/x-www-form-urlencoded; charset=UTF-8',
            text: 'text/plain',
            html: 'text/html',
            xml: 'application/xml',
            svg: 'image/svg+xml'
        };

        if (typeof o.data == 'object') {
            Object.keys(o.data).forEach(function (key) {
                post.push(encodeURIComponent(key) + '=' + encodeURIComponent(o.data[key]));
            });

            o.data = post.join('&');
        }
        else {
            o.data = '';
        }

        o.type = o.type || 'json';
        o.async = (o.async === false ? false : true);

        req.open(o.method || 'GET', o.url, o.async, o.user || '', o.password || '');

        req.timeout = o.timeout || 0;
        req.onerror = o.fail;

        req.setRequestHeader('content-type', contentType[o.type]);

        if (Array.isArray(o.header)) {
            o.header.forEach(function (item) {
                req.setRequestHeader(item.name, item.value);
            });
        }

        req.onreadystatechange = function () {
            var text;

            if (req.readyState === 4) {
                if (req.status === 200 && typeof o.success == 'function') {
                    text = req.responseText;
                    o.success(typeof text == 'string' && o.type === 'json' ? JSON.parse(text) : text);
                }
                else {
                    typeof o.fail === 'function' && o.fail();
                }
            }
        }

        if (typeof o.before == 'function') {
            o.before(req);
        }

        req.send(o.data);

        return req;
    }

    function pad(num, len) {
        var n = num.toString().length;

        while (n < len) {
            num = '0' + num;
            n++;
        }

        return num;
    }

    function namedNewShape(str) {
        var match = str.match(/^(\D*)(\d+)(\D*)$/);

        if (match) {
            return match[1] + pad(parseInt(match[2]) + 1, match[2].length) + match[3];
        }

        return str;
    }

    /**
     * 简易消息展示，指定时间内自动隐藏
     * 
     * @param {string} msg          消息内容
     * @param {number} [timeout]    自动隐藏时间，单位毫秒，默认4秒（4000毫秒）
     */
    function message(msg, timeout) {
        var m = doc.createElement('div');

        assign(m.style, {
            position: 'absolute',
            left: '0',
            top: '0',
            right: '0',
            bottom: '0',
            width: '280px',
            height: '30px',
            lineHeight: '30px',
            textAlign: 'center',
            borderRadius: '10px',
            backgroundColor: '#000',
            padding: '15px',
            color: '#fff',
            opacity: '0.7',
            margin: 'auto'
        });

        m.textContent = msg;

        doc.body.appendChild(m);

        setTimeout(function () {
            if (typeof m.remove === 'function') {
                m.remove();
            }
            else {
                m.parentNode.removeChild(m);
            }
        }, timeout || 4000);
    }

    // 创建短随机字符串
    function randomString() {
        return Math.random().toString(36).substr(2);
    }

    function disablePageSelect() {
        on(doc, 'selectstart', function (e) {
            e.preventDefault();
            return false;
        });
    }

    // 禁用浏览器默认的页面缩放
    function disablePageZoom() {
        function handler(e) {
            if ((e.wheelDelta && e.ctrlKey) || e.detail) {
                e.returnValue = false;
                return false;
            }
        }

        on(doc, 'mousewheel', handler);
    }

    function float(n) {
        return parseFloat(n) || 0;
    }

    function fontSize(size) {
        return (float(size) / 5) + 'px';
    }

    function lineHeight(height) {
        return (float(height) - float(fontSize(height)) / 2) + 'px'
    }

    function trim(str) {
        return typeof String.prototype.trim === 'function' ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    function View() {
        var KEY_CODE_DELETE = 46;
        var KEY_CODE_ESC = 27;
        var KEY_CODE_G = 71;
        var KEY_CODE_LEFT_ARROW = 37;
        var KEY_CODE_UP_ARROW = 38;
        var KEY_CODE_RIGHT_ARROW = 39;
        var KEY_CODE_BOTTOM_ARROW = 40;
        var KEY_CODE_SPACE = 32;
        var KEY_CODE_RETURN = 13;
        var KEY_CODE_LINE_BREAK = 100;
        var KEY_CODE_CTRL = 17;
        var DESIGN_TIME = 0;
        var DESIGN_READONLY = 1;

        var XML_NS = 'http://www.w3.org/2000/svg';

        var loadCallbacks = [];
        var loadCounter = 0;

        var propertyBar;
        var topBar;
        var mainView;
        var statusBar;
        var positionBar;

        var dataSource;
        var urlData;
        var pileTypes;

        function getBorderColor(obj) {
            return obj ? (obj.borderColor || obj.borderTopColor) : '';
        }

        function TopBar() {
            var $topbar = qs('.top-bar');

            var pilebar;
            var schemebox;
            var operation;

            var selectCallbacks = [];

            function SchemeBox() {
                var $wrapper = qs('figure', $topbar);
                var $schemebox = qs('ul', $wrapper);

                function onselect(callback) {
                    if (typeof callback === 'function') {
                        selectCallbacks.push(callback);
                    }
                }

                function fireSelect(node) {
                    selectCallbacks.forEach(function (callback) {
                        callback.call(node, node);
                    });
                }

                function getScheme(index) {
                    var node;
                    var style;

                    if (typeof index === 'number') {
                        node = $schemebox.children[index];
                    }
                    else if (index instanceof HTMLLIElement) {
                        node = index;
                    }
                    else {
                        return {};
                    }

                    style = getComputedStyle(node);

                    return {
                        bgColor: style.backgroundColor,
                        borderColor: getBorderColor(style)
                    };
                }

                function setScheme(el, scheme) {
                    var circle;

                    if (el instanceof Element) {
                        circle = qs('circle', el);

                        if (circle instanceof SVGElement) {
                            assign(circle['style'], {
                                fill: scheme.bgColor,
                                stroke: scheme.borderColor
                            });
                        }
                    }
                }

                function expando() {
                    removeClass($wrapper, 'collapse', function (cls) {
                        cls.push('expando');
                    });

                    $wrapper['focus']();
                }

                function collapse() {
                    removeClass($wrapper, 'expando', function (cls) {
                        cls.push('collapse');
                    });
                }

                function init() {
                    on($schemebox, 'click', function (e) {
                        var node = e.srcElement;

                        if (node.tagName.toLowerCase() === 'li') {
                            fireSelect(node);
                        }
                    });

                    on($wrapper, 'blur', function (e) {
                        collapse();
                    });

                    return {
                        expando: expando,
                        collapse: collapse,
                        onselect: onselect,
                        getScheme: getScheme,
                        setScheme: setScheme
                    };
                }

                return init();
            }

            function Pilebar() {
                var $pilebar = $topbar.firstElementChild;

                var changeCallbacks = [];
                var selectItem = null;

                function pile(item, index) {
                    var $li = document.createElement('li');
                    var more;

                    $li.setAttribute('data-id', item.Id);
                    $li.setAttribute('data-name', item.Name);
                    $li.setAttribute('data-total', item.Total);

                    $li.innerHTML = '<svg xmlns="' + XML_NS + '" class="scheme" version="1.1" viewBox="0 0 100 100">\
                                        <circle cx="50" cy="50" r="39.99">\
                                    </svg>\
                                    <span class="pile-name">'+ item.Name + '</span>\
                                    <svg xmlns="'+ XML_NS + '" class="more" version="1.1" title="模板样式设置" viewBox="0 0 100 100">\
                                        <path d="M 100 0 L 100 100 L 0 100 Z">\
                                    </svg>';

                    more = qs('.more', $li);
                    schemebox.setScheme(qs('.scheme', $li), assign(schemebox.getScheme(index), item));

                    on($li, 'click', function (e) {
                        if ($li.className.match(/(^\s*selected|\s+selected(\s+|$))/) === null) {
                            [].slice.call($li.parentElement.querySelectorAll('li.selected')).forEach(function (n) {
                                removeClass(n, 'selected');
                            });

                            addClass($li, 'selected');
                            selectItem = $li;
                            fireChange($li);
                        }
                    });

                    on(more, 'click', function (e) {
                        schemebox.expando();
                    });

                    return $li;
                }

                function piles() {
                    pileTypes.forEach(function (item, index) {
                        $pilebar.appendChild(pile(item, index));
                    });
                }

                function fireChange(currentPile) {
                    changeCallbacks.forEach(function (callback) {
                        callback(currentPile);
                    });
                }

                function onchange(callback) {
                    if (typeof callback === 'function') {
                        changeCallbacks.push(callback);
                    }
                }

                function select(index) {
                    index = (index < 0 ? 0 : index) + 1;
                    selectItem = qs(':nth-child(' + index + ')', $pilebar);

                    trigger(selectItem, 'click');
                }

                function getSelectItem() {
                    return selectItem;
                }

                function getSelectScheme() {
                    var circle = qs('circle', selectItem);
                    var style = circle['style'];

                    return { bgColor: style.fill, borderColor: style.stroke };
                }

                function init() {
                    piles();

                    return {
                        count: pileTypes.length,
                        onchange: onchange,
                        getSelectItem: getSelectItem,
                        getSelectScheme: getSelectScheme,
                        select: select
                    };
                }

                return init();
            }

            function Operation() {
                var $operation = qs('.operation', $topbar);
                var ops = ['save', 'commit', 'move', 'copy', 'delete', 'edit', 'goto'];
                var api = {};
                var callbacks = {};

                function clearSelection() {
                    qsa('.op-btn.selected', $operation).forEach(function (el) {
                        trigger(el, 'click');
                    });
                }

                function bindEvent(el, name) {
                    return function () {
                        callbacks[name].forEach(function (callback) {
                            if (hasClass(el, '.toggle')) {
                                if (hasClass(el, '.selected')) {
                                    removeClass(el, 'selected');
                                    callback(false);
                                }
                                else {
                                    clearSelection();
                                    addClass(el, 'selected');
                                    callback(true);
                                }
                            }
                            else {
                                callback();
                            }
                        });
                    };
                }

                function bindCallback(name) {
                    return function (callback) {
                        if (typeof callback === 'function') {
                            callbacks[name].push(callback);
                        }
                    };
                }

                function binding(name) {
                    var op = qs('[data-op="' + name + '"]', $operation);

                    callbacks[name] = [];
                    api['on' + name] = bindCallback(name);
                    on(op, 'click', bindEvent(op, name));
                }

                function show() {
                    $operation['style'].display = 'flex';
                }

                function init() {
                    ops.forEach(binding);

                    api.clearSelection = clearSelection;
                    api.show = show;

                    return api;
                }

                return init();
            }

            function init() {
                schemebox = SchemeBox();
                pilebar = Pilebar();
                operation = Operation();

                schemebox.onselect(function (node) {
                    schemebox.setScheme(pilebar.getSelectItem(), schemebox.getScheme(node));
                });

                $topbar['style'].display = 'block';

                return {
                    selectPile: pilebar.select,
                    getSelectScheme: pilebar.getSelectScheme,
                    getSelectItem: pilebar.getSelectItem,
                    operation: operation
                };
            }

            return init();
        }

        function MainView(image) {
            var MIN_SHAPE_SIZE = 14;
            var VALIDATION_SUCCESS = 1;
            var VALIDATION_NOT_FINISHED = 2;
            var VALIDATION_NAME = 3;

            var $main = qs('.main-view');
            var $content = qs('.main-content', $main);
            var $img = qs('.master', $content);
            var $canvas = qs('.shape-canvas', $content);

            var controlDrag = false;
            var controlShape = false;
            var controlCopyShape = false;
            var controlResizing = false;
            var controlDrawing = false;

            var current = null;
            var contentStyle = $content['style'];

            var verifyDefaultResult = {
                success: true,
                code: VALIDATION_SUCCESS,
                tag: null,
                message: '验证通过'
            };

            var resizer;
            var textbox;

            function resize(shape, size, point) {
                var delta = size / 2;
                var newSize = size + 'px';

                assign(shape.style, {
                    width: newSize,
                    height: newSize,
                    left: (point.x - delta) + 'px',
                    top: (point.y - delta) + 'px',
                    borderRadius: newSize,
                    lineHeight: lineHeight(size),
                    fontSize: fontSize(size)
                });
            }

            function create(size, center, scheme) {
                var $div = document.createElement('div');
                var halfSize = size / 2;

                $div.className = 'shape';
                $div.setAttribute('data-shape-id', randomString());

                assign($div.style, {
                    backgroundColor: scheme.bgColor,
                    borderColor: getBorderColor(scheme),
                    left: (center.x - halfSize) + 'px',
                    top: (center.y - halfSize) + 'px',
                    width: size + 'px',
                    height: size + 'px',
                    borderRadius: halfSize + 'px'
                });

                return $canvas.appendChild($div);
            }

            function cursor(icon) {
                $main['style'].cursor = (typeof icon === 'string') ?
                    'url(./images/' + icon + '.png), url(./images/' + icon + '.cur), auto' :
                    'default';
            }

            function selectShape(shape) {
                return (urlData.mode === DESIGN_TIME && shape) ?
                    resizer.attach(shape) :
                    shape;
            }

            function selectLastShape() {
                var shape = qs('.shape:last-child', $canvas);

                if (shape) {
                    current = shape;
                    selectShape(current);
                }
            }

            function deleteShape(shape) {
                pileTypes.dec(shape.getAttribute('data-shape-type'));
                statusBar.updateAll();

                if (typeof shape.remove === 'function') {
                    shape.remove();
                }
                else {
                    $canvas.removeChild(shape);
                }

                shape = null;
                current = null;
                resizer.hide();

                selectLastShape();

                statusBar.info('删除完毕');
            }

            function findShape(name) {
                return qsa('.shape[data-shape-text*="' + name + '" i]', $canvas);
            }

            function getAllShape() {
                return qsa('.shape', $canvas);
            }

            function getShapeInfo(shape) {
                var style = shape['style'];
                var size = float(style.width);

                return JSON.stringify({
                    center: {
                        x: float(style.left) + size / 2,
                        y: float(style.top) + size / 2
                    },
                    size: size,
                    scheme: {
                        bgColor: style.backgroundColor,
                        borderColor: style.borderColor
                    }
                });
            }

            function getShapeObject(shape) {
                return {
                    Id: shape.getAttribute('data-shape-id'),
                    Name: shape.getAttribute('data-shape-text') || '',
                    Type: shape.getAttribute('data-shape-type'),
                    Info: getShapeInfo(shape)
                };
            }

            function moreThenTotal(callback) {
                var selectItem;
                var id;
                var type;

                selectItem = topBar.getSelectItem();

                if (selectItem !== null) {
                    id = selectItem.getAttribute('data-id');
                    type = pileTypes.get(id);

                    if (type.Count >= type.Total) {
                        message('[' + type.Name + '] 已绘制了 ' + type.Total + ' 个(上限值)');

                        if (current) {
                            resizer.hide();
                        }
                    }
                    else if (typeof callback === 'function') {
                        return callback(id);
                    }
                }
            }

            function copyShape(target) {
                if (target instanceof Node) {
                    return moreThenTotal(function (id) {
                        var newItem = target.cloneNode(true);

                        pileTypes.inc(id);
                        statusBar.updateAll();

                        newItem['setAttribute']('data-shape-id', randomString());
                        setShapeText(newItem, namedNewShape(target.textContent));

                        return target.parentElement.appendChild(newItem);
                    });
                }

                return null;
            }

            function setShapeText(shape, text) {
                if (shape) {
                    text = trim(text);
                    shape.textContent = text;
                    shape.setAttribute('data-shape-text', text);
                }
            }

            function positionShape(shape) {
                var shapeStyle;
                var delta;
                var halfSize;

                if (shape) {
                    shapeStyle = getComputedStyle(shape);
                    halfSize = float(shapeStyle.width) / 2;
                    delta = {
                        x: float(getComputedStyle($main).width) / 2,
                        y: float(getComputedStyle($main).height) / 2
                    };

                    assign($content['style'], {
                        left: (delta.x - float(shapeStyle.left) - halfSize) + 'px',
                        top: (delta.y - float(shapeStyle.top) - halfSize) + 'px'
                    });

                    return shape;
                }
            }

            function getShapeById(id) {
                return qs('.shape[data-shape-id="' + id + '"]', $canvas);
            }

            function moveShapeLeft(shape, offset) {
                var style;

                if (shape instanceof Element) {
                    style = shape['style'];

                    style.left = (float(style.left) + offset) + 'px';
                    resizer.move(shape);
                    statusBar.info('微调模式', 'x: ' + float(style.left) + ',y: ' + float(style.top));
                }
            }

            function moveShapeTop(shape, offset) {
                var style;

                if (shape instanceof Element) {
                    style = shape['style'];

                    style.top = (float(style.top) + offset) + 'px';
                    resizer.move(shape);
                    statusBar.info('微调模式', 'x: ' + float(style.left) + ',y: ' + float(style.top));
                }
            }

            function inchShape(shape, inc) {
                var style;
                var newSize;

                if (shape instanceof Element) {
                    style = shape['style'];
                    newSize = float(style.width) + inc;

                    resize(shape, newSize, { x: style.left, y: style.top });

                    resizer.move(shape);
                    statusBar.info('微调模式', '尺寸: ' + float(style.width));
                }
            }

            function doShapeEvents() {
                var point;
                var position;

                function shapeDragging(e, callback) {
                    if (!controlDrag && e.target['className'] === 'shape') {
                        e.stopPropagation();

                        callback(e);

                        return false;
                    }
                }

                on(doc, 'keydown', function (e) {
                    if (!current) {
                        return;
                    }

                    switch (e['keyCode']) {
                        case KEY_CODE_CTRL:
                            controlCopyShape = true;
                            break;
                        case KEY_CODE_LEFT_ARROW:
                            statusBar.info('微调模式', '');
                            e['shiftKey'] ? inchShape(current, -1) : moveShapeLeft(current, -1);
                            break;
                        case KEY_CODE_RIGHT_ARROW:
                            statusBar.info('微调模式', '');
                            e['shiftKey'] ? inchShape(current, 1) : moveShapeLeft(current, 1);
                            break;
                        case KEY_CODE_UP_ARROW:
                            statusBar.info('微调模式', '');
                            e['shiftKey'] ? inchShape(current, -1) : moveShapeTop(current, -1);
                            break;
                        case KEY_CODE_BOTTOM_ARROW:
                            statusBar.info('微调模式', '');
                            e['shiftKey'] ? inchShape(current, 1) : moveShapeTop(current, 1);
                            break;
                    }
                });

                on(doc, 'keyup', function (e) {
                    if (!current) {
                        return;
                    }

                    switch (e['keyCode']) {
                        case KEY_CODE_DELETE:
                            deleteShape(current);
                            break;
                        case KEY_CODE_CTRL:
                            controlCopyShape = false;
                            statusBar.info('', '');
                            topBar.operation.clearSelection();
                            break;
                    }
                });

                on($canvas, 'dblclick', function (e) {
                    return shapeDragging(e, function () {
                        textbox.attach(current);
                    });
                });

                on($canvas, 'mousedown', function (e) {
                    return shapeDragging(e, function () {
                        var style;

                        if (e['button'] === 0) {
                            if (controlCopyShape) {
                                current = copyShape(e.target);
                            }
                            else {
                                current = e.target;
                            }

                            controlShape = true;
                            point = { x: e['clientX'], y: e['clientY'] };

                            if (current) {
                                style = current['style'];
                                position = { left: float(style.left), top: float(style.top) };
                            }
                        }
                    });
                });

                on($canvas, 'mousemove', function (e) {
                    if (current && controlShape) {
                        var delta = { x: e['clientX'] - point.x, y: e['clientY'] - point.y };

                        e.stopPropagation();

                        assign(current['style'], {
                            left: (position.left + delta.x) + 'px',
                            top: (position.top + delta.y) + 'px'
                        });

                        resizer.move(current);

                        return false;
                    }
                });

                on($canvas, 'mouseup', function (e) {
                    return shapeDragging(e, function () {
                        if (current && controlShape) {
                            controlShape = false;

                            selectShape(current);
                        }
                    });
                });
            }

            function doDraw() {
                var center = null;

                var left;
                var top;

                function minSizeDetect() {
                    if (current instanceof Element) {
                        return float(current['style'].width) >= MIN_SHAPE_SIZE;
                    }

                    return false;
                }

                function drawing(e, callback) {
                    if (!(controlDrag || controlResizing || controlShape)) {
                        e.stopPropagation();

                        callback(e);
                        return false;
                    }
                }

                on($canvas, 'mousedown', function (e) {
                    return drawing(e, function () {
                        if (e['button'] === 0) {
                            moreThenTotal(function (id) {
                                var style;

                                controlDrawing = true;

                                statusBar.info('绘制模式', '');

                                style = getComputedStyle($content);
                                left = float(style.left);
                                top = float(style.top);

                                center = { x: e['clientX'] - left, y: e['clientY'] - top };
                                current = create(0, center, topBar.getSelectScheme());
                                current.setAttribute('data-shape-type', id);

                                pileTypes.inc(id);
                                statusBar.updateAll();
                            });
                        }
                    });
                });

                on($canvas, 'mousemove', function (e) {
                    return drawing(e, function () {
                        var size;

                        if (controlDrawing) {
                            size = 2 * Math.sqrt(
                                Math.pow(Math.abs(e['clientX'] - left - center.x), 2) +
                                Math.pow(Math.abs(e['clientY'] - top - center.y), 2)
                            );

                            assign(current['style'], {
                                cursor: 'default',
                                lineHeight: lineHeight(size),
                                fontSize: fontSize(size)
                            });

                            statusBar.info('绘制模式', '中心位置: ' + center.x + ',' + center.y);

                            resize(current, size, center);
                        }
                    });
                });

                on($canvas, 'mouseleave', function () {
                    if (controlDrawing) {
                        trigger($canvas, 'mouseup');
                    }
                });

                on($canvas, 'mouseup', function (e) {
                    return drawing(e, function () {
                        if (controlDrawing) {
                            current['style'].cursor = '';

                            if (!minSizeDetect()) {
                                if (typeof current.remove === 'function') {
                                    current.remove();
                                }
                                else {
                                    $canvas.removeChild(current);
                                }

                                pileTypes.dec(topBar.getSelectItem().getAttribute('data-id'));
                                statusBar.updateAll();

                                current = null;
                                resizer.hide();
                            }

                            statusBar.info('绘制模式', '');

                            selectShape(current);

                            center = null;
                            controlDrawing = false;
                        }
                    });
                });
            }

            function doDrag() {
                var dragging = false;
                var flag_catch = true;
                var point;
                var left;
                var top;

                function dragmove(delta) {
                    assign(contentStyle, {
                        left: (left + delta.x) + 'px',
                        top: (top + delta.y) + 'px'
                    });

                    statusBar && statusBar.info('位置: ' + (left + delta.x) + ',' + (left + delta.x), 1);
                }

                on(doc, 'keydown', function (e) {
                    if (e['keyCode'] === KEY_CODE_SPACE) {
                        controlDrag = true;
                        statusBar && statusBar.info('移动模式');

                        if (flag_catch) {
                            flag_catch = false;
                            cursor('catch');
                        }
                    }
                });

                on(doc, 'keyup', function (e) {
                    if (e['keyCode'] === KEY_CODE_SPACE) {
                        dragging = false;
                        controlDrag = false;

                        flag_catch = true;
                        cursor();

                        statusBar && statusBar.info('', '');
                        topBar && topBar.operation.clearSelection();
                    }
                });

                on($content, 'mousedown', function (e) {
                    if (e['button'] === 0 && controlDrag) {
                        cursor('grab');
                        statusBar && statusBar.info('移动模式');

                        left = float(getComputedStyle($content).left);
                        top = float(getComputedStyle($content).top);

                        point = { x: e['clientX'], y: e['clientY'] };
                        dragging = true;
                    }
                });

                on(doc, 'mousemove', function (e) {
                    dragging && dragmove({ x: e['clientX'] - point.x, y: e['clientY'] - point.y });
                });

                on($content, 'mouseover', function () {
                    if (controlDrag) {
                        statusBar && statusBar.info('移动模式', '');
                        cursor('catch');
                    }
                });

                on($content, 'mouseleave', function () {
                    if (controlDrag) {
                        statusBar && statusBar.info('', '');
                        cursor();
                    }
                });

                on(doc, 'mouseup', function (e) {
                    if (dragging) {
                        statusBar && statusBar.info('', '');

                        dragging = false;
                        cursor('catch');
                    }
                });
            }

            function importData(piles) {
                piles.forEach(function (pile) {
                    var $shape;

                    var type = pileTypes.get(pile.Type);
                    var info = JSON.parse(pile.Info);
                    var name = pile.Name.toLowerCase();

                    if (type) {
                        type.Count += 1;
                    }

                    if (info) {
                        if (urlData.highlight && urlData.highlight !== name) {
                            assign(info.scheme, { bgColor: '#ccc', borderColor: '#999' });
                        }

                        $shape = create(info.size, info.center, info.scheme);

                        if (urlData.highlight === name || (urlData.pos && urlData.pos.toLowerCase() === name)) {
                            positionShape(selectShape($shape));
                        }

                        if (urlData.mode === DESIGN_TIME) {
                            $shape.setAttribute('data-shape-type', type.Id);
                        }

                        setShapeText($shape, pile.Name);

                        assign($shape['style'], {
                            lineHeight: lineHeight(info.size),
                            fontSize: fontSize(info.size)
                        });
                    }
                });

                statusBar && statusBar.updateAll();
            }

            function exportData() {
                return getAllShape().map(function (shape) {
                    return getShapeObject(shape);
                });
            }

            function loadImage() {
                loadCounter += 1;

                on($img, 'load', function () {
                    if (/\.svg$/i.test(urlData.src)) {
                        getSVGSize(urlData.src, function (size) {
                            $img['style'].width = size;

                            loadCounter -= 1;
                            fireLoad();
                        });
                    }
                    else {
                        loadCounter -= 1;
                        fireLoad();
                    }

                    if (urlData.mode === DESIGN_TIME) {
                        assign($content['style'], {
                            left: '30px',
                            top: '80px'
                        });
                    }
                });

                on($img, 'error', function () {
                    message('[E1] 找不到图片。');
                });

                $img['src'] = urlData.src;
            }

            function organizeData() {
                var data = assign({}, dataSource);

                data.Items = exportData();

                return data;
            }

            function verifing(items, callback) {
                var result;
                var len = items.length;

                while (len--) {
                    result = callback(items[len], items);

                    if (typeof result !== 'undefined') {
                        return result;
                    }
                }

                return assign({}, verifyDefaultResult);
            }

            function verifyName(item, items) {
                var len = items.length;
                var current;

                while (len--) {
                    current = items[len];

                    if (item.Name === '' || (current.Id !== item.Id && current.Name === item.Name)) {
                        return {
                            success: false,
                            code: VALIDATION_NAME,
                            tag: item,
                            message: '桩号未设置，或存在相同桩号.'
                        };
                    }
                }
            }

            function verifyFinished(type) {
                if (type.Count < type.Total) {
                    return {
                        success: false,
                        code: VALIDATION_NOT_FINISHED,
                        tag: type,
                        message: '[' + type.Name + '] 尚有 ' + (type.Total - type.Count) + ' 个桩未绘制完毕.'
                    };
                }
            }

            function verify(data, callback) {
                var result = verifing(data.Items, verifyName);
                callback.call(data, result.success ? verifing(data.Types, verifyFinished) : result);
            }

            function jsonReplacer(key, value) {
                return key !== 'Count' ? value : undefined;
            }

            function executeSaveData(mustFinished) {
                verify(organizeData(), function (result) {
                    statusBar.info('执行保存', '');

                    if (result.success || (!mustFinished && result.code === VALIDATION_NOT_FINISHED)) {
                        statusBar.info('正在保存数据', 1);

                        this.Types.forEach(function (type) {
                            delete type.Count;
                        });

                        saveData(this, function () {
                            statusBar.info('成功保存', 1);
                        });
                    }
                    else {
                        if (result.code === VALIDATION_NAME) {
                            positionShape(selectShape(getShapeById(result.tag.Id)));
                        }

                        message(result.message);
                    }

                    statusBar.info('执行保存完毕');
                });
            }

            function TextBox() {
                var $textbox = qs('.pile-name-box', $content);

                var textStyle = $textbox['style'];
                var currentShape = null;
                var shapeStyle;

                function attach(shape) {
                    if (shape instanceof Element) {
                        currentShape = shape;
                        shapeStyle = shape['style'];

                        assign(textStyle, {
                            fontSize: shapeStyle.fontSize,
                            width: shapeStyle.width,
                            height: shapeStyle.width,
                            lineHeight: lineHeight(shapeStyle.height),
                            left: shapeStyle.left,
                            top: shapeStyle.top,
                            display: 'block'
                        });

                        $textbox['value'] = shape.textContent;
                        shape.textContent = '';
                        $textbox['focus']();
                    }
                }

                function hide() {
                    currentShape = null;
                    textStyle.display = 'none';
                }

                function handleText() {
                    function ignore(e) {
                        e.stopPropagation();
                        e.preventDefault();

                        return false;
                    }

                    on($textbox, 'blur', function () {
                        setShapeText(currentShape, $textbox['value']);
                        $textbox['value'] = '';
                        hide();
                    });

                    on($textbox, 'keydown', function (e) {
                        if (e['keyCode'] === KEY_CODE_RETURN) {
                            trigger($textbox, 'blur');

                            return ignore(e);
                        }
                    });

                    on($textbox, 'mousedown', ignore);
                    on($textbox, 'mouseup', ignore);
                    on($textbox, 'mousemove', ignore);
                }

                function init() {
                    handleText();

                    return {
                        attach: attach,
                        hide: hide
                    };
                }

                return init();
            }

            function Resizer() {
                var $resizer = qs('.shape-resizer', $canvas);

                var resizerStyle = $resizer['style'];
                var currentShape = null;
                var currentShapeStyle;

                function attach(shape) {
                    if (shape instanceof Element) {
                        currentShape = shape;
                        move(shape);
                        resizerStyle.display = 'block';

                        return shape;
                    }
                }

                function move(shape) {
                    currentShape = shape;
                    currentShapeStyle = shape['style'];

                    assign(resizerStyle, {
                        left: currentShapeStyle.left,
                        top: currentShapeStyle.top,
                        width: currentShapeStyle.width,
                        height: currentShapeStyle.height
                    });
                }

                function hide() {
                    currentShape = null;
                    resizerStyle.display = 'none';
                }

                function handleResizer() {
                    var handler = null;
                    var point;
                    var position;
                    var oldSize;
                    var className;

                    on($resizer, 'mousedown', function (e) {
                        if (e.target['tagName'].toLowerCase() === 'li' && currentShape instanceof Element) {
                            controlResizing = true;
                            e.stopPropagation();

                            handler = e.target;
                            point = { x: e['clientX'], y: e['clientY'] };
                            position = { left: float(currentShapeStyle.left), top: float(currentShapeStyle.top) };
                            oldSize = float(currentShapeStyle.width);
                            className = handler['className'];

                            return false;
                        }
                    });

                    on($canvas, 'mousemove', function (e) {
                        var delta;
                        var newSize;
                        var pNewSize;

                        if (controlResizing) {
                            e.stopPropagation();

                            currentShapeStyle = currentShape['style'];

                            delta = ((className === 'resizer-left-top' || className === 'resizer-left-bottom') ? -1 : 1) * (e['clientX'] - point.x);
                            newSize = oldSize + delta;

                            if (newSize >= MIN_SHAPE_SIZE) {
                                pNewSize = newSize + 'px';

                                if (className === 'resizer-left-top' || className === 'resizer-left-bottom') {
                                    resizerStyle.left = currentShapeStyle.left = (position.left - delta) + 'px';
                                }

                                if (className === 'resizer-left-top' || className === 'resizer-right-top') {
                                    resizerStyle.top = currentShapeStyle.top = (position.top - delta) + 'px';
                                }

                                resizerStyle.width = resizerStyle.height = pNewSize;

                                assign(currentShapeStyle, {
                                    width: pNewSize,
                                    height: pNewSize,
                                    borderRadius: (newSize / 2) + 'px',
                                    lineHeight: lineHeight(newSize),
                                    fontSize: fontSize(newSize)
                                });
                            }

                            return false;
                        }
                    });

                    on($canvas, 'mouseup', function (e) {
                        if (controlResizing) {
                            e.stopPropagation();
                            controlResizing = false;
                            handler = null;
                        }
                    });
                }

                function init() {
                    handleResizer();

                    return {
                        attach: attach,
                        hide: hide,
                        move: move
                    };
                }

                return init();
            }

            function init() {
                var op;

                on($img, 'mousedown', function (e) {
                    if (controlDrag) {
                        e.preventDefault();
                        return false;
                    }
                });

                on($img, 'dragstart', function (e) {
                    e.preventDefault();
                    return false;
                });

                on($img, 'selectstart', function (e) {
                    e.preventDefault();
                    return false;
                });

                doDrag();

                if (urlData.mode === DESIGN_TIME) {
                    resizer = Resizer();
                    textbox = TextBox();

                    doShapeEvents();
                    doDraw();

                    op = topBar.operation;

                    op.onsave(function () {
                        statusBar.info('执行保存');
                        executeSaveData();
                    });

                    op.oncommit(function () {
                        statusBar.info('执行提交');
                        executeSaveData(true);
                    });

                    op.ondelete(function () {
                        if (current) {
                            deleteShape(current);
                        }
                    });

                    op.onedit(function () {
                        if (current) {
                            textbox.attach(current);
                        }
                    });

                    op.oncopy(function (isCopy) {
                        controlCopyShape = isCopy;
                        statusBar.info(isCopy ? '复制模式' : '');
                    });

                    op.onmove(function (isMove) {
                        controlDrag = isMove;
                        cursor(isMove ? 'catch' : undefined);
                        statusBar.info(isMove ? '移动模式' : '');
                    });

                    op.ongoto(function () {
                        positionBar.show();
                    });

                    positionBar.onchange(function (text) {
                        return findShape(trim(text));
                    });

                    positionBar.onnav(function (shape) {
                        selectShape(positionShape(current = shape));
                    });
                }
                else {
                    controlDrag = true;
                    addClass($content, 'readonly');
                }

                return {
                    exportData: exportData,
                    importData: importData,
                    loadImage: loadImage
                };
            }

            return init();
        }

        function fireLoad() {
            if (loadCounter === 0) {
                loadCallbacks.forEach(function (callback) {
                    callback({
                        dataSource: dataSource,
                        urlData: urlData,
                        pileTypes: pileTypes,
                        topBar: topBar,
                        propertyBar: propertyBar,
                        positionBar: positionBar,
                        statusBar: statusBar,
                        mainView: mainView
                    });
                });
            }
        }

        function loadDataFail(msg) {
            message(msg || '[E0] 数据加载失败。');
        }

        function figureSize(svg) {
            var viewBox;
            var height;

            var text = svg.substring(0, 1000).match(/<svg(.|\r|\n)*?>/i)[0];
            var width = text.match(/\bwidth\=(?:\'\")(.*?)(?:\'\")/i);

            if (width != null && (height = text.match(/\bheight\=(?:\'\")(.*?)(?:\'\")/i)) != null) {
                return float(width[1]) + 'px';
            }
            else {
                viewBox = text.match(/\bviewBox\=(?:\'|\")(.*?)(?:\'|\")/i);
                return float(viewBox != null ? viewBox[1].split(/\,|\s/i)[2] : 0) + 'px';
            }
        }

        function loadDataSuccess(d) {
            if (parseInt(d.Code) === 0) {
                dataSource = d.Data;
                dataSource.Types = pileTypes;

                statusBar && statusBar.updateTotal(dataSource.Items.length);
                mainView.importData(dataSource.Items);

                loadCounter -= 1;

                topBar && topBar.operation.show();

                fireLoad();
            }
            else {
                loadDataFail(d.Message);
            }
        }

        function getSVGSize(url, callback) {
            ajax({
                url: url,
                type: 'svg',
                success: function (svg) {
                    callback(figureSize(svg));
                }
            });
        }

        function loadData() {
            loadCounter += 1;

            ajax({
                url: '../data/sample.json',
                success: loadDataSuccess,
                fail: function () {
                    loadDataFail();
                }
            });
        }

        function saveData(data, successCallback) {
            ajax({
                url: '',
                data: data,
                success: successCallback
            });
        }

        function parsePileType(typeString) {
            var type = { Id: '', Name: '', Count: 0, Total: 0 };
            var stoke;

            if (typeString) {
                var stoke = typeString.split(',');

                return {
                    Id: stoke[0],
                    Name: stoke[1],
                    Count: 0,
                    Total: float(stoke[2])
                };
            }

            return type;
        }

        function parsePileTypes() {
            var types = [];

            if (urlData.types) {
                urlData.types.split(';').forEach(function (type) {
                    types.push(parsePileType(type));
                });
            }

            assign(types, {
                get: function (id) {
                    return types.filter(function (type) {
                        return type.Id === id;
                    })[0];
                },
                inc: function (id, count, callback) {
                    var _count;
                    var item = this.get(id);

                    if (item) {
                        if (typeof count === 'function') {
                            callback = count;
                            count = undefined;
                        }

                        if (typeof count === 'number') {
                            _count = count;
                        }

                        if (typeof count === 'undefined') {
                            _count = 1;
                        }

                        item.Count += _count;

                        if (item.Count < 0) {
                            item.Count = 0;
                        }

                        if (item.Count > item.Total) {
                            item.Count = item.Total;
                        }

                        if (typeof callback === 'function') {
                            callback.call(item, id, item.Count, item);
                        }
                    }
                },
                dec: function (id, count, callback) {
                    if (typeof count === 'number') {
                        count = count * (-1);
                    }

                    if (typeof count === 'undefined') {
                        count = -1;
                    }

                    this.inc(id, count, callback);
                }
            });

            return types;
        }

        function organizeUrlData(u) {
            u.highlight = ('' + (u.highlight || u.hl || '')).toLowerCase();

            u.mode = u.mode || DESIGN_TIME;
            u.mode = u.mode > 1 ? DESIGN_READONLY : u.mode;
            u.mode = u.readonly === 1 ? DESIGN_READONLY : u.mode;
        }

        function PositionBar() {
            var $position = qs('.position-bar');
            var $close = qs('.pos-close', $position);
            var $previous = qs('.pos-left', $position);
            var $next = qs('.pos-right', $position);
            var $text = qs('input', $position);
            var $prompt = qs('span', $position);

            var changeCallbacks = [];
            var navCallbacks = [];

            var current = 1;
            var total = 0;
            var resultSet;

            function show() {
                $position['style'].display = 'block';
                $text['focus']();
            }

            function hide() {
                $position['style'].display = 'none';
            }

            function status() {
                addClass($previous, 'disabled');
                addClass($next, 'disabled');

                if (current > 1) {
                    removeClass($previous, 'disabled');
                }

                if (current < total) {
                    removeClass($next, 'disabled');
                }

                $prompt.textContent = total > 0 ? ('第' + current + '个(共' + total + '个)') : '无结果';
            }

            function fireChange() {
                changeCallbacks.forEach(function (callback) {
                    result(callback($text['value']));
                    nav();
                });
            }

            function nav(inc) {
                current += typeof inc === 'number' ? inc : 0;
                current = current < 1 ? 1 : current;
                current = current > total ? total : current;

                navCallbacks.forEach(function (callback) {
                    callback(resultSet[current - 1]);
                });

                status();
            }

            function onchange(callback) {
                if (typeof callback === 'function') {
                    changeCallbacks.push(callback);
                }
            }

            function onnav(callback) {
                if (typeof callback === 'function') {
                    navCallbacks.push(callback);
                }
            }

            function result(set) {
                resultSet = set;
                total = set.length;
                current = total > 0 ? 1 : 0;

                status();
            }

            function init() {
                on($close, 'click', function () {
                    hide();
                });

                on($next, 'click', function () {
                    if (!hasClass($next, 'disabled')) {
                        nav(1);
                    }
                });

                on(doc, 'keyup', function (e) {
                    if (e['keyCode'] === KEY_CODE_ESC) {
                        hide();
                    }
                });

                on($previous, 'click', function () {
                    if (!hasClass($next, 'disabled')) {
                        nav(-1);
                    }
                });

                on($text, 'input', fireChange);
                on($text, 'focus', function () {
                    $text['select']();
                    fireChange();
                });

                return {
                    onchange: onchange,
                    show: show,
                    hide: hide,
                    onnav: onnav
                };
            }

            return init();
        }

        function StatusBar() {
            var $statusBar = qs('.status-bar');
            var $total = qs('.pile-total', $statusBar);
            var $text = qsa('.status-text', $statusBar);

            var _total = 0;

            function info(msg, panel) {
                if (typeof panel === 'undefined') {
                    $text[0].textContent = msg;
                }

                if (typeof panel === 'number') {
                    $text[panel].textContent = msg;
                }

                if (typeof panel === 'string') {
                    $text[0].textContent = msg;
                    $text[1].textContent = panel;
                }
            }

            function add(item) {
                var $item = document.createElement('span');

                $item.setAttribute('data-id', item.Id);
                $item.innerHTML = item.Name + '( <i>0</i>/' + item.Total + ' )';

                return $item;
            }

            function push(items) {
                items.forEach(function (item) {
                    _total += item.Total || 0;
                    $statusBar.appendChild(add(item));
                });

                updateTotal();
            }

            function update(id, count) {
                var item = qs('span[data-id="' + id + '"] > i', $statusBar);

                if (item) {
                    item.textContent = count || 0;
                }
            }

            function updateTotal(drawed, total) {
                if (typeof total === 'number' && total > 0) {
                    _total = total;
                }

                $total.textContent = '桩总数: ' + (drawed || 0) + '/' + (total || _total);
            }

            function updateAll() {
                var count = 0;

                pileTypes.forEach(function (pile) {
                    count += pile.Count;
                    update(pile.Id, pile.Count);
                });

                updateTotal(count);
            }

            function remove(id) {
                var $item = qs('[data-id="' + id + '"] i', $statusBar);

                if ($item !== null) {
                    if (typeof $item.remove === 'function') {
                        $item.remove();
                    }
                    else {
                        $item.parentElement.removeChild($item);
                    }
                }
            }

            function init() {
                $statusBar['style'].display = 'block';

                return {
                    push: push,
                    add: add,
                    update: update,
                    updateTotal: updateTotal,
                    updateAll: updateAll,
                    remove: remove,
                    info: info
                };
            }

            return init();
        }

        function PropertyBar(types) {
            var $property = qs('.sidebar-menu');

            function init() {

                return {

                };
            }

            return init();
        }

        function init() {
            urlData = urlSearch();
            organizeUrlData(urlData);

            pileTypes = parsePileTypes();

            if (urlData.mode === DESIGN_TIME) {
                topBar = TopBar();
                topBar.selectPile(0);

                propertyBar = PropertyBar();

                statusBar = StatusBar();
                statusBar.push(pileTypes);

                positionBar = PositionBar();
            }

            mainView = MainView();
            mainView.loadImage();

            loadData();

            return {
                onload: function (callback) {
                    if (typeof callback === 'function') {
                        loadCallbacks.push(callback);
                    }
                }
            };
        }

        return init();
    }

    function init() {
        disablePageZoom();
        disablePageSelect();

        View().onload(function (view) {
            view.statusBar && view.statusBar.info('准备就绪', '');
        });
    }

    return init();

})(window, document);
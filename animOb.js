// Color type checker
var is = {

    hex: function (a) {

        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
    },

    rgb: function (a) {

        return /^rgb/.test(a);
    },

    hsl: function (a) {

        return /^hsl/.test(a);
    },

    color: function (a) {

        return (is.hex(a) || is.rgb(a) || is.hsl(a));
    }
};

//Convert hex to Rgb
function hexToRgb(hexValue) {
    var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    var hex = hexValue.replace(rgx, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var r = parseInt(rgb[1], 16);
    var g = parseInt(rgb[2], 16);
    var b = parseInt(rgb[3], 16);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

// Convert hsl to Rgb
function hslToRgb(hslValue) {
    var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue);
    var h = parseInt(hsl[1]) / 360;
    var s = parseInt(hsl[2]) / 100;
    var l = parseInt(hsl[3]) / 100;

    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    var r, g, b;
    if (s == 0) {
        r = g = b = l;
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return 'rgb(' + Math.round(r * 255) + ',' + Math.round(g * 255) + ',' + Math.round(b * 255) + ')';
}

//Check which color type
function colorToRgb(val) {
    if (is.rgb(val)) return val;
    if (is.hex(val)) return hexToRgb(val);
    if (is.hsl(val)) return hslToRgb(val);
}

function getRgbNumbers(rgb) {

    var rgbArray = rgb.substring(4, rgb.length - 1).replace(/ /g, '').split(',');
    rgbArray = rgbArray.map(function (value) {
        return parseInt(value);
    });

    return rgbArray;
}

function colorTransition(a, b, u) {

    return (1 - u) * a + u * b;

}


//Cubic beizer from https://github.com/gre/bezier-easing

(function (f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.BezierEasing = f()
    }
})(function () {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a)return a(o, !0);
                    if (i)return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {exports: {}};
                t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }

        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++)s(r[o]);
        return s
    })({
        1: [function (require, module, exports) {
            /**
             * https://github.com/gre/bezier-easing
             * BezierEasing - use bezier curve for transition easing function
             * by GaC«tan Renaudeau 2014 - 2015 a€“ MIT License
             */

// These currentValues are established by empiricism with tests (tradeoff: performance VS precision)
            var NEWTON_ITERATIONS = 4;
            var NEWTON_MIN_SLOPE = 0.001;
            var SUBDIVISION_PRECISION = 0.0000001;
            var SUBDIVISION_MAX_ITERATIONS = 10;

            var kSplineTableSize = 11;
            var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

            var float32ArraySupported = typeof Float32Array === 'function';

            function A(aA1, aA2) {
                return 1.0 - 3.0 * aA2 + 3.0 * aA1;
            }

            function B(aA1, aA2) {
                return 3.0 * aA2 - 6.0 * aA1;
            }

            function C(aA1) {
                return 3.0 * aA1;
            }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
            function calcBezier(aT, aA1, aA2) {
                return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
            }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
            function getSlope(aT, aA1, aA2) {
                return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
            }

            function binarySubdivide(aX, aA, aB, mX1, mX2) {
                var currentX, currentT, i = 0;
                do {
                    currentT = aA + (aB - aA) / 2.0;
                    currentX = calcBezier(currentT, mX1, mX2) - aX;
                    if (currentX > 0.0) {
                        aB = currentT;
                    } else {
                        aA = currentT;
                    }
                } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
                return currentT;
            }

            function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
                for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
                    var currentSlope = getSlope(aGuessT, mX1, mX2);
                    if (currentSlope === 0.0) {
                        return aGuessT;
                    }
                    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                    aGuessT -= currentX / currentSlope;
                }
                return aGuessT;
            }

            module.exports = function bezier(mX1, mY1, mX2, mY2) {
                if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
                    throw new Error('bezier x currentValues must be in [0, 1] range');
                }

                // Precompute samples table
                var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
                if (mX1 !== mY1 || mX2 !== mY2) {
                    for (var i = 0; i < kSplineTableSize; ++i) {
                        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
                    }
                }

                function getTForX(aX) {
                    var intervalStart = 0.0;
                    var currentSample = 1;
                    var lastSample = kSplineTableSize - 1;

                    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
                        intervalStart += kSampleStepSize;
                    }
                    --currentSample;

                    // Interpolate to provide an initial guess for t
                    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
                    var guessForT = intervalStart + dist * kSampleStepSize;

                    var initialSlope = getSlope(guessForT, mX1, mX2);
                    if (initialSlope >= NEWTON_MIN_SLOPE) {
                        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
                    } else if (initialSlope === 0.0) {
                        return guessForT;
                    } else {
                        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
                    }
                }

                return function BezierEasing(x) {
                    if (mX1 === mY1 && mX2 === mY2) {
                        return x; // linear
                    }
                    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
                    if (x === 0) {
                        return 0;
                    }
                    if (x === 1) {
                        return 1;
                    }
                    return calcBezier(getTForX(x), mY1, mY2);
                };
            };

        }, {}]
    }, {}, [1])(1)
});

// All properties

var myProps = ['elem', 'moveX', 'moveY', 'backgroundColor', 'end','delay', 'radius', 'width', 'height', 'rotate', 'duration', 'easing'];

function isValid(props, val) {

    return props.some(function (arrVal) {
        return arrVal === val;
    });
}

function checkProps(vals) {

    for (var ob in vals) {

        var my = isValid(myProps, ob);

        if (!my) {

            throw new Error('Invalid property: ' + ob);
        }
    }

}


function getElem(el) {

    return document.querySelector(el);
}


function numericValues(val) {

    return parseInt(val, 10) || 0;
}


function colorError() {

    console.warn('Invalid Color Code');

}

var easingTypes = {

    'easeIn': [0.420, 0.000, 1.000, 1.000],
    'easeOut': [0.000, 0.000, 0.580, 1.000],
    'easeInOut': [0.000, 0.000, 0.580, 1.000],
    'easeInQuad': [0.550, 0.085, 0.680, 0.530],
    'easeInCubic': [0.550, 0.055, 0.675, 0.190],
    'easeInQuart': [0.895, 0.030, 0.685, 0.220],
    'easeInQuint': [0.755, 0.050, 0.855, 0.060],
    'easeInSine': [0.470, 0.000, 0.745, 0.715],
    'easeInExpo': [0.950, 0.050, 0.795, 0.035],
    'easeInCirc': [0.600, 0.040, 0.980, 0.335],
    'easeInBack': [0.600, -0.280, 0.735, 0.045],
    'easeOutQuad': [0.250, 0.460, 0.450, 0.940],
    'easeOutCubic': [0.215, 0.610, 0.355, 1.000],
    'easeOutQuart': [0.165, 0.840, 0.440, 1.000],
    'easeOutQuint': [0.230, 1.000, 0.320, 1.000],
    'easeOutSine': [0.390, 0.575, 0.565, 1.000],
    'easeOutExpo': [0.190, 1.000, 0.220, 1.000],
    'easeOutCirc': [0.075, 0.820, 0.165, 1.000],
    'easeOutBack': [0.175, 0.885, 0.320, 1.275],
    'easeInOutQuad': [0.455, 0.030, 0.515, 0.955],
    'easeInOutCubic': [0.645, 0.045, 0.355, 1.000],
    'easeInOutQuart': [0.770, 0.000, 0.175, 1.000],
    'easeInOutQuint': [0.860, 0.000, 0.070, 1.000],
    'easeInOutSine': [0.445, 0.050, 0.550, 0.950],
    'easeInOutExpo': [1.000, 0.000, 0.000, 1.000],
    'easeInOutCirc': [0.785, 0.135, 0.150, 0.860],
    'easeInOutBack': [0.680, -0.550, 0.265, 1.550]

};


function easeType(easing) {

    if (typeof easing === 'string') {

        for (var type in easingTypes) {

            if (type === easing)
                return BezierEasing(easingTypes[type][0], easingTypes[type][1], easingTypes[type][2], easingTypes[type][3]);

        }
    } else if (Array.isArray(easing)) {

        return BezierEasing(easing[0], easing[1], easing[2], easing[3]);

    }
}

function endCodes(f) {

    if (typeof f === 'function') {

        return f();
    }

    return console.warn('Invalid End Value');
}


function AnimeOb(properties) {

    this.properties = properties;
    this.easing = easeType(properties.easing);

    this.currentValues = {

        left: undefined,
        top: undefined,
        width: undefined,
        height: undefined,
        borderRadius: undefined,
        'background-color': undefined
    };

    var self = this;

    setTimeout(function () {
       self.animate();
    },this.properties.delay);

}

var requestId = 0;

AnimeOb.prototype.animate = function () {

    checkProps(this.properties);

    if (!this.properties.duration)
        this.properties.duration = 1000;
    if (!this.easing)
        this.easing = BezierEasing(0.250, 0.100, 0.250, 1.000);

    var self = this;
    var start = +Date.now();

    function loop() {
        var p = (+Date.now() - start) / (self.properties.duration + 50);

        if (p > 1) {

            update(self, self.properties, 1);
            cancelAnimationFrame(requestId);

            if (self.properties.hasOwnProperty('end'))
                var mi = setTimeout(function () {
                    endCodes(self.properties.end);
                    clearTimeout(mi);
                }, 0);

        } else {

            requestAnimationFrame(loop);
            update(self, self.properties, self.easing(p));
        }
    }

        requestId = requestAnimationFrame(loop);




};

function update(self, value, p) {

    var elem = getElem(value.elem);

    if (getCurrentValue(elem, 'position') === 'static')
        elem.style.position = 'relative';


    for (var prop in value) {

        if (value.hasOwnProperty(prop)) {

            switch (prop) {

                case 'moveX':
                    setValues.moveX(elem, value, p, self);
                    break;
                case 'moveY':
                    setValues.moveY(elem, value, p, self);
                    break;
                case 'width':
                    setValues.width(elem, value, p, self);
                    break;
                case 'height':
                    setValues.height(elem, value, p, self);
                    break;
                case 'radius':
                    setValues.radius(elem, value, p, self);
                    break;
                case 'backgroundColor':
                    setValues.background(elem, value, p, self);
                    break;
                case 'rotate':
                    setValues.rotate(elem, value, p);
                    break;
            }
        }
    }

}

var setValues = {

    moveX: function (elem, value, p, self) {

        elem.style.left = self.currentValues.left + (value.moveX - this.current(elem, 'left', self)) * p + 'px';
    },

    moveY: function (elem, value, p, self) {

        elem.style.top = self.currentValues.top + (value.moveY - this.current(elem, 'top', self)) * p + 'px';
    },

    width: function (elem, value, p, self) {

        elem.style.width = self.currentValues.width + (value.width - this.current(elem, 'width', self)) * p + 'px';
    },

    height: function (elem, value, p, self) {

        elem.style.height = self.currentValues.height + (value.height - this.current(elem, 'height', self)) * p + 'px';
    },

    radius: function (elem, value, p, self) {

        elem.style.borderRadius = self.currentValues.borderRadius + (value.radius - this.current(elem, 'borderRadius', self)) * p + 'px';
    },

    background: function (elem, value, p, self) {

        var from = this.current(elem, 'background-color', self);

        var to = !is.color(value.backgroundColor) ? colorError() : colorToRgb(value.backgroundColor);
        to = getRgbNumbers(to);

        var r = parseInt(colorTransition(from[0], to[0], p));
        var g = parseInt(colorTransition(from[1], to[1], p));
        var b = parseInt(colorTransition(from[2], to[2], p));

        elem.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
    },

    rotate: function (elem, value, p) {

        elem.style.transform = 'rotate(' + (value.rotate * p) + 'deg)';
    },

    current: function (elem, prop, self) {

        if (typeof self.currentValues[prop] === 'undefined')
            return self.currentValues[prop] = prop === 'background-color' ? getCurrentValue(elem, prop) : numericValues(getCurrentValue(elem, prop));
        return self.currentValues[prop];
    }

};

function getCurrentValue(elem, field) {

    var css = document.defaultView && document.defaultView.getComputedStyle ?
        document.defaultView.getComputedStyle(elem, null)
        : elem.currentStyle || elem.style;
    return field === 'background-color' ? getRgbNumbers(css[field]) : css[field];
}
# animOb
Simple animation library which created with pure javascript language.

Basic Example: 

```javascript
var anim = new AnimOb({
  elem : "div",
  moveX: 150,
  rotate: 180,
  backgroundColor: "#b30000"
  });
  
```

With All Properties:

```javascript
var anim = new AnimOb({
	elem : ".circle",
	duration: 2000,
	moveX : 150,
	moveY : 100,
	radius: 50,
	rotate: 360,
	delay: 1000,
	easing: "easeInSine",
	width:300,
	height:300,
	backgroundColor: '#ccc',
	end : function(){
		
		console.log('Animation completed!!');
	}
});
```

You can also add custom cubic-bezier numbers (good place to create cubiz-bezier: http://cubic-bezier.com)

```javascript
 
 var anim = new AnimOb({
	elem : ".circle",
	duration: 2000,
	moveX : 150,
	easing: [.17,.67,.83,.67]
});
```

All Easing Types:

* 'easeIn'
* 'easeOut'
* 'easeInOut'
* 'easeInQuad'
* 'easeInCubic'
* 'easeInQuart'
* 'easeInQuint'
* 'easeInSine'
* 'easeInExpo'
* 'easeInCirc'
* 'easeInBack'
* 'easeOutQuad'
* 'easeOutCubic'
* 'easeOutQuart'
* 'easeOutQuint'
* 'easeOutSine'
* 'easeOutExpo'
* 'easeOutCirc'
* 'easeOutBack'
* 'easeInOutQuad'
* 'easeInOutCubic'
* 'easeInOutQuart'
* 'easeInOutQuint'
* 'easeInOutSine'
* 'easeInOutExpo'
* 'easeInOutCirc'
* 'easeInOutBack'
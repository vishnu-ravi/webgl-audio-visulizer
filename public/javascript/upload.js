var scene, camera, renderer, container, controls, data_img;

var SCREEN_WIDTH, SCREEN_HEIGHT;
var ImageLoader     =   function() {
    this.canvas     =   null;
    this.ctx        =   null;
    this.tmp_can    =   null;
    this.tmp_ctx    =   null;
    this.width      =   0;
    this.height     =   0;
    this.center_x   =   0;
    this.center_y   =   0;
    this.dragging   =   false;
    this.mouseX     =   0;
    this.mouseY     =   0;
    this.pos        =   {deltaX: 0, deltaY: 0};
    this.img        =   null;
    this.img_w      =   0;
    this.img_h      =   0;
    this.initial_w  =   500;
    this.new_h      =   0;
    this.img_x_pos  =   0;
    this.img_y_pos  =   0;
    this.img_src    =   null;
};

ImageLoader.prototype.init          =   function() {
    this.canvas     =   document.getElementById('img_canvas');
    this.ctx        =   this.canvas.getContext('2d');
    this.tmp_can    =   document.getElementById('tmp_canvas');
    this.tmp_ctx    =   this.tmp_can.getContext('2d');

    this.width      =   this.canvas.width;
    this.height     =   this.canvas.height;
    this.center_x   =   this.width / 2;
    this.center_y   =   this.height / 2;

    var imageLoader =   document.getElementById('btn_upload');
    imageLoader.addEventListener('change', this.handleImage, false);
};

ImageLoader.prototype.handleImage   =   function(e) {
    var reader      =   new FileReader();
    reader.onload   =   function(event) {
        var img     =   new Image();
        img.onload  =   function() {
            document.getElementById('block_validator').style.display    =   'block';
            document.getElementById('block_upload').style.display       =   'none';
            img_loader.img      =   img;
            img_loader.img_w    =   img.width;
            img_loader.img_h    =   img.height;
            img_loader.new_h    =   img_loader.img_h / img_loader.img_w * img_loader.initial_w;
            img_loader.bindEvents();
            img_loader.ctx.drawImage(img, 0, 0, img_loader.initial_w, img_loader.new_h);
            img_loader.tmp_ctx.drawImage(img, 0, 0, img_loader.initial_w, img_loader.new_h);
            img_loader.drawFace();
        };
        img.src     =   event.target.result;
        img_loader.img_src  =   event.target.result;
    };

    reader.readAsDataURL(e.target.files[0]);
};

ImageLoader.prototype.bindEvents    =   function() {
    var _this   =   this;
    this.canvas.addEventListener('mousedown', this.mouseDown, false);
    this.canvas.addEventListener('mousemove', this.mouseMove, false);
    this.canvas.addEventListener('mouseup', this.mouseUp, false);
    this.canvas.addEventListener('mouseout', this.mouseUp, false);
    document.getElementById('btn_zoom_in').onclick  =   function(e) {
        e.preventDefault();

        _this.initial_w     =   _this.initial_w * 2;
        _this.new_h         =   _this.img_h / _this.img_w * _this.initial_w;

        _this.calcCenter();

        _this.ctx.clearRect(0, 0, _this.width, _this.height);
        _this.ctx.drawImage(_this.img, _this.img_x_pos, _this.img_y_pos, _this.initial_w, _this.new_h);
        _this.tmp_ctx.clearRect(0, 0, _this.width, _this.height);
        _this.tmp_ctx.drawImage(_this.img, _this.img_x_pos, _this.img_y_pos, _this.initial_w, _this.new_h);
        _this.drawFace();

        _this.pos.deltaX    =   _this.img_x_pos;
        _this.pos.deltaY    =   _this.img_y_pos;
    };

    document.getElementById('btn_zoom_out').onclick     =   function(e) {
        e.preventDefault();

        _this.initial_w     =   _this.initial_w / 2;
        _this.new_h         =   _this.img_h / _this.img_w * _this.initial_w;

        _this.calcCenter();

        _this.ctx.clearRect(0, 0, _this.width, _this.height);
        _this.ctx.drawImage(_this.img, _this.img_x_pos, _this.img_y_pos, _this.initial_w, _this.new_h);
        _this.tmp_ctx.clearRect(0, 0, _this.width, _this.height);
        _this.tmp_ctx.drawImage(_this.img, _this.img_x_pos, _this.img_y_pos, _this.initial_w, _this.new_h);
        _this.drawFace();

        _this.pos.deltaX    =   _this.img_x_pos;
        _this.pos.deltaY    =   _this.img_y_pos;
    };

    document.getElementById('btn_validate').onclick     =   function(e) {
        e.preventDefault();
        var clip_canvas =   document.getElementById('clip_canvas');
        var clip_ctx    =   clip_canvas.getContext('2d');

        clip_ctx.translate(_this.width / 2, _this.height / 2);
        clip_ctx.beginPath();
        clip_ctx.moveTo(-80, -50);
        clip_ctx.bezierCurveTo(-80, -150, 80, -150, 80, -50);
        clip_ctx.bezierCurveTo(80, -30, 85, -40, 75, 50);
        clip_ctx.bezierCurveTo(75, 150, -75, 150, -75, 50);

        clip_ctx.bezierCurveTo(-85, -40, -80, -30, -80, -50);
        clip_ctx.closePath();

        clip_ctx.clip();
        clip_ctx.stroke();

        var img    =    new Image();
        img.onload  =   function() {
            var final_canvas    =   document.getElementById('final_canvas');
            var final_ctx       =   final_canvas.getContext('2d');
            clip_ctx.drawImage(img, -(_this.width / 2), - (_this.height / 2));

            var new_img     =   new Image();
            new_img.onload  =   function() {
                final_ctx.canvas.width = 200;
                final_ctx.canvas.height = 300;
                final_ctx.drawImage(new_img, 150, 100, 200, 300, 0, 0, 200, 300);
                data_img    =   final_canvas.toDataURL();
                document.getElementById('output').setAttribute('src', data_img);
                audio.init();
                webgl.init();
            };
            new_img.src =   clip_canvas.toDataURL();

        };

        img.src =   _this.tmp_can.toDataURL();
    };
};

ImageLoader.prototype.drawFace      =   function () {
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(2, 1);
    this.ctx.beginPath();
    this.ctx.arc(-25, -50, 10, 0, Math.PI * 2, false);
    this.ctx.restore();

    this.ctx.lineWidth      =   2;
    this.ctx.strokeStyle    =   'white';
    this.ctx.stroke();

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(2, 1);
    this.ctx.beginPath();
    this.ctx.arc(25, -50, 10, 0, Math.PI * 2, false);
    this.ctx.restore();

    this.ctx.lineWidth      =   2;
    this.ctx.strokeStyle    =   'white';
    this.ctx.stroke();

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);

    this.ctx.beginPath();
    this.ctx.moveTo(-75, 50);
    this.ctx.bezierCurveTo(-75, 150, 75, 150, 75, 50);
    this.ctx.restore();

    this.ctx.lineWidth      =   2;
    this.ctx.strokeStyle    =   'white';
    this.ctx.stroke();
};

ImageLoader.prototype.calcCenter    =   function () {
    var img_center_x    =   this.initial_w / 2;
    var img_center_y    =   this.new_h / 2;

    this.img_x_pos      =   this.center_x - img_center_x;
    this.img_y_pos      =   this.center_y - img_center_y;
};

ImageLoader.prototype.mouseDown     =   function (e) {
    var r           =   img_loader.canvas.getBoundingClientRect();

    img_loader.mouseX     =   (e.clientX - r.left) - img_loader.pos.deltaX;
    img_loader.mouseY     =   (e.clientY - r.top) - img_loader.pos.deltaY;
    img_loader.dragging   =   true;
};

ImageLoader.prototype.mouseMove     =   function (e) {
    if(img_loader.dragging) {
        var r       =   img_loader.canvas.getBoundingClientRect();
        var x       =   e.clientX - r.left;
        var y       =   e.clientY - r.top;
        img_loader.pos.deltaX    =   (x - img_loader.mouseX);
        img_loader.pos.deltaY    =   (y - img_loader.mouseY);

        img_loader.ctx.clearRect(0, 0, img_loader.width, img_loader.height);
        img_loader.ctx.drawImage(img_loader.img, img_loader.pos.deltaX, img_loader.pos.deltaY, img_loader.initial_w, img_loader.new_h);
        img_loader.tmp_ctx.clearRect(0, 0, img_loader.width, img_loader.height);
        img_loader.tmp_ctx.drawImage(img_loader.img, img_loader.pos.deltaX, img_loader.pos.deltaY, img_loader.initial_w, img_loader.new_h);

        img_loader.drawFace();
    }
};

ImageLoader.prototype.mouseUp       =   function(e) {
    img_loader.dragging   =   false;
};

var Webgl           =   function(){};
var RINGCOUNT = 160;
var SEPARATION = 30;
var INIT_RADIUS = 50;
var SEGMENTS = 512;
var VOL_SENS = 2;
var BIN_COUNT = 512;

var rings = [];
var levels = [];
var colors = [];
var loopHolder = new THREE.Object3D();
var loopGeom;//one geom for all rings
var perlin = new ImprovedNoise();
var noisePos = 0;
var freqByteData;
var timeByteData;
var head;

Webgl.prototype.init    =   function() {
    document.getElementById('section_upload').style.display =   'none';
    document.getElementById('section_3d').style.display =   'block';
    var distance    =   100;
    container       =   document.getElementById('container');
    container.style.color   =   '#fff';
    container.style.font    =   '13px/20px Arial, sans-serif';

    SCREEN_WIDTH    =   container.offsetWidth || window.innerWidth;
    SCREEN_HEIGHT   =   container.offsetHeight || window.innerHeight;
    scene           =   new THREE.Scene();
    camera          =   new THREE.PerspectiveCamera( 70, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1000);
    camera.position.z   =   400;
    camera.target       =   new THREE.Vector3( 0, 0, 0 );
    scene.add(camera);

    var ambientLight = new THREE.AmbientLight( 0x000000 );
	scene.add( ambientLight );

	var lights = [];
	lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

	lights[ 0 ].position.set( 0, 200, 0 );
	lights[ 1 ].position.set( 100, 200, 100 );
	lights[ 2 ].position.set( - 100, - 200, - 100 );

	scene.add( lights[ 0 ] );
	scene.add( lights[ 1 ] );
	scene.add( lights[ 2 ] );
    renderer    =   new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
    controls        =   new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping  =   true;
    controls.dampingFactor  =   0.25;
    controls.enableZoom     =   false;
    var loader  =   new THREE.OBJLoader();
    var texture = THREE.ImageUtils.loadTexture(data_img, new THREE.UVMapping(), function() {
        texture.needsUpdate = true;
        material = new THREE.MeshBasicMaterial({color: 0x2194CE});
        loader.load('/models/head_mesh.obj', function(object) {
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                }
            });
            object.scale.x    =   object.scale.y    =   object.scale.z = 100;
            head    =   object;
            scene.add(object);
        });
    });

    rings = [];
	levels = [];
	colors = [];

    ////////INIT audio in
	freqByteData = new Uint8Array(audio.analyser.frequencyBinCount);
	timeByteData = new Uint8Array(audio.analyser.frequencyBinCount);


	//create ring geometry
	var loopShape = new THREE.Shape();
	loopShape.absarc( 0, 0, INIT_RADIUS, 0, Math.PI*2, false );
	loopGeom = loopShape.createPointsGeometry(SEGMENTS/2);
	loopGeom.dynamic = true;


    var scale = 1;
	for(var i = 0; i < RINGCOUNT; i++) {

		var m = new THREE.LineBasicMaterial( { color: 0xffffff,
			linewidth: 1 ,
			opacity : 0.7,
			blending : THREE.AdditiveBlending,
			depthTest : false,
			transparent : true
		});

		var line = new THREE.Line( loopGeom, m);

		rings.push(line);
		scale *= 1.05;
		line.scale.x = scale;
		line.scale.y = scale;
		loopHolder.add(line);

		levels.push(0);
		colors.push(0);

	}
    loopHolder.position.z = -340;
    scene.add(loopHolder);
    renderer.autoClear  =   false;
    renderer.setClearColor(0x000000, 0.0);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.sortObjects    =   true;

    //renderer.domElement.style.position  =   'absolute';
    audio.audioElement.play();
    document.getElementById('btn_play').setAttribute('disabled', true);
    document.getElementById('btn_pause').removeAttribute('disabled', true);
    
    container.appendChild(renderer.domElement);
    function animate() {
		requestAnimationFrame( animate );
		render();
	}

    function render() {
        audio.analyser.getByteFrequencyData(freqByteData);
		audio.analyser.getByteTimeDomainData(timeByteData);

		//add a new average volume onto the list
		var sum = 0;
        var amp = 0;
		for(var i = 0; i < BIN_COUNT; i++) {
            var loud = Math.abs(freqByteData[i]);
			sum += freqByteData[i];
            if(loud > amp)
                amp =   loud;
		}

        if(amp != 0)
            head.scale.x = head.scale.y = head.scale.z =  amp / 2 + 0.5;
        else
            head.scale.x = head.scale.y = head.scale.z =  100;

		var aveLevel = sum / BIN_COUNT;
		var scaled_average = (aveLevel / 256) * VOL_SENS; //256 is the highest a level can be
		levels.push(scaled_average);
		levels.shift(1);

		//add a new color onto the list
		noisePos += 0.005;
		var n = Math.abs(perlin.noise(noisePos, 0, 0));
		colors.push(n);
		colors.shift(1);

		//write current waveform into all rings
		for(var j = 0; j < SEGMENTS; j++) {
			loopGeom.vertices[j].z = timeByteData[j]*2;//stretch by 2
		}
		// link up last segment
		loopGeom.vertices[SEGMENTS].z = loopGeom.vertices[0].z;
		loopGeom.verticesNeedUpdate = true;

		for( i = 0; i < RINGCOUNT ; i++) {
			var ringId = RINGCOUNT - i - 1;
			var normLevel = levels[ringId] + 0.01; //avoid scaling by 0
			var hue = colors[i];
			rings[i].material.color.setHSL(hue, 1, normLevel);
			rings[i].material.linewidth = normLevel*3;
			rings[i].material.opacity = normLevel;
			rings[i].scale.z = normLevel;
		}

        renderer.clear();
		renderer.render( scene, camera );
	}
    animate();
};

var audio, frequencyData;
var Audio   =   function(){
    var audioCtx        =   null;
    var audioElement    =   null;
    var audioSrc        =   null;
    var analyser        =   null;
};

Audio.prototype.init    =   function()
{
    this.audioCtx       =   new (window.AudioContext || window.webkitAudioContext)();
    this.audioElement   =   document.getElementById('audioElement');
    this.audioSrc       =   this.audioCtx.createMediaElementSource(audioElement);
    this.analyser       =   this.audioCtx.createAnalyser();

    // Bind our analyser to the media element source.
    this.audioSrc.connect(this.analyser);
    this.audioSrc.connect(this.audioCtx.destination);
    this.bindControlEvents();
};

Audio.prototype.bindControlEvents   =   function()
{
    var _this   =   this;

    document.getElementById('btn_play').onclick         =   function(e) {
        e.preventDefault();

        _this.audioElement.play();
        document.getElementById('btn_play').setAttribute('disabled', true);
        document.getElementById('btn_pause').removeAttribute('disabled', true);
    };

    document.getElementById('btn_pause').onclick        =   function(e) {
        e.preventDefault();

        _this.audioElement.pause();
        document.getElementById('btn_pause').setAttribute('disabled', true);
        document.getElementById('btn_play').removeAttribute('disabled', true);
    };

    document.getElementById('btn_volume_plus').onclick  =   function(e) {
        e.preventDefault();

        var volume  =   _this.audioElement.volume;

        if(volume == 1)
            return false;

        _this.audioElement.volume   +=  0.1;
        _this.manageVolumeButtons();
    };

    document.getElementById('btn_volume_minus').onclick =   function(e) {
        e.preventDefault();

        var volume  =   _this.audioElement.volume;
        volume      =   Math.round( volume * 10 ) / 10;
        if(volume == 0)
            return false;

        _this.audioElement.volume   -=  0.1;
        _this.manageVolumeButtons();
    };

    this.manageVolumeButtons();
};

Audio.prototype.manageVolumeButtons     =   function() {
    var volume  =   this.audioElement.volume;
    volume      =   Math.round( volume * 10 ) / 10;

    if(volume == 1)
        document.getElementById('btn_volume_plus').setAttribute('disabled', true);
    else if(volume == 0)
        document.getElementById('btn_volume_minus').setAttribute('disabled', true);
    else {
        document.getElementById('btn_volume_plus').removeAttribute('disabled');
        document.getElementById('btn_volume_minus').removeAttribute('disabled');
    }
};

var img_loader      =   new ImageLoader();
var webgl           =   new Webgl();
audio               =   new Audio();

window.onload       =   function() {
    document.body.style.backgroundImage	=	'none';
    img_loader.init();
};

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
    this.analyser.smoothingTimeConstant = 0.1;
	this.analyser.fftSize = 1024;
    // Bind our analyser to the media element source.
    this.audioSrc.connect(this.analyser);
    this.audioSrc.connect(this.audioCtx.destination);
    frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
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

var cube, cubeMaterial,cubeGeometry;
var scene, camera, renderer;
var controls, guiControls, datGUI;
var axis, grid, color, fov;
var spotLight;
var stats;
var SCREEN_WIDTH, SCREEN_HEIGHT;

function init() {
    scene       =   new THREE.Scene();
    camera      =   new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, .1, 500);
    renderer    =   new THREE.WebGLRenderer({antialias:true});
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled= true;
    renderer.shadowMapSoft = true;
    /*add controls*/
    //controls    =   new THREE.OrbitControls( camera, renderer.domElement );
    //controls.addEventListener('change', render);
    grid        =   new THREE.GridHelper(50, 5);
    color       =   new THREE.Color('rgb(255,0,0)');
    grid.setColors(color, 0x000000);
    var x   =   0, y    =   0, z    =   0;

    for  (var i=0;i < 1000; i++){
        cubeGeometry        =   new THREE.BoxGeometry(3, 3, 3);
        cubeMaterial        =   new THREE.MeshPhongMaterial({color:frequencyData[i]*0xff3300});
        cube                =   new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow     =   true;
        cube.receiveShadow  =   true;
        cube.name           =   frequencyData.length;
        cube.position.x     =   x;

        x += 10;

        if ( x == 100){
            z += 10;
            x = 0;
        }
        else if (z == 100){
            x = 0;
            y += 10;
            z = 0;
        }
        cube.position.y = y;
        cube.position.z = z;
        scene.add(cube);
    }


    camera.position.x   =   50;
    camera.position.y   =   50;
    camera.position.z   =   50;
    camera.lookAt(scene.position);

    /*datGUI controls object*/
    guiControls = new function(){
        this.rotationX  = 0.0;
        this.rotationY  = 0.0;
        this.rotationZ  = 0.0;

        this.lightX = 127;
        this.lightY = 152;
        this.lightZ = 127;
        this.intensity = 3.8;
        this.distance = 1000;
        this.angle = 1.60;
        this.exponent = 2;
        this.shadowCameraNear = 2;
        this.shadowCameraFar = 434;
        this.shadowCameraFov = 46;
        this.shadowCameraVisible=false;
        this.shadowMapWidth=2056;
        this.shadowMapHeight=2056;
        this.shadowBias=0.00;
        this.shadowDarkness=0.5;
        this.target = cube;

    }

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add(light);
    var directionalLight = new THREE.DirectionalLight( 0xff0000, 0.5 );
    directionalLight.position.set( 1, 1,1 );
    scene.add( directionalLight );
    container.appendChild(renderer.domElement);

    fov = camera.fov, zoom = 1.0, inc = -0.01;
}

function animate() {
    requestAnimationFrame(animate);
    render();

    renderer.render(scene, camera);
}
var i = 1;
function render() {
    scene.traverse(function (e){
        if (e instanceof THREE.Mesh){
            e.rotation.x += frequencyData[50]/1000;
            e.rotation.y = frequencyData[e.id]/50;
            //e.rotation.z += guiControls.rotationZ;
            var color = new THREE.Color(1,0,0);
            e.material.color.setRGB(frequencyData[e.id]/255,0,0);
        }
    });
    guiControls.intensity = frequencyData[2];
    /*spotLight.position.x = guiControls.lightX;
    spotLight.position.y = guiControls.lightY;
    spotLight.position.z = guiControls.lightZ;*/
    audio.analyser.getByteFrequencyData(frequencyData);
    camera.fov = fov * zoom;
    camera.updateProjectionMatrix();
    zoom += inc;
    if ( zoom <= 0.1*(frequencyData[20]/100) || zoom >= 1*(frequencyData[20]/50) ){
        inc = -inc;
    }
    camera.rotation.y = 90 * Math.PI / 180;
    camera.rotation.z = frequencyData[20] * Math.PI / 180;
    camera.rotation.x = frequencyData[100] * Math.PI / 180;
    //if(i % 20 == 0)
    //    console.log(frequencyData);

    //i++;
}

function onWindowResize() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
}

if( ! Detector.webgl) {
	Detector.addGetWebGLMessage();
	document.body.style.backgroundImage	=	'none';
}
else {
    document.body.style.backgroundImage	=	'none';
    audio   =   new Audio();

    audio.init();
    audio.bindControlEvents();
    init();
    animate();
    window.addEventListener('resize', onWindowResize, false);
}
